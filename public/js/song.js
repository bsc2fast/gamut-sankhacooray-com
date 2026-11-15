// Remix player: plays a song's notes through Gamut's synths, with every stretch of
// the song moved to whichever scale the listener picks. The mapping itself is in
// remap.js; file formats are in songfile.js; docs/REMIX.md explains the idea.

import { NOTE_NAMES, byId, matches } from './scales.js';
import { buildMap, mapNote, detectLane, histogram } from './remap.js';

const mod = (a, n) => ((a % n) + n) % n;
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const clock = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const sameSteps = (a, b) => a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) < 0.005);
const LEAD_ORDER = ['vocals', 'mix', 'piano', 'guitar', 'other', 'bass'];
const SOUND = {                                             // per kind: synth voice and level
  vocals: ['reed', 1], mix: ['keys', .7], piano: ['keys', .55], guitar: ['pluck', .6], other: ['keys', .4], bass: ['pluck', .95], drums: [null, .8],
};

function scaleFor(seg) {
  if (seg.id && byId[seg.id]) return byId[seg.id];
  const steps = seg.steps || (seg.mode === 'minor' ? byId.aeolian.steps : byId.ionian.steps);
  return matches(steps, null).same[0] || { id: 'custom', name: 'Its own shape', sub: 'From the song', region: 'symmetric', steps, o: '', d: '' };
}

export class Remix {
  // engine: audio Engine. on: { change(), note(midi), state() } callbacks into the app.
  constructor(engine, on) {
    this.engine = engine; this.on = on;
    this.song = null; this.segs = []; this.sel = null;      // sel: segment index, or null for the whole song
    this.playing = false; this.pos = 0; this.speed = 1; this.original = false; this.keep = false;
    this.muted = new Set(); this.leadVoice = null;
    this.roll = $('song-roll');
    this.wire();
  }

  // ---- loading --------------------------------------------------------------
  load(song) {
    this.pause();
    this.song = song; this.pos = 0; this.sel = null; this.original = false; this.muted = new Set();
    const pitched = song.tracks.filter(t => t.kind !== 'drums');
    this.lead = LEAD_ORDER.map(k => pitched.find(t => t.kind === k)).find(Boolean) || pitched[0] || null;
    const all = pitched.flatMap(t => t.notes);
    const lane = song.lane?.length ? song.lane : detectLane(all, song.seconds);
    this.segs = lane.map(l => {
      const scale = scaleFor(l);
      return { t0: l.t0, t1: l.t1, root: l.root, scale, target: null };
    });
    this.segs[0].t0 = 0; this.segs[this.segs.length - 1].t1 = Math.max(song.seconds, this.segs[this.segs.length - 1].t1);
    // The song's main scale is the one it spends longest in. A stretch that only uses
    // part of it is mapped as the main scale, so its missing notes go where they go elsewhere.
    const dur = new Map();
    this.segs.forEach(s => { const k = `${s.root}|${s.scale.steps}`; dur.set(k, (dur.get(k) || 0) + s.t1 - s.t0); });
    this.main = this.segs.reduce((a, s) => dur.get(`${s.root}|${s.scale.steps}`) > dur.get(`${a.root}|${a.scale.steps}`) ? s : a, this.segs[0]);
    const mainSet = new Set(this.main.scale.steps.map(x => Math.round(x)));
    this.segs.forEach(s => {
      const sub = s.root === this.main.root && s.scale.steps.every(x => mainSet.has(Math.round(x)));
      s.src = sub ? this.main.scale.steps : s.scale.steps;
      const h = histogram(all, s.t0, s.t1);
      s.w = Array.from({ length: 12 }, (_, i) => h[mod(i + s.root, 12)]);
      const tot = s.w.reduce((a, b) => a + b, 0) || 1; s.w = s.w.map(x => x / tot * 12);
    });
    this.remap();
    this.render();
    this.on.change();
  }

  close() { this.pause(); this.song = null; this.segs = []; this.render(); this.on.change(); }

  // ---- scales ---------------------------------------------------------------
  ref() { return this.sel == null ? this.main : this.segs[this.sel]; }
  // What the wheel should show for the selection: the new scale and root, and what it was.
  view() {
    const s = this.ref(), t = s.target;
    return { scale: t ? t.scale : s.scale, root: mod(s.root + (t ? t.shift : 0), 12), was: s.scale, wasRoot: s.root, changed: !!t };
  }
  // The listener picked a scale and root: give it to the selected stretch (or all of them).
  assign(scale, root) {
    const ref = this.ref();
    let shift = mod(root - ref.root, 12); if (shift > 6) shift -= 12;
    (this.sel == null ? this.segs : [ref]).forEach(s => {
      s.target = sameSteps(scale.steps, s.scale.steps) && !shift ? null : { scale, shift };
    });
    this.remap(); this.renderLanes(); this.drawRoll();
  }
  reset() { this.segs.forEach(s => { s.target = null; }); this.remap(); this.renderLanes(); this.drawRoll(); }
  remap() {
    this.segs.forEach(s => { s.map = s.target ? buildMap(s.src, s.target.scale.steps, s.w, { keep: this.keep }) : null; });
  }
  segAt(t) { const g = this.segs; let i = 0; while (i < g.length - 1 && t >= g[i].t1) i++; return g[i]; }
  pitch(n) {
    if (this.original) return n[2];
    const s = this.segAt(n[0]);
    return s.map ? mapNote(n[2], s.root, s.map, s.target.shift) : n[2];
  }
  select(i) { this.sel = i; this.renderLanes(); this.on.change(); }

