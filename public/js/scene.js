// Cinematic backdrop: a procedural landscape per culture, drawn once to an
// offscreen canvas, then animated with a slow camera drift, particles, water
// shimmer and a glow that answers each note. Light theme renders a daytime
// version of the same scene.

const SCENES = {
  alps: { sky: ['#090d22', '#1b2350', '#4d4f80'], body: { kind: 'moon', x: .78, y: .2, r: 26, c: '#f4f1ff' }, stars: 180,
    layers: [{ k: 'peaks', base: .58, amp: .26, snow: true }, { k: 'peaks', base: .68, amp: .2, snow: true }, { k: 'hills', base: .8, amp: .08, props: [['pine', 26]] }],
    water: .84, haze: '#3d4272', ink: '#070915', p: ['snow', 110, '#ffffff'] },
  bayou: { sky: ['#030d14', '#0b2a33', '#2f5a50'], body: { kind: 'moon', x: .3, y: .3, r: 40, c: '#e8f6d8' }, stars: 80,
    layers: [{ k: 'flat', base: .66, amp: .03, props: [['cypress', 22]] }, { k: 'flat', base: .74, amp: .02, props: [['cypress', 7]] }],
    water: .74, haze: '#1f4a44', ink: '#020807', p: ['fireflies', 70, '#e9ff8a'] },
  rain: { sky: ['#050913', '#0e1c33', '#26385a'], glow: '#5c84c4', stars: 0,
    layers: [{ k: 'city', base: .7, amp: .26 }, { k: 'city', base: .78, amp: .18 }],
    water: .8, haze: '#1d2a44', ink: '#04060c', p: ['rain', 240, '#a8c2ff'], mist: true },
  desert: { sky: ['#061420', '#123a4a', '#c98a4a'], body: { kind: 'crescent', x: .74, y: .2, r: 22, c: '#fff4d8' }, stars: 200,
    layers: [{ k: 'dunes', base: .66, amp: .1 }, { k: 'dunes', base: .74, amp: .1, props: [['mosque', 1, .3]] }, { k: 'dunes', base: .86, amp: .08, props: [['palm', 4, .82]] }],
    haze: '#6a4a3a', ink: '#120a06', p: ['sand', 140, '#e8bf8a'] },
  steppe: { sky: ['#0d0a1a', '#2c1a3c', '#a5546c'], body: { kind: 'moon', x: .2, y: .26, r: 30, c: '#ffe6dc' }, stars: 120,
    layers: [{ k: 'hills', base: .66, amp: .08 }, { k: 'hills', base: .74, amp: .07, props: [['windmill', 1, .7], ['poplar', 6]] }, { k: 'hills', base: .86, amp: .04, props: [['grass', 90]] }],
    haze: '#5a3550', ink: '#0c0610', p: ['pollen', 80, '#ffe9b8'] },
  ganges: { sky: ['#160a16', '#5c2a3c', '#f08a3a'], body: { kind: 'sun', x: .62, y: .6, r: 54, c: '#ffcf7a' }, stars: 30,
    layers: [{ k: 'ghats', base: .66, amp: .1, props: [['shikhara', 4]] }],
    water: .7, haze: '#6a3040', ink: '#140608', p: ['diyas', 46, '#ffb54a'], birds: true },
  palms: { sky: ['#08140f', '#1f4a3a', '#e8a656'], body: { kind: 'sun', x: .7, y: .58, r: 46, c: '#ffd890' }, stars: 20,
    layers: [{ k: 'hills', base: .64, amp: .07 }, { k: 'hills', base: .72, amp: .05, props: [['gopuram', 1, .35]] }, { k: 'hills', base: .86, amp: .04, props: [['palm', 7]] }],
    haze: '#3a5a42', ink: '#04100a', p: ['fireflies', 50, '#fff0a0'], birds: true },
  karst: { sky: ['#140808', '#3e1614', '#d4643f'], body: { kind: 'sun', x: .3, y: .44, r: 40, c: '#ffb08a' }, stars: 40,
    layers: [{ k: 'karst', base: .7, amp: .32 }, { k: 'karst', base: .76, amp: .26, props: [['pagoda', 1, .66]] }, { k: 'karst', base: .82, amp: .18 }],
    water: .82, haze: '#7a3a32', ink: '#120404', p: ['lanterns', 26, '#ff8a4a'], mist: true, boat: true },
  pines: { sky: ['#0a0f1a', '#1f2a44', '#6a7aa6'], body: { kind: 'moon', x: .76, y: .22, r: 28, c: '#f0f4ff' }, stars: 150,
    layers: [{ k: 'mountains', base: .62, amp: .18 }, { k: 'mountains', base: .72, amp: .14, props: [['pavilion', 1, .3]] }, { k: 'hills', base: .86, amp: .06, props: [['pine', 14]] }],
    haze: '#3a4466', ink: '#05070e', p: ['leaves', 40, '#e0603a'], mist: true },
  sakura: { sky: ['#0f0a1a', '#2c1a3e', '#8a4a72'], body: { kind: 'moon', x: .22, y: .2, r: 30, c: '#fff0f6' }, stars: 140,
    layers: [{ k: 'fuji', base: .66, amp: .32, snow: true }, { k: 'hills', base: .76, amp: .05, props: [['sakura', 6]] }, { k: 'flat', base: .84, amp: .01, props: [['torii', 1, .68]] }],
    water: .84, haze: '#4a3060', ink: '#0c0610', p: ['petals', 90, '#ffb8d4'] },
  volcano: { sky: ['#0e0a08', '#3c2210', '#c8742c'], body: { kind: 'sun', x: .22, y: .5, r: 34, c: '#ffc070' }, stars: 50,
    layers: [{ k: 'volcano', base: .64, amp: .34 }, { k: 'hills', base: .74, amp: .06, props: [['stupa', 1, .62]] }, { k: 'terraces', base: .86, amp: .07, props: [['palm', 4]] }],
    haze: '#5a3420', ink: '#0c0604', p: ['embers', 70, '#ff9a4a'], smoke: true },
  terraces: { sky: ['#0f0c08', '#4a3416', '#e8b45a'], body: { kind: 'sun', x: .72, y: .46, r: 40, c: '#ffe0a0' }, stars: 20,
    layers: [{ k: 'volcano', base: .62, amp: .26 }, { k: 'terraces', base: .76, amp: .1, props: [['candi', 1, .5]] }, { k: 'terraces', base: .88, amp: .06, props: [['palm', 5]] }],
    haze: '#6a5028', ink: '#100a02', p: ['fireflies', 50, '#fff2a8'] },
  river: { sky: ['#120a10', '#4a2234', '#f0a060'], body: { kind: 'sun', x: .4, y: .56, r: 44, c: '#ffd09a' }, stars: 30,
    layers: [{ k: 'hills', base: .66, amp: .04, props: [['chedi', 3]] }, { k: 'flat', base: .7, amp: .01, props: [['palm', 5]] }],
    water: .72, haze: '#5a2a3a', ink: '#100408', p: ['diyas', 36, '#ffc060'] },
  island: { sky: ['#04121e', '#0b3a5c', '#e8a474'], body: { kind: 'sun', x: .64, y: .6, r: 46, c: '#ffd6a8' }, stars: 40,
    layers: [{ k: 'islands', base: .64, amp: .1 }, { k: 'flat', base: .86, amp: .015, props: [['palm', 3]] }],
    water: .66, haze: '#2a4a66', ink: '#03080e', p: ['birds', 9, '#0a1420'] },
  savanna: { sky: ['#1c0a05', '#6c2c10', '#f2a444'], body: { kind: 'sun', x: .58, y: .58, r: 78, c: '#ffcf70' }, stars: 0,
    layers: [{ k: 'hills', base: .7, amp: .03 }, { k: 'flat', base: .78, amp: .015, props: [['acacia', 4], ['giraffe', 2], ['baobab', 1, .14]] }],
    haze: '#8a3a18', ink: '#120602', p: ['dust', 70, '#ffd8a0'], birds: true },
  highlands: { sky: ['#0a0c14', '#2c2a3c', '#c88454'], body: { kind: 'sun', x: .24, y: .5, r: 36, c: '#ffd2a0' }, stars: 60,
    layers: [{ k: 'mesa', base: .62, amp: .14 }, { k: 'mesa', base: .72, amp: .1 }, { k: 'hills', base: .86, amp: .04, props: [['tukul', 3], ['eucalyptus', 6]] }],
    haze: '#5a4440', ink: '#0c0806', p: ['dust', 50, '#ffe0b8'] },
  aurora: { sky: ['#020611', '#071a2a', '#0b2c3c'], stars: 260, aurora: true,
    layers: [{ k: 'mountains', base: .7, amp: .12, snow: true }, { k: 'flat', base: .82, amp: .01, props: [['pine', 18]] }],
    water: .84, haze: '#16364a', ink: '#020509', p: ['crystals', 60, '#c4f2ff'] },
};

