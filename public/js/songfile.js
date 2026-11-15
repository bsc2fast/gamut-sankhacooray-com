// Song input for the remix player: a Cadence note export (JSON), a standard MIDI
// file, or the built-in demo. Everything becomes one shape:
//   { title, artist, seconds, tracks: [{ id, name, kind, notes: [[t, dur, midi, vel]] }],
//     lane: [{ t0, t1, root, id?, steps?, mode? }] }      (lane may be empty: it is then detected)
// kind: vocals | bass | guitar | piano | other | drums | mix

const KINDS = ['vocals', 'bass', 'guitar', 'piano', 'other', 'drums', 'mix'];
const mod = (a, n) => ((a % n) + n) % n;

export function fromCadence(j) {
  if (j?.format !== 'cadence-notes' || !Array.isArray(j.tracks)) throw new Error('Not a Cadence note export');
  const tracks = j.tracks.filter(t => t.notes?.length).map(t => ({
    id: String(t.id), name: t.name || t.id, kind: KINDS.includes(t.kind) ? t.kind : 'other',
    notes: t.notes.map(n => [+n[0], +n[1], +n[2], n[3] == null ? 0.8 : +n[3]]).filter(n => n.every(Number.isFinite)).sort((a, b) => a[0] - b[0]),
  }));
  const end = Math.max(0, ...tracks.map(t => { const n = t.notes[t.notes.length - 1]; return n ? n[0] + n[1] : 0; }));
  const lane = (j.lane || []).filter(s => s.t1 > s.t0 && Number.isInteger(s.root)).map(s => ({
    t0: s.t0, t1: s.t1, root: s.root, id: s.id,
    steps: Array.isArray(s.notes) ? s.notes.map(p => mod(p - s.root, 12)).sort((a, b) => a - b) : null,   // Cadence stores absolute pitch classes
  }));
  return { title: j.title || 'Song', artist: j.artist || '', seconds: Math.max(+j.seconds || 0, end), tracks, lane };
}

// ---- standard MIDI file ----
const GM_KIND = p => p >= 32 && p <= 39 ? 'bass' : p >= 24 && p <= 31 ? 'guitar' : p <= 7 ? 'piano' : (p >= 52 && p <= 54) || (p >= 64 && p <= 79) ? 'vocals' : 'other';
const KIND_NAME = { vocals: 'Lead', bass: 'Bass', guitar: 'Guitar', piano: 'Piano', other: 'Other', drums: 'Drums', mix: 'Notes' };