  // ---- playback ---------------------------------------------------------------
  now() { return this.playing ? Math.min(this.song.seconds, this.p0 + (this.engine.ctx.currentTime - this.t0) * this.speed) : this.pos; }
  toggle() { this.playing ? this.pause() : this.play(); }
  play() {
    if (!this.song || this.playing) return;
    const ctx = this.engine.ensure();
    if (this.pos >= this.song.seconds - 0.05) this.pos = 0;
    this.bus = ctx.createGain(); this.bus.connect(this.engine.out);
    this.buses = new Map(this.song.tracks.map(t => {
      const g = ctx.createGain(); g.gain.value = this.muted.has(t.id) ? 0 : 1; g.connect(this.bus); return [t.id, g];
    }));
    this.t0 = ctx.currentTime + 0.08; this.p0 = this.pos;
    this.idx = new Map(this.song.tracks.map(t => { let i = 0; while (i < t.notes.length && t.notes[i][0] < this.p0 - 1e-4) i++; return [t.id, i]; }));
    this.playing = true;
    this.timer = setInterval(() => this.tick(), 40);
    this.tick();
    const frame = () => { if (!this.playing) return; this.head(); this.raf = requestAnimationFrame(frame); };
    this.raf = requestAnimationFrame(frame);
    this.on.state();
  }
  pause() {
    if (!this.playing) return;
    this.pos = this.now(); this.playing = false;
    clearInterval(this.timer); cancelAnimationFrame(this.raf);
    (this.timers || []).forEach(clearTimeout); this.timers = [];
    const b = this.bus; b.gain.setTargetAtTime(0, this.engine.ctx.currentTime, 0.03); setTimeout(() => b.disconnect(), 500);
    this.head(); this.on.state();
  }
  seek(t) {
    const was = this.playing; this.pause();
    this.pos = Math.max(0, Math.min(this.song.seconds, t)); this.head();
    if (was) this.play();
  }
  setSpeed(v) { const was = this.playing; this.pause(); this.speed = v; if (was) this.play(); }
  tick() {
    const ctx = this.engine.ctx, pos = this.now(), horizon = pos + 0.3 * this.speed;
    if (pos >= this.song.seconds) { this.pause(); this.pos = 0; this.head(); return; }
    for (const tr of this.song.tracks) {
      let i = this.idx.get(tr.id); const bus = this.buses.get(tr.id), [voice, level] = SOUND[tr.kind] || SOUND.other;
      for (; i < tr.notes.length && tr.notes[i][0] < horizon; i++) {
        const n = tr.notes[i], when = this.t0 + (n[0] - this.p0) / this.speed;
        if (when < ctx.currentTime - 0.03) continue;
        if (tr.kind === 'drums') { this.engine.drum(n[2], when, n[3] * level, bus); continue; }
        const p = this.pitch(n), lead = tr === this.lead;
        this.engine.note(p, when, n[1] / this.speed, lead && this.leadVoice ? this.leadVoice : voice, bus, Math.min(1, n[3]) * level);
        if (lead && !this.muted.has(tr.id)) (this.timers ||= []).push(setTimeout(() => this.on.note(p), Math.max(0, (when - ctx.currentTime) * 1000)));
      }
      this.idx.set(tr.id, i);
    }
    if (this.timers?.length > 400) this.timers = this.timers.slice(-100);
  }
  mute(id) {
    this.muted.has(id) ? this.muted.delete(id) : this.muted.add(id);
    this.buses?.get(id)?.gain.setTargetAtTime(this.muted.has(id) ? 0 : 1, this.engine.ctx.currentTime, 0.02);
    this.renderHead(); this.drawRoll();
  }

