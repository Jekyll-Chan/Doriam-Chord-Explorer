"""
Music Theory Engine — Heart of Doriam~🥰🥰🥰
Diatonic triads/7ths, scales, common progressions for all 12 keys.
"""

CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
FLAT_EQUIV = {'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb'}
SHARP_EQUIV = {v: k for k, v in FLAT_EQUIV.items()}

FLAT_KEYS = {'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'}

SCALE_INTERVALS = {
    'major': [0, 2, 4, 5, 7, 9, 11],
    'natural_minor': [0, 2, 3, 5, 7, 8, 10],
    'harmonic_minor': [0, 2, 3, 5, 7, 8, 11],
    'dorian': [0, 2, 3, 5, 7, 9, 10],
    'mixolydian': [0, 2, 4, 5, 7, 9, 10],
}

CHORD_INTERVALS = {
    'major':     [0, 4, 7],
    'minor':     [0, 3, 7],
    'dim':       [0, 3, 6],
    'aug':       [0, 4, 8],
    'maj7':      [0, 4, 7, 11],
    'min7':      [0, 3, 7, 10],
    'dom7':      [0, 4, 7, 10],
    'half_dim7': [0, 3, 6, 10],
    'dim7':      [0, 3, 6, 9],
    'sus2':      [0, 2, 7],
    'sus4':      [0, 5, 7],
}

CHORD_SYMBOLS = {
    'major': '', 'minor': 'm', 'dim': '°', 'aug': '+',
    'maj7': 'maj7', 'min7': 'm7', 'dom7': '7',
    'half_dim7': 'ø7', 'dim7': '°7', 'sus2': 'sus2', 'sus4': 'sus4',
}

# (triad numeral, 7th numeral, triad quality, 7th quality)
MAJOR_DIATONIC = [
    ('I',    'Imaj7',  'major', 'maj7'),
    ('ii',   'ii7',    'minor', 'min7'),
    ('iii',  'iii7',   'minor', 'min7'),
    ('IV',   'IVmaj7', 'major', 'maj7'),
    ('V',    'V7',     'major', 'dom7'),
    ('vi',   'vi7',    'minor', 'min7'),
    ('vii°', 'viiø7',  'dim',   'half_dim7'),
]

COMMON_PROGRESSIONS = {
    'I – V – vi – IV':        [0, 4, 5, 3],
    'I – IV – V – I':         [0, 3, 4, 0],
    'I – vi – IV – V':        [0, 5, 3, 4],
    'ii – V – I':             [1, 4, 0],
    'I – IV – vi – V':        [0, 3, 5, 4],
    'vi – IV – I – V':        [5, 3, 0, 4],
    'I – iii – IV – V':       [0, 2, 3, 4],
    'I – V – vi – iii – IV':  [0, 4, 5, 2, 3],
    'I – IV – I – V':         [0, 3, 0, 4],
    '12-bar Blues':            [0, 0, 0, 0, 3, 3, 0, 0, 4, 3, 0, 4],
}


def note_idx(name: str) -> int:
    n = SHARP_EQUIV.get(name, name)
    if n not in CHROMATIC:
        raise ValueError(f'Unknown note: {name}')
    return CHROMATIC.index(n)


def idx_to_note(idx: int, prefer_flat: bool = False) -> str:
    n = CHROMATIC[idx % 12]
    return FLAT_EQUIV.get(n, n) if prefer_flat and n in FLAT_EQUIV else n


def get_scale(root: str, scale_type: str = 'major') -> list[str]:
    ri = note_idx(root)
    flat = root in FLAT_KEYS
    return [idx_to_note((ri + i) % 12, flat) for i in SCALE_INTERVALS[scale_type]]


def build_chord(root_name: str, quality: str, prefer_flat: bool = False) -> dict:
    ri = note_idx(root_name)
    notes = [idx_to_note((ri + i) % 12, prefer_flat) for i in CHORD_INTERVALS[quality]]
    sym = CHORD_SYMBOLS.get(quality, '')
    return {
        'root': root_name,
        'quality': quality,
        'symbol': f'{root_name}{sym}',
        'notes': notes,
        'intervals': CHORD_INTERVALS[quality],
    }


def get_diatonic_chords(root: str, scale_type: str = 'major', include_7ths: bool = False) -> dict:
    flat = root in FLAT_KEYS
    scale = get_scale(root, scale_type)
    result = []
    for i, (t_num, s_num, t_q, s_q) in enumerate(MAJOR_DIATONIC):
        quality = s_q if include_7ths else t_q
        numeral = s_num if include_7ths else t_num
        chord = build_chord(scale[i], quality, flat)
        chord['numeral'] = numeral
        chord['degree'] = i
        result.append(chord)
    return {'key': root, 'scale_type': scale_type, 'scale': scale, 'chords': result}


def get_progression(root: str, progression_name: str, include_7ths: bool = False) -> dict:
    data = get_diatonic_chords(root, include_7ths=include_7ths)
    chords = data['chords']
    indices = COMMON_PROGRESSIONS.get(progression_name, [0, 4, 5, 3])
    return {
        'key': root,
        'progression': progression_name,
        'chords': [chords[i] for i in indices],
    }


def get_all_keys() -> list[str]:
    return ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db']
