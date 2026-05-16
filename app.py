from flask import Flask, render_template, jsonify, request
from music_theory import (
    get_diatonic_chords, get_progression,
    get_all_keys, COMMON_PROGRESSIONS, SCALE_INTERVALS,
)

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/chords')
def api_chords():
    key = request.args.get('key', 'C')
    scale_type = request.args.get('scale', 'major')
    sevenths = request.args.get('sevenths', 'false').lower() == 'true'
    try:
        return jsonify(get_diatonic_chords(key, scale_type, sevenths))
    except ValueError as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/progression')
def api_progression():
    key = request.args.get('key', 'C')
    name = request.args.get('name', 'I – V – vi – IV')
    sevenths = request.args.get('sevenths', 'false').lower() == 'true'
    try:
        return jsonify(get_progression(key, name, sevenths))
    except ValueError as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/meta')
def api_meta():
    return jsonify({
        'keys': get_all_keys(),
        'progressions': list(COMMON_PROGRESSIONS.keys()),
        'scales': list(SCALE_INTERVALS.keys()),
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
