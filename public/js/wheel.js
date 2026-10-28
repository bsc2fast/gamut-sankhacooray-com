// The chromatic wheel: C on top, twelve sockets, the scale drawn as a polygon.
// Microtones sit at their true angle between sockets. Vertices tween from the
// previous shape so switching scales morphs instead of jumping.

import { NOTE_NAMES } from './scales.js';

const NS = 'http://www.w3.org/2000/svg';
const R_NODE = 128, R_LABEL = 171;
const el = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  parent?.appendChild(e);
  return e;
};
const ang = pc => (pc / 12) * Math.PI * 2 - Math.PI / 2;
const pt = (a, r) => [Math.cos(a) * r, Math.sin(a) * r];

export class Wheel {
  constructor(svg, { onNode, onSlot }) {
    this.svg = svg;
    this.onNode = onNode; this.onSlot = onSlot;
    this.angles = [];
    svg.setAttribute('viewBox', '-200 -200 400 400');
    const defs = el('defs', {}, svg);
    defs.innerHTML = `
      <radialGradient id="wg-face" cx="50%" cy="45%" r="60%">
        <stop offset="0" stop-color="var(--face-1)"/><stop offset="1" stop-color="var(--face-2)"/>
      </radialGradient>
      <linearGradient id="wg-brass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f6dc9a"/><stop offset=".35" stop-color="#b8893c"/>
        <stop offset=".6" stop-color="#e9c574"/><stop offset="1" stop-color="#7a5520"/>
      </linearGradient>
      <radialGradient id="wg-orb" cx="38%" cy="32%" r="70%">
        <stop offset="0" stop-color="#fff3cf"/><stop offset=".35" stop-color="var(--acc)"/><stop offset="1" stop-color="#140e06"/>
      </radialGradient>
      <filter id="wg-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="wg-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>`;

    el('circle', { r: 196, class: 'w-halo', filter: 'url(#wg-soft)' }, svg);
    el('circle', { r: 186, fill: 'url(#wg-brass)', class: 'w-brass' }, svg);
    el('circle', { r: 157, class: 'w-ring-in' }, svg);
    el('circle', { r: 153, fill: 'url(#wg-face)', class: 'w-face' }, svg);
    // Engraved hour lines and sub-ticks for quarter tones
    const eng = el('g', { class: 'w-engrave' }, svg);
    for (let i = 0; i < 48; i++) {
      const a = ang(i / 4), [x1, y1] = pt(a, 153), [x2, y2] = pt(a, i % 4 ? 147 : 140);
      el('line', { x1, y1, x2, y2 }, eng);
    }
    [60, 95].forEach(r => el('circle', { r, class: 'w-orbit' }, svg));

    this.ghosts = el('g', { class: 'w-ghosts' }, svg);
    this.sockets = el('g', {}, svg);
    this.labels = el('g', {}, svg);
    for (let i = 0; i < 12; i++) {
      const [x, y] = pt(ang(i), R_NODE);
      const s = el('rect', { x: x - 6, y: y - 6, width: 12, height: 12, rx: 2.5, class: 'w-socket', transform: `rotate(45 ${x} ${y})` }, this.sockets);
      const [lx, ly] = pt(ang(i), R_LABEL);
      const t = el('text', { x: lx, y: ly, class: 'w-label' }, this.labels);
      const nm = NOTE_NAMES[i];
      t.textContent = nm[0];
      if (nm[1]) el('tspan', { dx: -1 }, t).textContent = nm[1];
      const hit = el('circle', { cx: x, cy: y, r: 18, class: 'w-hit' }, svg);
      hit.addEventListener('click', () => this.onSlot(i));
      s.dataset.pc = i; t.dataset.pc = i;
    }
    this.poly = el('polygon', { class: 'w-poly' }, svg);
    this.polyGlow = el('polygon', { class: 'w-poly-glow', filter: 'url(#wg-glow)' }, svg);
    this.spokes = el('g', { class: 'w-spokes' }, svg);
    this.nodes = el('g', {}, svg);
    this.comet = el('circle', { r: 6, class: 'w-comet', filter: 'url(#wg-glow)' }, svg);
    this.orbHalo = el('circle', { r: 46, class: 'w-orb-halo', filter: 'url(#wg-soft)' }, svg);
    this.orb = el('circle', { r: 34, fill: 'url(#wg-orb)', class: 'w-orb' }, svg);
    this.orbText = el('text', { y: 4, class: 'w-orb-text' }, svg);
  }

