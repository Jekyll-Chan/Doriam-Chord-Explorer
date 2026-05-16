/* ================================================================
   Doriam the CHORD EXPLORER - By Jekyll Chan
   Contact me at: flyawaypencil480@gmail.com
   ================================================================ */

/* ── Constants ── */
const CHROMATIC  = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const FLAT_MAP   = { Db:'C#', Eb:'D#', Gb:'F#', Ab:'G#', Bb:'A#' };
const WHITE_IN_OCT = ['C','D','E','F','G','A','B'];
const BLACK_PER_SLOT = ['C#','D#',null,'F#','G#','A#',null]; // after white key at slot i

const WK_W = 46, WK_H = 148, BK_W = 30, BK_H = 96, KEY_GAP = 2;
const RENDER_OCTAVES = [4, 5];

/* ── State ── */
const S = {
  key: 'C',
  scale: 'major',
  octave: 4,
  sevenths: false,
  diatonic: [],       // array of chord objects
  scaleNotes: [],
  selectedIdx: null,
  progression: null,  // name string
  progChords: [],
  looping: false,
  playing: false,
  bpm: 80,
  playTimer: null,
};

/* ── Piano key registry ── */
let pianoKeys = []; // { note, octave, type:'w'|'b', el }

/* ── Audio ── */
let sampler = null, samplerReady = false;

function dismissLoader(msg) {
  const el = document.getElementById('loader');
  if (el) el.style.display = 'none';
  console.log('[Audio]', msg);
}

async function initSampler() {
  await Tone.start();
  sampler = new Tone.Sampler({
    urls: {
      A0:'A0.mp3',  C1:'C1.mp3',  'D#1':'Ds1.mp3', 'F#1':'Fs1.mp3',
      A1:'A1.mp3',  C2:'C2.mp3',  'D#2':'Ds2.mp3', 'F#2':'Fs2.mp3',
      A2:'A2.mp3',  C3:'C3.mp3',  'D#3':'Ds3.mp3', 'F#3':'Fs3.mp3',
      A3:'A3.mp3',  C4:'C4.mp3',  'D#4':'Ds4.mp3', 'F#4':'Fs4.mp3',
      A4:'A4.mp3',  C5:'C5.mp3',  'D#5':'Ds5.mp3', 'F#5':'Fs5.mp3',
      A5:'A5.mp3',  C6:'C6.mp3',  'D#6':'Ds6.mp3', 'F#6':'Fs6.mp3',
      A6:'A6.mp3',  C7:'C7.mp3',
    },
    release: 1.4,
    baseUrl: '/static/audio/salamander/',
    onload() {
      samplerReady = true;
      dismissLoader('Piano loaded ✓');
    },
    onerror(err) {
      console.warn('Sampler load error, falling back to synth:', err);
      sampler = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 1.2 },
      }).toDestination();
      samplerReady = true;
      dismissLoader('Using synth fallback');
    },
  }).toDestination();

  // Hard timeout — never stay stuck loading
  setTimeout(() => {
    if (!samplerReady) {
      console.warn('Sampler timed out, falling back to synth');
      sampler = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 1.2 },
      }).toDestination();
      samplerReady = true;
      dismissLoader('Using synth fallback');
    }
  }, 6000);
}

/* ── Note helpers ── */
function toSharp(n) { return FLAT_MAP[n] || n; }
function noteIdx(n) { return CHROMATIC.indexOf(toSharp(n)); }

function chordToToneNotes(notes, rootOct = 4) {
  const result = []; let oct = rootOct; let prevIdx = noteIdx(notes[0]);
  for (let i = 0; i < notes.length; i++) {
    const idx = noteIdx(notes[i]);
    if (i > 0 && idx <= prevIdx) oct++;
    result.push(`${CHROMATIC[idx]}${oct}`);
    prevIdx = idx;
  }
  return result;
}

function playChord(notes, dur = '2n') {
  if (!samplerReady) return;
  sampler.triggerAttackRelease(chordToToneNotes(notes, S.octave), dur);
}

function playSingleNote(noteName, oct) {
  if (!samplerReady) return;
  sampler.triggerAttackRelease(`${CHROMATIC[noteIdx(noteName)]}${oct}`, '4n');
}