// Colours for room lights: the horizon glow, the particles and the sun/moon.
export function lampColours(id) {
  const s = SCENES[id] || SCENES.alps;
  const lum = h => { const n = parseInt(h.slice(1), 16); return ((n >> 16 & 255) + (n >> 8 & 255) + (n & 255)) / 765; };
  const body = s.body?.c || s.p[2];
  return { base: s.sky[2], note: lum(s.p[2]) > 0.3 ? s.p[2] : body, body };
}

// ---- helpers ---------------------------------------------------------------
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
const rgba = (c, a) => { const [r, g, b] = hex(c); return `rgba(${r},${g},${b},${a})`; };
function noise1(r, n) { const v = Array.from({ length: n + 2 }, r); return x => { const i = Math.floor(x), f = x - i, u = (1 - Math.cos(f * Math.PI)) / 2; return v[i % v.length] * (1 - u) + v[(i + 1) % v.length] * u; }; }

function ridge(kind, W, H, base, amp, seed) {
  const r = rng(seed), n = noise1(r, 64), n2 = noise1(r, 64), step = 3;
  const ys = [];
  const B = base * H, A = amp * H;
  const towers = Array.from({ length: 14 }, () => ({ c: r() * W, w: (0.025 + r() * 0.04) * W, h: 0.4 + r() * 0.6 }));
  const cone = { c: (0.35 + r() * 0.3) * W, w: 0.42 * W };
  for (let x = 0; x <= W + step; x += step) {
    const u = x / W;
    let y;
    switch (kind) {
      case 'peaks': { const a = 1 - Math.abs(n(u * 6) * 2 - 1), b = 1 - Math.abs(n2(u * 14) * 2 - 1); y = B - A * (a * 0.75 + b * 0.25) ** 1.4; break; }
      case 'mountains': y = B - A * (n(u * 4) * 0.7 + n2(u * 11) * 0.3); break;
      case 'hills': y = B - A * (n(u * 2.5) * 0.8 + n2(u * 7) * 0.2); break;
      case 'dunes': { const s = Math.sin(u * 9 + n(u * 2) * 4); y = B - A * (0.5 + 0.5 * Math.sign(s) * Math.abs(s) ** 0.6) * (0.6 + n2(u * 3) * 0.4); break; }
      case 'mesa': { const v = n(u * 5); y = B - A * Math.min(1, Math.max(0, (v - 0.35) * 5)) - A * 0.05 * n2(u * 30); break; }
      case 'karst': { let h = 0; for (const t of towers) h = Math.max(h, t.h * Math.exp(-(((x - t.c) / t.w) ** 4))); y = B - A * h - A * 0.04 * n2(u * 20); break; }
      case 'volcano': case 'fuji': { const d = Math.abs(x - cone.c) / cone.w; const k = kind === 'fuji' ? Math.max(0, 1 - d) ** 2.1 : Math.max(0, 1 - d) ** 1.5; y = B - A * Math.min(k, kind === 'volcano' ? 0.94 : 1) - A * 0.03 * n2(u * 25); break; }
      case 'terraces': { const v = n(u * 3) * 0.8 + n2(u * 9) * 0.2; y = B - A * Math.round(v * 6) / 6; break; }
      case 'islands': { const v = n(u * 5); y = B - A * Math.max(0, v - 0.55) * 3; break; }
      case 'ghats': { const v = Math.floor(u * 40); y = B - A * (0.3 + rng(v + seed)() * 0.7) * (0.6 + n(u * 3) * 0.4); break; }
      case 'city': { const v = Math.floor(u * 70); const q = rng(v * 7 + seed)(); y = B - A * (0.15 + q ** 2 * 0.85); break; }
      default: y = B - A * n(u * 3);
    }
    ys.push(y);
  }
  return { ys, step, at: x => ys[Math.max(0, Math.min(ys.length - 1, Math.round(x / step)))] };
}

