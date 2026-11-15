// Play-along assist: how keys of a MIDI keyboard map onto the selected scale.
// Pure logic, no DOM. Research notes and sources are in docs/ASSIST.md.
//
// Modes
//   free   every key sounds as played; the wheel shows hits and misses
//   snap   keys outside the scale play the nearest scale note
//   mute   keys outside the scale stay silent
//   white  white keys play the scale's notes in order, whatever its size
//   fade   starts as snap, then withdraws help as accuracy rises: snap → mute → free

export const MODES = [
  { id: 'free', name: 'Free', text: 'Every key sounds. The wheel shows hits and misses.' },
  { id: 'snap', name: 'Snap', text: 'Wrong keys play the nearest scale note.' },
  { id: 'mute', name: 'Mute', text: 'Wrong keys stay silent, so you hear only the scale.' },
  { id: 'white', name: 'White keys', text: 'White keys play the scale in order.' },
  { id: 'fade', name: 'Fading guide', text: 'Starts with Snap. Help fades as you improve.' },
];
export const FADE_STAGES = ['snap', 'mute', 'free'];

const near = (a, b) => Math.abs(a - b) < 0.01;
const mod = (a, n) => ((a % n) + n) % n;
const WHITE = [0, 2, 4, 5, 7, 9, 11];

// For each of the 12 keys above the root: { in, step, deg }.
// `in` keys belong to the scale. A microtonal degree (3.5) has no key of its own,
// so it takes the nearest free key as its home: that key plays the true pitch.
// Other keys carry the scale note they would snap to (ties go down).
export function keyMap(steps) {
  const map = Array(12).fill(null);
  steps.forEach((s, i) => { if (near(s, Math.round(s)) && !map[mod(Math.round(s), 12)]) map[mod(Math.round(s), 12)] = { in: true, step: s, deg: i }; });
  steps.forEach((s, i) => {
    if (near(s, Math.round(s))) return;
    const home = [Math.round(s), Math.floor(s), Math.ceil(s)].find(k => k > 0 && k < 12 && !map[k]);
    if (home !== undefined) map[home] = { in: true, step: s, deg: i };
  });
  const targets = [...steps.map((s, i) => [s, i]), [12, 0]];
  for (let k = 0; k < 12; k++) {
    if (map[k]) continue;
    let best = targets[0];
    for (const t of targets) if (Math.abs(t[0] - k) < Math.abs(best[0] - k) - 0.001) best = t;
    map[k] = { in: false, step: best[0], deg: best[1] };
  }
  return map;
}

// What one key press does. Returns { midi (float, or null for silence), deg, ok, snapped }.
// `ok` means the key belongs to the scale; `deg` is the scale degree that sounds.
export function resolve(mode, midi, root, rootMidi, steps, map) {
  if (mode === 'white') {
    const wi = WHITE.indexOf(mod(midi, 12));
    if (wi < 0) return { midi: null, deg: null, ok: false };
    const d = (Math.floor(midi / 12) - 5) * 7 + wi, n = steps.length;
    return { midi: rootMidi + steps[mod(d, n)] + 12 * Math.floor(d / n), deg: mod(d, n), ok: true };
  }
  const rel = mod(midi - root, 12), k = map[rel], base = midi - rel;
  if (k.in) return { midi: base + k.step, deg: k.deg, ok: true };
  if (mode === 'snap') return { midi: base + k.step, deg: k.deg, ok: false, snapped: true };
  if (mode === 'mute') return { midi: null, deg: null, ok: false };
  return { midi, deg: null, ok: false };
}

// Performance-contingent fading. Help steps down once the last WINDOW notes are
// at least UP accurate, and comes back if accuracy drops under DOWN.
export class Fader {
  constructor() { this.reset(); }
  reset() { this.stage = 0; this.hits = []; }
  get mode() { return FADE_STAGES[this.stage]; }
  get accuracy() { return this.hits.length ? this.hits.filter(Boolean).length / this.hits.length : 0; }
  get progress() { return Math.min(1, this.hits.length / Fader.WINDOW) * this.accuracy; }
  // Returns 1 when help fades a step, -1 when it returns, 0 otherwise.
  push(ok) {
    this.hits.push(ok);
    if (this.hits.length > Fader.WINDOW) this.hits.shift();
    if (this.hits.length >= Fader.WINDOW && this.accuracy >= Fader.UP && this.stage < 2) { this.stage++; this.hits = []; return 1; }
    if (this.hits.length >= Fader.WINDOW / 2 && this.accuracy < Fader.DOWN && this.stage > 0) { this.stage--; this.hits = []; return -1; }
    return 0;
  }
}
Fader.WINDOW = 16; Fader.UP = 0.9; Fader.DOWN = 0.6;