/* ── Piano rendering ── */
function buildPiano() {
  const container = document.getElementById('piano-keyboard');
  container.innerHTML = '';
  pianoKeys = [];

  let whiteX = 0;
  for (const oct of RENDER_OCTAVES) {
    for (let slot = 0; slot < 7; slot++) {
      const note = WHITE_IN_OCT[slot];

      /* White key */
      const wEl = document.createElement('div');
      wEl.className = 'key-w';
      wEl.style.left = `${whiteX}px`;
      wEl.style.top = '0';
      const wLbl = document.createElement('span');
      wLbl.className = 'key-label';
      wLbl.textContent = slot === 0 ? `${note}${oct}` : note;
      wEl.appendChild(wLbl);
      container.appendChild(wEl);
      const wKey = { note, octave: oct, type: 'w', el: wEl };
      pianoKeys.push(wKey);
      wEl.addEventListener('mousedown', () => {
        playSingleNote(note, oct);
        flashKey(note, oct, 500);
      });

      /* Black key */
      const bn = BLACK_PER_SLOT[slot];
      if (bn) {
        const bEl = document.createElement('div');
        bEl.className = 'key-b';
        bEl.style.left = `${whiteX + WK_W - BK_W / 2}px`;
        bEl.style.top = '0';
        const bLbl = document.createElement('span');
        bLbl.className = 'key-label';
        bLbl.textContent = bn;
        bEl.appendChild(bLbl);
        container.appendChild(bEl);
        const bKey = { note: bn, octave: oct, type: 'b', el: bEl };
        pianoKeys.push(bKey);
        bEl.addEventListener('mousedown', () => {
          playSingleNote(bn, oct);
          flashKey(bn, oct, 500);
        });
      }

      whiteX += WK_W + KEY_GAP;
    }
  }

  const totalW = RENDER_OCTAVES.length * 7 * (WK_W + KEY_GAP) - KEY_GAP;
  container.style.width = `${totalW}px`;
  container.style.height = `${WK_H}px`;
}

function clearPianoHL() {
  pianoKeys.forEach(k => k.el.classList.remove('hl-chord', 'hl-scale'));
}

function highlightPiano(chordNotes = [], scaleNotes = []) {
  clearPianoHL();
  const chordIdxs = new Set(chordNotes.map(noteIdx));
  const scaleIdxs = new Set(scaleNotes.map(noteIdx));
  pianoKeys.forEach(k => {
    const idx = noteIdx(k.note);
    if (chordIdxs.has(idx)) k.el.classList.add('hl-chord');
    else if (scaleIdxs.has(idx)) k.el.classList.add('hl-scale');
  });
}

function flashKey(note, oct, ms) {
  const key = pianoKeys.find(k => k.note === note && k.octave === oct);
  if (!key) return;
  key.el.classList.add('hl-chord');
  setTimeout(() => key.el.classList.remove('hl-chord'), ms);
}

/* ── API ── */
async function apiFetch(path) {
  const r = await fetch(path);
  return r.json();
}

async function loadMeta() {
  const d = await apiFetch('/api/meta');
  renderKeySelect(d.keys);
  renderScaleSelect(d.scales);
  renderProgPills(d.progressions);
}

async function loadChords() {
  const d = await apiFetch(
    `/api/chords?key=${S.key}&scale=${S.scale}&sevenths=${S.sevenths}`
  );
  S.diatonic = d.chords;
  S.scaleNotes = d.scale;
  renderScaleStrip();
  renderChordGrid();
  highlightPiano([], S.scaleNotes);
}

async function loadProgression(name) {
  const d = await apiFetch(
    `/api/progression?key=${S.key}&name=${encodeURIComponent(name)}&sevenths=${S.sevenths}`
  );
  S.progChords = d.chords;
  S.progression = name;
  renderProgSequence();
  const panel = document.getElementById('player-panel');
  panel.style.display = 'flex';
}

/* ── Rendering ── */
function renderKeySelect(keys) {
  const sel = document.getElementById('key-select');
  sel.innerHTML = keys.map(k =>
    `<option value="${k}" ${k === S.key ? 'selected' : ''}>${k}</option>`
  ).join('');
  sel.addEventListener('change', async () => {
    S.key = sel.value;
    S.selectedIdx = null;
    stopPlayback();
    await loadChords();
    if (S.progression) await loadProgression(S.progression);
  });
}

function renderScaleSelect(scales) {
  const sel = document.getElementById('scale-select');
  sel.innerHTML = scales.map(s =>
    `<option value="${s}" ${s === S.scale ? 'selected' : ''}>${s.replace(/_/g, ' ')}</option>`
  ).join('');
  sel.addEventListener('change', async () => {
    S.scale = sel.value;
    S.selectedIdx = null;
    await loadChords();
  });
}

function renderScaleStrip() {
  document.getElementById('scale-chips').innerHTML =
    S.scaleNotes.map(n => `<span class="chip">${n}</span>`).join('');
  document.getElementById('key-badge').textContent =
    `${S.key} ${S.scale.replace(/_/g, ' ')}`;
}