// ---- silhouettes -----------------------------------------------------------
const PROPS = {
  pine(g, x, y, h) { g.beginPath(); for (let i = 0; i < 4; i++) { const t = y - h * i * 0.22, w = h * (0.32 - i * 0.06); g.moveTo(x - w, t); g.lineTo(x, t - h * 0.42); g.lineTo(x + w, t); } g.fill(); g.fillRect(x - h * 0.03, y - h * 0.1, h * 0.06, h * 0.12); },
  cypress(g, x, y, h, r) {
    g.fillRect(x - h * 0.04, y - h, h * 0.08, h);
    g.beginPath(); g.ellipse(x, y - h * 0.82, h * 0.28, h * 0.22, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(x - h * 0.12, y); g.lineTo(x, y - h * 0.25); g.lineTo(x + h * 0.12, y); g.fill();
    g.lineWidth = 1; g.strokeStyle = g.fillStyle;
    for (let i = 0; i < 9; i++) { const sx = x + (r() - 0.5) * h * 0.5; g.beginPath(); g.moveTo(sx, y - h * 0.75); g.lineTo(sx + (r() - 0.5) * 4, y - h * (0.45 + r() * 0.2)); g.stroke(); }
  },
  poplar(g, x, y, h) { g.beginPath(); g.ellipse(x, y - h * 0.55, h * 0.1, h * 0.5, 0, 0, Math.PI * 2); g.fill(); },
  eucalyptus(g, x, y, h) { g.fillRect(x - 1.5, y - h * 0.7, 3, h * 0.7); g.beginPath(); g.ellipse(x, y - h * 0.8, h * 0.14, h * 0.28, 0, 0, Math.PI * 2); g.fill(); },
  palm(g, x, y, h, r) {
    const lean = (r() - 0.5) * h * 0.5; g.lineWidth = Math.max(2, h * 0.04); g.strokeStyle = g.fillStyle;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + lean * 0.2, y - h * 0.5, x + lean, y - h); g.stroke();
    const tx = x + lean, ty = y - h;
    g.lineWidth = Math.max(1.5, h * 0.025);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, L = h * (0.35 + r() * 0.12); g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + Math.cos(a) * L * 0.6, ty - L * 0.3, tx + Math.cos(a) * L, ty + Math.abs(Math.sin(a)) * L * 0.3 + L * 0.25); g.stroke(); }
  },
  acacia(g, x, y, h) { g.lineWidth = 3; g.strokeStyle = g.fillStyle; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h * 0.5); g.lineTo(x - h * 0.3, y - h * 0.8); g.moveTo(x, y - h * 0.5); g.lineTo(x + h * 0.35, y - h * 0.82); g.stroke(); g.beginPath(); g.ellipse(x, y - h * 0.86, h * 0.62, h * 0.1, 0, 0, Math.PI * 2); g.fill(); },
  baobab(g, x, y, h) { g.beginPath(); g.moveTo(x - h * 0.16, y); g.quadraticCurveTo(x - h * 0.1, y - h * 0.6, x - h * 0.12, y - h * 0.7); g.lineTo(x + h * 0.12, y - h * 0.7); g.quadraticCurveTo(x + h * 0.1, y - h * 0.6, x + h * 0.16, y); g.fill(); g.lineWidth = 3; g.strokeStyle = g.fillStyle; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(x + i * h * 0.03, y - h * 0.68); g.lineTo(x + i * h * 0.09, y - h * (0.85 + Math.abs(i) * -0.03)); g.stroke(); } },
  giraffe(g, x, y, h) { g.lineWidth = 3; g.strokeStyle = g.fillStyle; g.beginPath(); g.ellipse(x, y - h * 0.45, h * 0.18, h * 0.08, 0, 0, Math.PI * 2); g.fill(); [-0.13, -0.07, 0.08, 0.14].forEach(d => { g.beginPath(); g.moveTo(x + d * h, y - h * 0.42); g.lineTo(x + d * h, y); g.stroke(); }); g.lineWidth = 5; g.beginPath(); g.moveTo(x + h * 0.14, y - h * 0.48); g.lineTo(x + h * 0.3, y - h * 0.95); g.stroke(); g.beginPath(); g.ellipse(x + h * 0.34, y - h * 0.95, h * 0.07, h * 0.035, 0.3, 0, Math.PI * 2); g.fill(); },
  mosque(g, x, y, h) {
    g.fillRect(x - h * 0.5, y - h * 0.35, h, h * 0.35);
    g.beginPath(); g.arc(x, y - h * 0.35, h * 0.3, Math.PI, 0); g.fill();
    g.fillRect(x - 1, y - h * 0.82, 2, h * 0.2);
    [-1, 1].forEach(s => { const mx = x + s * h * 0.75; g.fillRect(mx - h * 0.05, y - h * 1.05, h * 0.1, h * 1.05); g.beginPath(); g.arc(mx, y - h * 1.05, h * 0.07, Math.PI, 0); g.fill(); g.beginPath(); g.moveTo(mx - h * 0.02, y - h * 1.1); g.lineTo(mx, y - h * 1.22); g.lineTo(mx + h * 0.02, y - h * 1.1); g.fill(); });
  },
  windmill(g, x, y, h) { g.beginPath(); g.moveTo(x - h * 0.16, y); g.lineTo(x - h * 0.09, y - h * 0.6); g.lineTo(x + h * 0.09, y - h * 0.6); g.lineTo(x + h * 0.16, y); g.fill(); g.beginPath(); g.moveTo(x - h * 0.12, y - h * 0.6); g.lineTo(x, y - h * 0.72); g.lineTo(x + h * 0.12, y - h * 0.6); g.fill(); g.lineWidth = 3; g.strokeStyle = g.fillStyle; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; g.beginPath(); g.moveTo(x, y - h * 0.62); g.lineTo(x + Math.cos(a) * h * 0.45, y - h * 0.62 + Math.sin(a) * h * 0.45); g.stroke(); } },
  grass(g, x, y, h, r) { g.lineWidth = 1; g.strokeStyle = g.fillStyle; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(x + i * 2, y + 2); g.quadraticCurveTo(x + i * 2, y - h * 0.15, x + i * 2 + (r() - 0.3) * 8, y - h * (0.2 + r() * 0.15)); g.stroke(); } },
  shikhara(g, x, y, h) { g.fillRect(x - h * 0.35, y - h * 0.25, h * 0.7, h * 0.25); g.beginPath(); g.moveTo(x - h * 0.2, y - h * 0.25); g.bezierCurveTo(x - h * 0.2, y - h * 0.7, x - h * 0.05, y - h * 0.9, x, y - h); g.bezierCurveTo(x + h * 0.05, y - h * 0.9, x + h * 0.2, y - h * 0.7, x + h * 0.2, y - h * 0.25); g.fill(); g.fillRect(x - 1, y - h * 1.12, 2, h * 0.14); },
  gopuram(g, x, y, h) { const tiers = 7; for (let i = 0; i < tiers; i++) { const w = h * (0.42 - i * 0.045), t = y - (i + 1) * h * 0.11; g.fillRect(x - w, t, w * 2, h * 0.11 + 1); } g.beginPath(); g.ellipse(x, y - h * 0.8, h * 0.14, h * 0.05, 0, 0, Math.PI * 2); g.fill(); for (let i = -2; i <= 2; i++) g.fillRect(x + i * h * 0.05 - 1, y - h * 0.9, 2, h * 0.06); },
  pagoda(g, x, y, h) { for (let i = 0; i < 5; i++) { const w = h * (0.22 - i * 0.03), t = y - i * h * 0.17; g.fillRect(x - w * 0.6, t - h * 0.13, w * 1.2, h * 0.13); g.beginPath(); g.moveTo(x - w - h * 0.06, t - h * 0.11); g.quadraticCurveTo(x - w * 0.5, t - h * 0.15, x, t - h * 0.2); g.quadraticCurveTo(x + w * 0.5, t - h * 0.15, x + w + h * 0.06, t - h * 0.11); g.fill(); } g.fillRect(x - 1, y - h * 1.02, 2, h * 0.18); },
  pavilion(g, x, y, h) { g.fillRect(x - h * 0.3, y - h * 0.35, h * 0.06, h * 0.35); g.fillRect(x + h * 0.24, y - h * 0.35, h * 0.06, h * 0.35); g.beginPath(); g.moveTo(x - h * 0.55, y - h * 0.32); g.quadraticCurveTo(x - h * 0.3, y - h * 0.4, x, y - h * 0.62); g.quadraticCurveTo(x + h * 0.3, y - h * 0.4, x + h * 0.55, y - h * 0.32); g.fill(); },
  torii(g, x, y, h) { g.fillRect(x - h * 0.32, y - h * 0.82, h * 0.07, h * 0.82); g.fillRect(x + h * 0.25, y - h * 0.82, h * 0.07, h * 0.82); g.fillRect(x - h * 0.38, y - h * 0.68, h * 0.76, h * 0.05); g.beginPath(); g.moveTo(x - h * 0.55, y - h * 0.88); g.quadraticCurveTo(x, y - h * 0.8, x + h * 0.55, y - h * 0.88); g.lineTo(x + h * 0.5, y - h * 0.8); g.quadraticCurveTo(x, y - h * 0.74, x - h * 0.5, y - h * 0.8); g.fill(); },
  sakura(g, x, y, h, r) { g.lineWidth = 3; g.strokeStyle = g.fillStyle; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + h * 0.1, y - h * 0.4, x - h * 0.05, y - h * 0.6); g.stroke(); for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(x + (r() - 0.5) * h * 0.9, y - h * (0.55 + r() * 0.35), h * (0.12 + r() * 0.1), 0, Math.PI * 2); g.fill(); } },
  stupa(g, x, y, h) { for (let i = 0; i < 4; i++) { const w = h * (0.6 - i * 0.1); g.fillRect(x - w, y - (i + 1) * h * 0.08, w * 2, h * 0.08 + 1); } g.beginPath(); g.arc(x, y - h * 0.32, h * 0.16, Math.PI, 0); g.fill(); g.fillRect(x - 1.5, y - h * 0.62, 3, h * 0.16); },
  candi(g, x, y, h) { [-1, 1].forEach(s => { g.beginPath(); g.moveTo(x + s * h * 0.06, y); for (let i = 0; i < 6; i++) { g.lineTo(x + s * h * (0.06 + 0.32 - i * 0.05), y - i * h * 0.15); g.lineTo(x + s * h * (0.06 + 0.32 - i * 0.05), y - (i + 1) * h * 0.15); } g.lineTo(x + s * h * 0.06, y - h * 0.95); g.fill(); }); },
  chedi(g, x, y, h) { g.fillRect(x - h * 0.22, y - h * 0.14, h * 0.44, h * 0.14); g.beginPath(); g.arc(x, y - h * 0.14, h * 0.17, Math.PI, 0); g.fill(); g.beginPath(); g.moveTo(x - h * 0.06, y - h * 0.3); g.lineTo(x, y - h); g.lineTo(x + h * 0.06, y - h * 0.3); g.fill(); },
  tukul(g, x, y, h) { g.fillRect(x - h * 0.25, y - h * 0.3, h * 0.5, h * 0.3); g.beginPath(); g.moveTo(x - h * 0.34, y - h * 0.28); g.lineTo(x, y - h * 0.72); g.lineTo(x + h * 0.34, y - h * 0.28); g.fill(); },
};
const PROP_H = { pine: .07, cypress: .2, poplar: .14, eucalyptus: .16, palm: .2, acacia: .12, baobab: .2, giraffe: .1, mosque: .1, windmill: .14, grass: .08, shikhara: .1, gopuram: .2, pagoda: .16, pavilion: .07, torii: .14, sakura: .12, stupa: .12, candi: .14, chedi: .12, tukul: .06 };