  // ---- dock -------------------------------------------------------------------
  wire() {
    $('song-close').onclick = () => this.close();
    $('song-ab').onclick = () => { this.original = !this.original; this.renderHead(); this.drawRoll(); if (this.playing) { this.pause(); this.play(); } };
    $('song-whole').onclick = () => this.select(null);
    const tl = $('song-tl');
    const at = e => { const r = this.roll.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * this.song.seconds; };
    tl.addEventListener('pointerdown', e => {
      if (!this.song) return;
      const seg = e.target.closest('[data-seg]');
      if (seg) this.select(+seg.dataset.seg);
      this.seek(at(e));
      if (e.target === this.roll) {                           // drag on the notes to scrub
        const move = ev => this.seek(at(ev)), up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
        addEventListener('pointermove', move); addEventListener('pointerup', up);
      }
    });
    new ResizeObserver(() => { this.drawRoll(); this.head(); }).observe(this.roll);
  }
  render() {
    const on = !!this.song;
    $('dock').hidden = !on; document.body.classList.toggle('has-song', on);
    if (!on) return;
    $('song-title').textContent = this.song.title;
    this.renderHead(); this.renderLanes(); this.drawRoll(); this.head();
  }
  renderHead() {
    $('song-ab').setAttribute('aria-pressed', this.original);
    const box = $('song-tracks'); box.innerHTML = '';
    this.song.tracks.forEach(t => {
      const b = document.createElement('button');
      b.className = 'chip toggle sm'; b.setAttribute('aria-pressed', !this.muted.has(t.id));
      b.title = `${this.muted.has(t.id) ? 'Unmute' : 'Mute'} ${t.name}`;
      b.innerHTML = `<span class="dot"></span>${esc(t.name)}`;
      b.onclick = () => this.mute(t.id);
      box.appendChild(b);
    });
  }
  renderLanes() {
    const T = this.song.seconds, multi = this.segs.length > 1;
    $('song-whole').disabled = !multi; $('song-whole').setAttribute('aria-pressed', multi && this.sel == null);
    const row = (box, now) => {
      box.innerHTML = '';
      this.segs.forEach((s, i) => {
        const t = now && s.target, sc = t ? t.scale : s.scale, root = mod(s.root + (t ? t.shift : 0), 12);
        const b = document.createElement('button');
        b.className = 'seg-b' + (t ? ' changed' : '') + (now && (this.sel === i || (this.sel == null && multi)) ? ' sel' : '');
        b.dataset.seg = i;
        b.style.left = `${s.t0 / T * 100}%`; b.style.width = `${(s.t1 - s.t0) / T * 100}%`;
        b.title = `${clock(s.t0)}–${clock(s.t1)} · ${NOTE_NAMES[root]} ${sc.name}`;
        b.innerHTML = `<span>${NOTE_NAMES[root]} ${esc(sc.name)}</span>`;
        box.appendChild(b);
      });
    };
    row($('lane-was'), false); row($('lane-now'), true);
  }
  drawRoll() {
    const c = this.roll; if (!this.song || !c.clientWidth) return;
    const dpr = devicePixelRatio || 1, W = c.clientWidth, H = c.clientHeight;
    c.width = W * dpr; c.height = H * dpr;
    const g = c.getContext('2d'); g.scale(dpr, dpr); g.clearRect(0, 0, W, H);
    const tint = v => { c.style.color = `var(${v})`; return getComputedStyle(c).color; };   // resolved: the tokens are built from --h
    const acc = tint('--acc'), mut = tint('--muted');
    const T = this.song.seconds, tracks = this.song.tracks.filter(t => !this.muted.has(t.id));
    const pitched = tracks.filter(t => t.kind !== 'drums');
    let lo = 127, hi = 0;
    pitched.forEach(t => t.notes.forEach(n => { const p = this.pitch(n); if (p < lo) lo = p; if (p > hi) hi = p; if (n[2] < lo) lo = n[2]; if (n[2] > hi) hi = n[2]; }));
    if (hi < lo) { lo = 48; hi = 72; }
    const dh = tracks.some(t => t.kind === 'drums') ? 5 : 0, rh = Math.max(2, Math.min(5, (H - dh) / (hi - lo + 1)));
    const y = p => (H - dh - rh) * (1 - (p - lo) / Math.max(1, hi - lo));
    for (const t of pitched) for (const n of t.notes) {
      const p = this.pitch(n), moved = Math.abs(p - n[2]) > 0.005;
      g.globalAlpha = t === this.lead ? 1 : .5;
      g.fillStyle = moved ? acc : mut;
      g.fillRect(n[0] / T * W, y(p), Math.max(1.5, n[1] / T * W - .5), rh);
    }
    g.globalAlpha = .45; g.fillStyle = mut;
    tracks.filter(t => t.kind === 'drums').forEach(t => t.notes.forEach(n => g.fillRect(n[0] / T * W, H - 3, 1, 3)));
    g.globalAlpha = 1;
  }
  head() {
    if (!this.song) return;
    const t = this.now();
    $('song-head').style.left = `${this.roll.offsetLeft + t / this.song.seconds * this.roll.clientWidth}px`;
    $('song-time').textContent = `${clock(t)} / ${clock(this.song.seconds)}`;
  }
}