function renderChordGrid() {
  const grid = document.getElementById('chord-grid');
  grid.innerHTML = '';
  S.diatonic.forEach((chord, i) => {
    const card = document.createElement('div');
    card.className = `chord-card${i === S.selectedIdx ? ' active' : ''}`;
    card.dataset.q = chord.quality;
    card.innerHTML = `
      <div class="chord-numeral">${chord.numeral}</div>
      <div class="chord-name">${chord.symbol}</div>
      <div class="chord-quality">${chord.quality.replace(/_/g, ' ')}</div>
      <div class="chord-notes-row">
        ${chord.notes.map(n => `<span class="note-tag">${n}</span>`).join('')}
      </div>
    `;
    card.addEventListener('click', () => {
      S.selectedIdx = i;
      document.querySelectorAll('.chord-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      playChord(chord.notes);
      highlightPiano(chord.notes, S.scaleNotes);
      card.classList.add('playing');
      setTimeout(() => card.classList.remove('playing'), 1800);
    });
    grid.appendChild(card);
  });
}

function renderProgPills(progressions) {
  const row = document.getElementById('prog-pills');
  row.innerHTML = '';
  progressions.forEach(name => {
    const pill = document.createElement('button');
    pill.className = 'prog-pill';
    pill.textContent = name;
    pill.addEventListener('click', async () => {
      document.querySelectorAll('.prog-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      stopPlayback();
      await loadProgression(name);
    });
    row.appendChild(pill);
  });
}

function renderProgSequence() {
  const seq = document.getElementById('prog-sequence');
  seq.innerHTML = S.progChords.map((chord, i) => `
    ${i > 0 ? '<span class="seq-arrow">›</span>' : ''}
    <div class="seq-badge" data-si="${i}">
      ${chord.symbol}
      <small>${chord.numeral}</small>
    </div>
  `).join('');
}

function activateSeqBadge(idx) {
  document.querySelectorAll('.seq-badge').forEach((b, i) => {
    b.classList.toggle('active', i === idx);
  });
}

function activateChordCard(symbol) {
  document.querySelectorAll('.chord-card').forEach((c, i) => {
    c.classList.toggle('active', S.diatonic[i]?.symbol === symbol);
  });
}

/* ── Playback ── */
function stopPlayback() {
  if (S.playTimer) { clearTimeout(S.playTimer); S.playTimer = null; }
  S.playing = false;
  const btn = document.getElementById('play-btn');
  btn.textContent = '▶ Play';
  btn.classList.remove('paused');
  document.querySelectorAll('.seq-badge').forEach(b => b.classList.remove('active'));
  highlightPiano([], S.scaleNotes);
  document.querySelectorAll('.chord-card').forEach(c => c.classList.remove('active'));
}

function startPlayback() {
  if (!samplerReady || !S.progChords.length) return;
  S.playing = true;
  const btn = document.getElementById('play-btn');
  btn.textContent = '⏸ Pause';
  btn.classList.add('paused');

  const beatMs  = (60 / S.bpm) * 1000;
  const chordMs = beatMs * 2;   // 2 beats per chord

  let idx = 0;
  function step() {
    if (!S.playing) return;
    if (idx >= S.progChords.length) {
      if (S.looping) idx = 0;
      else { stopPlayback(); return; }
    }
    const chord = S.progChords[idx];
    activateSeqBadge(idx);
    activateChordCard(chord.symbol);
    highlightPiano(chord.notes, S.scaleNotes);
    playChord(chord.notes, '2n');
    idx++;
    S.playTimer = setTimeout(step, chordMs);
  }
  step();
}

/* ── Wire-up ── */
document.addEventListener('DOMContentLoaded', async () => {
  // Dismiss loader immediately — audio initializes on first interaction
  dismissLoader('UI ready');

  buildPiano();
  await loadMeta();
  await loadChords();

  // Lazy audio init on first click anywhere
  document.addEventListener('click', async () => {
    if (!sampler) await initSampler();
  }, { once: true });

  /* Octave */
  document.getElementById('octave-select').addEventListener('change', e => {
    S.octave = parseInt(e.target.value);
  });

  /* 7ths toggle */
  document.getElementById('sevenths-toggle').addEventListener('change', async e => {
    S.sevenths = e.target.checked;
    await loadChords();
    if (S.progression) await loadProgression(S.progression);
  });

  /* BPM */
  const bpmSlider = document.getElementById('bpm-slider');
  bpmSlider.addEventListener('input', () => {
    S.bpm = parseInt(bpmSlider.value);
    document.getElementById('bpm-val').textContent = S.bpm;
  });

  /* Transport */
  document.getElementById('play-btn').addEventListener('click', async () => {
    await Tone.start();
    if (S.playing) stopPlayback();
    else startPlayback();
  });

  document.getElementById('loop-btn').addEventListener('click', () => {
    S.looping = !S.looping;
    const btn = document.getElementById('loop-btn');
    btn.classList.toggle('on', S.looping);
    btn.title = S.looping ? 'Loop ON' : 'Loop OFF';
  });

  document.getElementById('stop-btn').addEventListener('click', stopPlayback);
});