// ---- renderer --------------------------------------------------------------
export class Scene {
  constructor(canvas) {
    this.c = canvas; this.g = canvas.getContext('2d');
    this.light = false; this.pulseV = 0; this.mx = 0; this.my = 0; this.t = 0;
    this.cur = null; this.prev = null; this.fade = 1;
    addEventListener('resize', () => this.resize());
    addEventListener('pointermove', e => { this.mx = e.clientX / innerWidth - 0.5; this.my = e.clientY / innerHeight - 0.5; });
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.resize();
    const loop = ts => { this.frame(ts); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    this.W = Math.round(innerWidth * dpr); this.H = Math.round(innerHeight * dpr); this.dpr = dpr;
    this.c.width = this.W; this.c.height = this.H;
    if (this.cur) { this.cur = this.build(this.cur.id); this.prev = null; }
  }

  set(id, light) {
    if (this.cur && this.cur.id === id && this.light === light) return;
    const themeOnly = this.cur && this.cur.id === id;
    this.light = light;
    this.prev = themeOnly ? null : this.cur;
    this.cur = this.build(id);
    this.fade = this.prev ? 0 : 1;
  }

  pulse(v = 1) { this.pulseV = Math.min(1.4, this.pulseV + v); }

  palette(s) {
    if (!this.light) return { sky: s.sky, haze: s.haze, ink: s.ink, body: s.body?.c };
    const sky = [mix(s.sky[2], '#bcd4ec', 0.55), mix(s.sky[2], '#f3e6d4', 0.62), mix(s.sky[2], '#fff6ea', 0.78)];
    return { sky, haze: mix(s.haze, sky[2], 0.55), ink: mix(s.ink, s.haze, 0.55), body: '#fff8e8' };
  }

  build(id) {
    const s = SCENES[id] || SCENES.alps;
    const { W, H } = this, dpr = this.dpr;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    const pal = this.palette(s);
    const r = rng(id.length * 977 + id.charCodeAt(0) * 31);

    const sky = g.createLinearGradient(0, 0, 0, H * (s.water || 0.85));
    sky.addColorStop(0, pal.sky[0]); sky.addColorStop(0.55, pal.sky[1]); sky.addColorStop(1, pal.sky[2]);
    g.fillStyle = sky; g.fillRect(0, 0, W, H);

    const stars = [];
    if (!this.light) for (let i = 0; i < s.stars; i++) stars.push({ x: r() * W, y: r() * H * 0.55, a: r() * 0.8 + 0.2, z: r() * 1.3 + 0.3, ph: r() * 6 });

    const body = s.body && { ...s.body, X: s.body.x * W, Y: s.body.y * H, R: s.body.r * dpr * (H / 900 / dpr) * 1.4, c: pal.body };
    if (body) this.drawBody(g, body, 1);

    // Layers back to front; far ones fade into haze for depth.
    const n = s.layers.length;
    const ridges = [];
    s.layers.forEach((L, i) => {
      const depth = n === 1 ? 1 : i / (n - 1);
      const col = mix(pal.haze, pal.ink, 0.25 + depth * 0.75);
      const rd = ridge(L.k, W, H, L.base, L.amp, i * 101 + id.length * 13);
      ridges.push(rd);
      g.fillStyle = col;
      g.beginPath(); g.moveTo(0, H);
      rd.ys.forEach((y, k) => g.lineTo(k * rd.step, y));
      g.lineTo(W, H); g.closePath(); g.fill();
      if (L.snow) {
        g.save(); g.clip();
        const top = Math.min(...rd.ys);
        const sg = g.createLinearGradient(0, top, 0, top + L.amp * H * 0.45);
        const snow = this.light ? '#ffffff' : mix('#dfe6ff', pal.haze, 0.35);
        sg.addColorStop(0, rgba(snow, 0.9)); sg.addColorStop(1, rgba(snow, 0));
        g.fillStyle = sg; g.fillRect(0, top, W, L.amp * H * 0.5); g.restore();
      }
      if (L.k === 'city' && !this.light) {
        const lr = rng(i + 5);
        for (let k = 0; k < 900 * (W / 1600); k++) {
          const x = lr() * W, y = rd.at(x) + 4 + lr() * (H * L.base - rd.at(x));
          if (lr() < 0.5) { g.fillStyle = rgba(lr() < 0.8 ? '#ffd27a' : '#9cd4ff', 0.25 + lr() * 0.5); g.fillRect(x, y, 2 * dpr, 2.5 * dpr); }
        }
      }
      if (L.k === 'terraces') {
        g.save(); g.clip(); g.strokeStyle = rgba(this.light ? '#ffffff' : '#c8e0a0', this.light ? 0.25 : 0.08); g.lineWidth = 1;
        for (let k = 0; k < 14; k++) { g.beginPath(); rd.ys.forEach((y, j) => g.lineTo(j * rd.step, y + k * 9 * dpr)); g.stroke(); }
        g.restore();
      }
      if (s.mist && i < n - 1) {
        const mg = g.createLinearGradient(0, H * L.base - L.amp * H * 0.3, 0, H * L.base + 20);
        mg.addColorStop(0, rgba(pal.sky[2], 0)); mg.addColorStop(1, rgba(pal.sky[2], 0.35));
        g.fillStyle = mg; g.fillRect(0, H * L.base - L.amp * H * 0.3, W, L.amp * H * 0.3 + 30);
      }
      g.fillStyle = col;
      (L.props || []).forEach(([kind, count, at]) => {
        for (let k = 0; k < count; k++) {
          const x = at !== undefined && count === 1 ? at * W : (at !== undefined ? at * W + (k - count / 2) * W * 0.03 : (k + 0.2 + r() * 0.6) / count * W);
          const h = PROP_H[kind] * H * (0.75 + r() * 0.5);
          PROPS[kind](g, x, rd.at(x) + 2, h, r);
        }
      });
    });

    if (s.smoke) {
      const vx = W * 0.5, vy = H * 0.3;
      for (let k = 0; k < 18; k++) { const sg = g.createRadialGradient(vx + k * 14 * dpr, vy - k * 18 * dpr, 0, vx + k * 14 * dpr, vy - k * 18 * dpr, (30 + k * 8) * dpr); sg.addColorStop(0, rgba(this.light ? '#ffffff' : '#7a5a4a', 0.12)); sg.addColorStop(1, rgba('#000000', 0)); g.fillStyle = sg; g.fillRect(0, 0, W, H); }
    }

    if (s.water) {
      const wy = s.water * H;
      // Reflection of everything above the waterline, squashed and darkened.
      g.save(); g.globalAlpha = 0.42; g.translate(0, wy * 2); g.scale(1, -1);
      g.drawImage(cv, 0, wy * 0.35, W, wy * 0.65, 0, wy * 0.35, W, wy * 0.65); g.restore();
      const wg = g.createLinearGradient(0, wy, 0, H);
      wg.addColorStop(0, rgba(pal.sky[1], 0.35)); wg.addColorStop(1, rgba(pal.ink, 0.92));
      g.fillStyle = wg; g.fillRect(0, wy, W, H - wy);
      if (s.boat) { g.fillStyle = pal.ink; const bx = W * 0.62, by = wy + H * 0.04; g.beginPath(); g.moveTo(bx - 50 * dpr, by); g.quadraticCurveTo(bx, by + 12 * dpr, bx + 50 * dpr, by - 4 * dpr); g.lineTo(bx - 50 * dpr, by); g.fill(); g.fillRect(bx - 12 * dpr, by - 16 * dpr, 24 * dpr, 12 * dpr); g.fillRect(bx + 30 * dpr, by - 40 * dpr, 1.5 * dpr, 38 * dpr); }
    }

    return { id, s, cv, stars, body, pal, parts: this.spawn(s, W, H, r), water: s.water ? s.water * H : null };
  }

  drawBody(g, b, glow) {
    const { X, Y, R, c, kind } = b;
    const gr = g.createRadialGradient(X, Y, R * 0.4, X, Y, R * (kind === 'sun' ? 6 : 5));
    gr.addColorStop(0, rgba(c, (kind === 'sun' ? 0.45 : 0.28) * glow)); gr.addColorStop(1, rgba(c, 0));
    g.fillStyle = gr; g.fillRect(X - R * 6, Y - R * 6, R * 12, R * 12);
    g.fillStyle = c; g.beginPath(); g.arc(X, Y, R, 0, Math.PI * 2);
    if (kind === 'crescent') { g.arc(X + R * 0.45, Y - R * 0.2, R * 0.92, 0, Math.PI * 2, true); g.fill('evenodd'); } else g.fill();
  }

  spawn(s, W, H, r) {
    const [type, count, col] = s.p;
    const list = [];
    for (let i = 0; i < count; i++) list.push({ x: r() * W, y: r() * H, z: 0.4 + r() * 1.2, ph: r() * 10, v: r() });
    return { type, col, list };
  }

  frame(ts) {
    const dt = Math.min(0.05, (ts - (this.last || ts)) / 1000); this.last = ts;
    if (!this.cur || document.hidden) return;
    this.t += this.reduced ? 0 : dt;
    this.pulseV *= Math.pow(0.12, dt);
    if (this.fade < 1) this.fade = Math.min(1, this.fade + dt * 1.1);
    const { g, W, H } = this;
    g.clearRect(0, 0, W, H);
    if (this.prev && this.fade < 1) this.draw(this.prev, 1);
    this.draw(this.cur, this.prev ? this.fade : 1);
    if (this.fade >= 1) this.prev = null;
  }

  draw(sc, alpha) {
    const { g, W, H, t, dpr } = this;
    const p = this.pulseV;
    g.save(); g.globalAlpha = alpha;
    // Slow camera drift + pointer parallax, over-scanned so edges never show.
    const k = 1.06, dx = (Math.sin(t * 0.05) * 0.012 + this.mx * 0.018) * W, dy = (Math.cos(t * 0.04) * 0.008 + this.my * 0.012) * H;
    g.drawImage(sc.cv, -W * (k - 1) / 2 + dx, -H * (k - 1) / 2 + dy, W * k, H * k);

    for (const st of sc.stars) {
      const tw = 0.6 + 0.4 * Math.sin(t * 1.6 + st.ph);
      g.fillStyle = `rgba(255,255,255,${st.a * tw * (0.8 + p * 0.4)})`;
      g.fillRect(st.x + dx * 0.3, st.y + dy * 0.3, st.z * dpr, st.z * dpr);
    }
    if (sc.body) {
      g.globalCompositeOperation = 'lighter';
      const b = sc.body, gr = g.createRadialGradient(b.X + dx, b.Y + dy, b.R, b.X + dx, b.Y + dy, b.R * (4 + p * 3));
      gr.addColorStop(0, rgba(b.c, 0.12 + p * 0.25)); gr.addColorStop(1, rgba(b.c, 0));
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = 'source-over';
    }
    if (sc.s.aurora) this.aurora(sc, p);
    if (sc.s.glow) { const gr = g.createRadialGradient(W * 0.5, H * 0.75, 0, W * 0.5, H * 0.75, W * 0.6); gr.addColorStop(0, rgba(sc.s.glow, 0.12 + p * 0.15)); gr.addColorStop(1, rgba(sc.s.glow, 0)); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
    if (sc.water) this.shimmer(sc, p, dx);
    if (sc.s.birds) this.birds(sc);
    this.particles(sc, p);
    g.restore();
  }

  aurora(sc, p) {
    const { g, W, H, t } = this;
    g.globalCompositeOperation = 'lighter';
    [['#3dffb0', 0.2, 0], ['#7a6bff', 0.28, 2], ['#36d6ff', 0.14, 4]].forEach(([c, y0, ph]) => {
      for (let x = 0; x < W; x += 6) {
        const y = H * (y0 + 0.06 * Math.sin(x / W * 5 + t * 0.25 + ph) + 0.03 * Math.sin(x / W * 13 - t * 0.4));
        const h = H * (0.14 + 0.06 * Math.sin(x / W * 7 + t * 0.3 + ph));
        const gr = g.createLinearGradient(0, y, 0, y + h);
        const a = (this.light ? 0.06 : 0.14) * (0.6 + 0.4 * Math.sin(x / W * 9 + t * 0.5 + ph)) * (1 + p * 0.8);
        gr.addColorStop(0, rgba(c, 0)); gr.addColorStop(0.7, rgba(c, a)); gr.addColorStop(1, rgba(c, 0));
        g.fillStyle = gr; g.fillRect(x, y, 6, h);
      }
    });
    g.globalCompositeOperation = 'source-over';
  }

  shimmer(sc, p, dx) {
    const { g, W, H, t, dpr } = this;
    const cx = sc.body ? sc.body.X + dx : W / 2;
    const c = sc.body ? sc.body.c : '#9cc4ff';
    for (let i = 0; i < 40; i++) {
      const y = sc.water + (i / 40) ** 1.4 * (H - sc.water);
      const w = (20 + i * 4) * dpr * (0.5 + 0.5 * Math.sin(t * 1.3 + i * 1.7));
      const x = cx + Math.sin(t * 0.7 + i * 2.3) * 14 * dpr * (1 + i / 20);
      g.fillStyle = rgba(c, (0.08 + p * 0.12) * (1 - i / 50));
      g.fillRect(x - w / 2, y, w, 1.2 * dpr);
    }
  }

  birds(sc) {
    const { g, W, H, t, dpr } = this;
    g.strokeStyle = rgba(sc.pal.ink, 0.7); g.lineWidth = 1.4 * dpr;
    for (let i = 0; i < 7; i++) {
      const x = ((t * 18 * dpr + i * 37 * dpr + i * i * 9) % (W * 1.4)) - W * 0.2;
      const y = H * 0.24 + i * 9 * dpr + Math.sin(t * 0.6 + i) * 8 * dpr;
      const f = Math.sin(t * 6 + i) * 4 * dpr;
      g.beginPath(); g.moveTo(x - 7 * dpr, y - f); g.quadraticCurveTo(x - 3 * dpr, y - 3 * dpr, x, y); g.quadraticCurveTo(x + 3 * dpr, y - 3 * dpr, x + 7 * dpr, y - f); g.stroke();
    }
  }

  particles(sc, p) {
    const { g, W, H, t, dpr } = this;
    const { type, col, list } = sc.parts;
    const dt = 1 / 60;
    for (const q of list) {
      const z = q.z;
      switch (type) {
        case 'snow': case 'crystals': q.y += 18 * z * dpr * dt * 2; q.x += Math.sin(t + q.ph) * 0.3 * dpr; break;
        case 'rain': q.y += 900 * z * dpr * dt; q.x -= 90 * dpr * dt; break;
        case 'petals': case 'leaves': q.y += 22 * z * dpr * dt * 2; q.x += (Math.sin(t * 0.8 + q.ph) * 0.8 + 0.5) * dpr; break;
        case 'sand': case 'dust': q.x += (60 + 80 * q.v) * z * dpr * dt; q.y += Math.sin(t * 2 + q.ph) * 0.2 * dpr; break;
        case 'embers': case 'lanterns': q.y -= (type === 'embers' ? 30 : 10) * z * dpr * dt; q.x += Math.sin(t * 0.5 + q.ph) * 0.25 * dpr; break;
        case 'diyas': if (q.y < (sc.water || H * 0.7)) q.y = (sc.water || H * 0.7) + q.v * (H - (sc.water || H * .7)); q.x += 8 * z * dpr * dt; break;
        default: q.x += Math.sin(t * 0.3 + q.ph) * 0.4 * dpr; q.y += Math.cos(t * 0.25 + q.ph * 2) * 0.3 * dpr;
      }
      if (q.y > H + 20) { q.y = -10; q.x = Math.random() * W; }
      if (q.y < -30) { q.y = H + 10; q.x = Math.random() * W; }
      if (q.x > W + 20) q.x = -10;
      if (q.x < -20) q.x = W + 10;

      const lightK = this.light ? 0.7 : 1;
      switch (type) {
        case 'snow': g.fillStyle = rgba(this.light ? '#ffffff' : col, 0.6 * lightK); g.beginPath(); g.arc(q.x, q.y, z * 1.6 * dpr, 0, 7); g.fill(); break;
        case 'crystals': { g.strokeStyle = rgba(this.light ? '#4a8ab0' : col, 0.5); g.lineWidth = dpr * 0.8; const s = z * 4 * dpr; for (let a = 0; a < 3; a++) { const an = a * Math.PI / 3 + t * 0.2 + q.ph; g.beginPath(); g.moveTo(q.x - Math.cos(an) * s, q.y - Math.sin(an) * s); g.lineTo(q.x + Math.cos(an) * s, q.y + Math.sin(an) * s); g.stroke(); } break; }
        case 'rain': g.strokeStyle = rgba(col, this.light ? 0.25 : 0.22); g.lineWidth = dpr * 0.8; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q.x - 2 * dpr, q.y + 16 * z * dpr); g.stroke(); break;
        case 'petals': case 'leaves': g.fillStyle = rgba(col, 0.75 * lightK); g.save(); g.translate(q.x, q.y); g.rotate(t * (0.6 + q.v) + q.ph); g.beginPath(); g.ellipse(0, 0, 3.6 * z * dpr, 1.8 * z * dpr, 0, 0, 7); g.fill(); g.restore(); break;
        case 'sand': case 'dust': g.fillStyle = rgba(col, 0.35 * lightK); g.fillRect(q.x, q.y, z * 1.4 * dpr, z * 1.4 * dpr); break;
        case 'fireflies': case 'pollen': case 'embers': {
          const fl = 0.5 + 0.5 * Math.sin(t * (type === 'fireflies' ? 2.4 : 1.2) + q.ph * 3);
          const a = (type === 'fireflies' ? fl : 0.5 + fl * 0.3) * (0.6 + p * 0.6) * lightK;
          const R = z * (type === 'pollen' ? 1.4 : 2) * dpr;
          const gr = g.createRadialGradient(q.x, q.y, 0, q.x, q.y, R * 5);
          gr.addColorStop(0, rgba(col, a)); gr.addColorStop(0.25, rgba(col, a * 0.4)); gr.addColorStop(1, rgba(col, 0));
          g.fillStyle = gr; g.fillRect(q.x - R * 5, q.y - R * 5, R * 10, R * 10); break;
        }
        case 'lanterns': case 'diyas': {
          const a = (0.65 + 0.35 * Math.sin(t * 3 + q.ph)) * (0.7 + p * 0.5);
          const R = z * (type === 'lanterns' ? 4 : 2.2) * dpr;
          const gr = g.createRadialGradient(q.x, q.y, 0, q.x, q.y, R * 4);
          gr.addColorStop(0, rgba(col, a)); gr.addColorStop(0.3, rgba(col, a * 0.35)); gr.addColorStop(1, rgba(col, 0));
          g.fillStyle = gr; g.fillRect(q.x - R * 4, q.y - R * 4, R * 8, R * 8);
          g.fillStyle = rgba('#fff2d0', a); g.fillRect(q.x - R * 0.4, q.y - R * 0.6, R * 0.8, R * 1.2); break;
        }
        case 'birds': {
          const x = (q.x + t * 30 * dpr * z) % (W + 40), y = H * (0.2 + q.v * 0.25), f = Math.sin(t * 5 + q.ph) * 4 * dpr;
          g.strokeStyle = rgba(this.light ? '#2a3a4a' : '#08121c', 0.8); g.lineWidth = 1.4 * dpr;
          g.beginPath(); g.moveTo(x - 8 * dpr, y - f); g.quadraticCurveTo(x - 3 * dpr, y - 3 * dpr, x, y); g.quadraticCurveTo(x + 3 * dpr, y - 3 * dpr, x + 8 * dpr, y - f); g.stroke(); break;
        }
      }
    }
  }
}