  // pcs: absolute pitch classes (floats) in scale order starting at the root.
  set(pcs, ghosts = [], labels = []) {
    this.pcs = pcs;
    const target = pcs.map(ang);
    const from = target.map(a => {
      if (!this.angles.length) return a;
      let best = this.angles[0], bd = 9;
      for (const b of this.angles) { const d = Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))); if (d < bd) { bd = d; best = b; } }
      return best;
    });
    this.labelsFor = labels;
    cancelAnimationFrame(this.raf);
    const t0 = performance.now(), D = 420;
    const step = now => {
      const k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3);
      this.angles = target.map((a, i) => { const d = Math.atan2(Math.sin(a - from[i]), Math.cos(a - from[i])); return from[i] + d * e; });
      this.draw();
      if (k < 1) this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);

    const on = new Set(pcs.filter(p => Number.isInteger(Math.round(p * 1000) / 1000) && Math.abs(p - Math.round(p)) < 0.01).map(p => Math.round(p) % 12));
    this.sockets.querySelectorAll('rect').forEach(r => r.classList.toggle('on', on.has(+r.dataset.pc)));
    this.labels.querySelectorAll('text').forEach(t => {
      const pc = +t.dataset.pc;
      t.classList.toggle('on', on.has(pc));
      t.classList.toggle('root', Math.abs(pcs[0] - pc) < 0.01);
    });

    this.ghosts.innerHTML = '';
    ghosts.slice(0, 6).forEach((g, i) => {
      const pts = g.map(p => pt(ang(p), R_NODE).join(',')).join(' ');
      el('polygon', { points: pts, class: 'w-ghost', style: `--gh:${(i * 47) % 360}deg` }, this.ghosts);
    });
  }

  draw() {
    const P = this.angles.map(a => pt(a, R_NODE));
    const pts = P.map(p => p.join(',')).join(' ');
    this.poly.setAttribute('points', pts);
    this.polyGlow.setAttribute('points', pts);
    this.spokes.innerHTML = '';
    this.nodes.innerHTML = '';
    P.forEach(([x, y], i) => {
      el('line', { x1: 0, y1: 0, x2: x, y2: y, class: 'w-spoke' }, this.spokes);
      const g = el('g', { class: 'w-node' + (i === 0 ? ' root' : ''), 'data-i': i }, this.nodes);
      el('circle', { cx: x, cy: y, r: 16, class: 'w-node-hit' }, g);
      el('circle', { cx: x, cy: y, r: i === 0 ? 9 : 7, class: 'w-node-dot', filter: 'url(#wg-glow)' }, g);
      el('circle', { cx: x, cy: y, r: 2.6, class: 'w-node-core' }, g);
      const lab = this.labelsFor?.[i];
      if (lab?.micro) {
        const [mx, my] = pt(this.angles[i], R_NODE - 24);
        const t = el('text', { x: mx, y: my, class: 'w-micro' }, g); t.textContent = lab.short;
      }
      g.addEventListener('click', e => { e.stopPropagation(); this.onNode(i); });
    });
  }

  // Lights node i; `prog` is a float position for the travelling comet.
  play(i) {
    this.nodes.querySelectorAll('.w-node').forEach(n => n.classList.toggle('hit', +n.dataset.i === i));
    if (i === null || i < 0) { this.comet.classList.remove('on'); return; }
    this.orb.classList.remove('beat'); void this.orb.getBBox(); this.orb.classList.add('beat');
    this.orbHalo.classList.remove('beat'); void this.orbHalo.getBBox(); this.orbHalo.classList.add('beat');
  }

  cometAt(prog, seq) {
    if (prog == null || !seq) { this.comet.classList.remove('on'); return; }
    const i = Math.floor(prog), f = prog - i;
    const a = seq[Math.min(i, seq.length - 1)], b = seq[Math.min(i + 1, seq.length - 1)];
    if (a === undefined) return;
    const A = pt(this.angles[a] ?? 0, R_NODE), B = pt(this.angles[b] ?? 0, R_NODE);
    const e = f < 0.5 ? 0 : (f - 0.5) * 2;
    this.comet.setAttribute('cx', A[0] + (B[0] - A[0]) * e);
    this.comet.setAttribute('cy', A[1] + (B[1] - A[1]) * e);
    this.comet.classList.add('on');
  }

  setOrb(text) { this.orbText.textContent = text; }
}
