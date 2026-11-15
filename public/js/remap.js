// Scale remapping: move a song's notes from the scale it was written in to another one.
// Pure logic, no DOM. The reasoning and sources are in docs/REMIX.md.
//
// A map is 12 numbers: for each semitone above the old root, how far above the new
// root it should sound (a float, so microtonal targets work; 12 = the root an octave up).
//
//   1. Scale notes go by degree when both scales have the same number of notes
//      (major → minor lowers 3, 6 and 7: the classic parallel-mode swap).
//   2. With a different number of notes, degrees are aligned in order (no voice
//      crosses another) so that the notes the song uses most move the least.
//      Fewer notes in the target: neighbours merge. More: some target notes stay unused.
//   3. Notes outside the old scale keep their place between their two neighbours and
//      land on the nearest note of the new scale there (or, with `keep`, the nearest
//      semitone, so a passing note stays a passing note). Between two neighbours that
//      do not move, it does not move either.
//   Ties go to the note nearer the original pitch, then down when the new scale is darker than the old one and up when it is brighter.

const mod = (a, n) => ((a % n) + n) % n;
const EPS = 1e-3;

export function buildMap(src, dst, weights = null, { keep = false } = {}) {
  const S = [...new Set([0, ...src.map(s => mod(Math.round(s), 12))])].sort((a, b) => a - b);
  const D = [...new Set([0, ...dst.map(d => Math.round(mod(d, 12) * 1000) / 1000)])].sort((a, b) => a - b);
  const n = S.length, m = D.length, T = [...D, 12];
  const w = s => (weights ? weights[s] || 0 : 1) + 0.05;
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  const dir = mean(D) > mean(S) + 1e-9 ? 1 : -1;          // brighter target: ties go up
  const cost = (s, t) => w(s) * Math.abs(s - t) - EPS * dir * (t - s);

  // Order-preserving alignment of old degrees onto new ones (root stays the root).
  const f = Array(n).fill(0);
  if (n === m) S.forEach((_, i) => { f[i] = D[i]; });
  else {
    const INF = 1e9, C = Array.from({ length: n }, () => Array(m + 1).fill(INF)), B = Array.from({ length: n }, () => Array(m + 1).fill(-1));
    C[0][0] = 0;
    for (let i = 1; i < n; i++) for (let j = 0; j <= m; j++) {
      // fewer target notes: stay on j or step to the next (every note gets used);
      // more target notes: always move on, skipping where that is cheaper
      const from = n > m ? [j, j - 1] : Array.from({ length: j }, (_, k) => k);
      for (const k of from) if (k >= 0 && C[i - 1][k] < INF) {
        const c = C[i - 1][k] + cost(S[i], T[j]);
        if (c < C[i][j]) { C[i][j] = c; B[i][j] = k; }
      }
    }
    let j = 0, best = INF;
    for (let k = n > m ? m - 1 : 0; k <= m; k++) if (C[n - 1][k] < best) { best = C[n - 1][k]; j = k; }
    for (let i = n - 1; i > 0; i--) { f[i] = T[j]; j = B[i][j]; }
  }

  const map = Array(12).fill(0);
  S.forEach((s, i) => { map[s] = f[i]; });
  const anchors = [...S.map((s, i) => [s, f[i]]), [12, 12]];
  for (let c = 1; c < 12; c++) {
    if (S.includes(c)) continue;
    const hi = anchors.findIndex(a => a[0] > c), [s0, a] = anchors[hi - 1], [s1, b] = anchors[hi];
    if (a === s0 && b === s1) { map[c] = c; continue; }         // both neighbours stay put: so does the note between them
    const p = a + (c - s0) / (s1 - s0) * (b - a);
    let cand;
    if (keep) cand = Array.from({ length: Math.floor(b) - Math.ceil(a) + 1 }, (_, k) => Math.ceil(a) + k);
    else {
      cand = T.filter(t => t > a + 1e-6 && t < b - 1e-6);       // a note of its own between the neighbours, if there is one
      if (!cand.length) cand = [a, b];
    }
    if (!cand.length) cand = [a];
    let best = cand[0], bd = Infinity;
    for (const t of cand) { const d = Math.abs(t - p) + 0.01 * Math.abs(t - c) - EPS * dir * (t - p); if (d < bd) { bd = d; best = t; } }   // nearest; then least moved
    map[c] = best;
  }
  return map;
}

// One note through a map. `root` is the old root (pitch class), `shift` moves the root (semitones).
export function mapNote(midi, root, map, shift = 0) {
  const rel = mod(Math.round(midi) - root, 12);
  return midi - rel + map[rel] + shift;
}

// ---- finding the scale of a song that arrives without one (a plain MIDI file) ----
// Krumhansl-Kessler key profiles: correlate how long each pitch class sounds with the
// major and minor profile on every root.
const KK = {
  major: [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88],
  minor: [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17],
};
function corr(a, b) {
  const ma = a.reduce((x, y) => x + y, 0) / 12, mb = b.reduce((x, y) => x + y, 0) / 12;
  let n = 0, da = 0, db = 0;
  for (let i = 0; i < 12; i++) { n += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; }
  return da && db ? n / Math.sqrt(da * db) : 0;
}
export function histogram(notes, t0 = -Infinity, t1 = Infinity) {
  const h = Array(12).fill(0);
  for (const [t, d, p] of notes) if (t >= t0 && t < t1) h[mod(Math.round(p), 12)] += Math.min(d, 2);
  return h;
}
export function keyScores(h) {
  const out = [];
  for (const mode of ['major', 'minor']) for (let r = 0; r < 12; r++) out.push({ root: r, mode, score: corr(h, KK[mode].map((_, i) => KK[mode][mod(i - r, 12)])) });
  return out.sort((a, b) => b.score - a.score);
}
// [{t0, t1, root, mode}]: the song's key, and any window (about 16 s) that clearly leaves it.
export function detectLane(notes, seconds, win = 16, margin = 0.12) {
  const main = keyScores(histogram(notes))[0];
  if (!main || !notes.length) return [{ t0: 0, t1: seconds, root: 0, mode: 'major' }];
  const lane = [];
  const k = Math.max(1, Math.round(seconds / win)), len = seconds / k;
  for (let i = 0; i < k; i++) {
    const h = histogram(notes, i * len, (i + 1) * len);
    let pick = main;
    if (h.reduce((x, y) => x + y, 0) > 2) {
      const sc = keyScores(h), mine = sc.find(s => s.root === main.root && s.mode === main.mode);
      if (sc[0].score - mine.score > margin) pick = sc[0];
    }
    const last = lane[lane.length - 1];
    if (last && last.root === pick.root && last.mode === pick.mode) last.t1 = (i + 1) * len;
    else lane.push({ t0: i * len, t1: (i + 1) * len, root: pick.root, mode: pick.mode });
  }
  return lane;
}
