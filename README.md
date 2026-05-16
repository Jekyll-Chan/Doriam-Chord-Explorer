# 🎹 Doriam the Chord Explorer

> Interactive piano chord explorer built on Music Theory — all diatonic chords, 7th extensions, and common progressions for every key, with real piano audio playback.
> Feel free to contact me about Doriam 💖 : flyawaypencil480@gmail.com
> “Hey，有个男孩的曾经，小小的手和老钢琴，故事展开了美丽” ———— 《Black Keys》JJ Lin

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-3.x-lightgrey?logo=flask)
![Tone.js](https://img.shields.io/badge/Tone.js-14.8-orange)

---

## Features

- **All 12 keys** with sharp/flat notation handled correctly
- **Diatonic triads & 7th chords** (I–vii) for major and 4 other scale modes
- **10 common progressions** — I–V–vi–IV, ii–V–I, 12-bar Blues, and more
- **Real piano audio** via Salamander Grand Piano samples (Tone.js)
- **Interactive piano keyboard** — 2 octaves, click individual keys or chords
- **Chord progression player** — BPM control, loop toggle, live keyboard highlight
- **Premium dark UI** — grain overlay, refined typography, smooth animations

## Quick Start

```bash
git clone this repo
cd into your prepared folder
pip install flask
python app.py
```

Open `http://localhost:5000` in your browser 🎯

## Music Theory Coverage

| Category | Details |
|---|---|
| Keys | C G D A E B F# / F Bb Eb Ab Db |
| Scales | major · natural minor · harmonic minor · dorian · mixolydian |
| Triad qualities | major · minor · diminished · augmented |
| 7th qualities | maj7 · min7 · dom7 · half-dim7 · dim7 |
| Progressions | I–V–vi–IV · I–IV–V–I · ii–V–I · vi–IV–I–V · 12-bar Blues · + more |


## API Endpoints

| Method | Path | Params |
|---|---|---|
| GET | `/api/meta` | — |
| GET | `/api/chords` | `key`, `scale`, `sevenths` |
| GET | `/api/progression` | `key`, `name`, `sevenths` |

## Credits
Piano samples: [Salamander Grand Piano](https://freepats.zenvoid.org/Piano/acoustic-grand-piano.html) by Alexander Holm (CC BY 3.0)