export function fromMidi(buf, name = 'MIDI file') {
  const d = new DataView(buf), u8 = new Uint8Array(buf);
  const str = (o, n) => String.fromCharCode(...u8.subarray(o, o + n));
  if (str(0, 4) !== 'MThd') throw new Error('Not a MIDI file');
  const ntr = d.getUint16(10), div = d.getUint16(12);
  if (div & 0x8000) throw new Error('SMPTE-timed MIDI files are not supported');
  let o = 8 + d.getUint32(4);
  const tempos = [[0, 500000]], raw = [];
  for (let k = 0; k < ntr && o + 8 <= u8.length; k++) {
    const len = d.getUint32(o + 4), end = o + 8 + len;
    if (str(o, 4) !== 'MTrk') { o = end; continue; }
    let p = o + 8, tick = 0, status = 0, tname = '';
    const vlq = () => { let v = 0, b; do { b = u8[p++]; v = (v << 7) | (b & 127); } while (b & 128 && p < end); return v; };
    const open = new Map(), prog = {}, notes = [];
    while (p < end) {
      tick += vlq();
      let b = u8[p];
      if (b & 128) { status = b; p++; } else b = status;
      if (b === 0xff) {
        const type = u8[p++], n = vlq();
        if (type === 0x51 && n === 3) tempos.push([tick, (u8[p] << 16) | (u8[p + 1] << 8) | u8[p + 2]]);
        if (type === 0x03 && !tname) tname = new TextDecoder().decode(u8.subarray(p, p + n)).trim();
        p += n;
      } else if (b === 0xf0 || b === 0xf7) { p += vlq(); }
      else {
        const hi = b & 0xf0, ch = b & 15, a = u8[p++], v = hi === 0xc0 || hi === 0xd0 ? 0 : u8[p++];
        const key = ch * 128 + a;
        if (hi === 0xc0) prog[ch] = a;
        if (hi === 0x90 && v > 0) { if (!open.has(key)) open.set(key, [tick, v]); }
        else if (hi === 0x80 || hi === 0x90) {
          const on = open.get(key);
          if (on) { notes.push({ ch, p: a, on: on[0], off: tick, v: on[1] / 127 }); open.delete(key); }
        }
      }
    }
    for (const [key, on] of open) notes.push({ ch: key >> 7, p: key & 127, on: on[0], off: tick, v: on[1] / 127 });
    raw.push({ tname, prog, notes });
    o = end;
  }
  tempos.sort((a, b) => a[0] - b[0]);
  const secs = tick => {                                    // ticks → seconds through the tempo map
    let t = 0, last = 0, us = 500000;
    for (const [tk, u] of tempos) { if (tk >= tick) break; t += (tk - last) / div * us / 1e6; last = tk; us = u; }
    return t + (tick - last) / div * us / 1e6;
  };
  const tracks = [];
  raw.forEach((tr, i) => {
    const byCh = new Map();
    for (const n of tr.notes) { if (!byCh.has(n.ch)) byCh.set(n.ch, []); byCh.get(n.ch).push(n); }
    for (const [ch, ns] of byCh) {
      const kind = ch === 9 ? 'drums' : GM_KIND(tr.prog[ch] ?? 0);
      tracks.push({
        id: `t${i}c${ch}`, name: tr.tname || KIND_NAME[kind], kind,
        notes: ns.map(n => { const t = secs(n.on); return [t, Math.max(0.05, secs(n.off) - t), n.p, n.v]; }).sort((a, b) => a[0] - b[0]),
      });
    }
  });
  if (!tracks.length) throw new Error('No notes in this MIDI file');
  // A file with one pitched part has nothing to tell apart: call it the notes.
  const pitched = tracks.filter(t => t.kind !== 'drums');
  if (pitched.length === 1) pitched[0].kind = pitched[0].kind === 'other' ? 'mix' : pitched[0].kind;
  const seconds = Math.max(...tracks.map(t => { const n = t.notes[t.notes.length - 1]; return n[0] + n[1]; }));
  return { title: name.replace(/\.(mid|midi)$/i, ''), artist: '', seconds, tracks, lane: [] };
}

export async function fromFile(file) {
  const buf = await file.arrayBuffer();
  if (new TextDecoder().decode(new Uint8Array(buf, 0, 4)) === 'MThd') return fromMidi(buf, file.name);
  let j;
  try { j = JSON.parse(new TextDecoder().decode(buf)); } catch (e) { throw new Error('Choose a MIDI file or a Cadence note export'); }
  return fromCadence(j);
}

// ---- demo: "Happy Birthday to You" (public domain), C major, 3/4 ----
export function demo() {
  const B = 60 / 104;                                       // one beat
  const mel = [
    [67, .75], [67, .25], [69, 1], [67, 1], [72, 1], [71, 2],
    [67, .75], [67, .25], [69, 1], [67, 1], [74, 1], [72, 2],
    [67, .75], [67, .25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 1],
    [77, .75], [77, .25], [76, 1], [72, 1], [74, 1], [72, 2],
  ];
  const lead = []; let t = 2;                               // the pickup falls on beat 3 of a first bar
  for (const [p, b] of mel) { lead.push([t * B, b * B * .92, p, .9]); t += b; }
  // one chord per bar from bar 2 (beat 3): C G G C C F C/G C
  const bars = [[[48, 52, 55]], [[43, 50, 55]], [[43, 50, 55]], [[48, 52, 55]], [[48, 52, 55]], [[41, 53, 57]], [[48, 52, 55], [43, 50, 55]], [[48, 52, 55]]];
  const keys = [], bass = [];
  bars.forEach((ch, i) => {
    const b0 = 3 + i * 3;
    ch.forEach((c, k) => {
      const at = b0 + (ch.length === 2 ? k * 2 : 0), len = ch.length === 2 ? (k ? 1 : 2) : 3;
      c.forEach(p => keys.push([at * B, len * B * .95, p + 12, .5]));
      bass.push([at * B, len * B * .9, c[0] - 12, .8]);
    });
  });
  return {
    title: 'Happy Birthday', artist: 'Demo', seconds: 27 * B + 1,
    tracks: [{ id: 'lead', name: 'Melody', kind: 'vocals', notes: lead }, { id: 'keys', name: 'Chords', kind: 'piano', notes: keys }, { id: 'bass', name: 'Bass', kind: 'bass', notes: bass }],
    lane: [{ t0: 0, t1: 27 * B + 1, root: 0, id: 'ionian', steps: [0, 2, 4, 5, 7, 9, 11] }],
  };
}
