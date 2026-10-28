import { REGIONS, SCALES, NOTE_NAMES, byId, regionOf, matches } from './scales.js';
import { Engine, VOICES } from './audio.js';
import { Wheel } from './wheel.js';
import { Scene, lampColours } from './scene.js';
import { Hue } from './hue.js';

const $ = id => document.getElementById(id);
const URL_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Fs', 'G', 'Ab', 'A', 'Bb', 'B'];
const INT = ['1', '♭2', '2', '♭3', '3', '4', '♯4', '5', '♭6', '6', '♭7', '7'];
const PATTERNS = [{ id: 'up', name: 'Up' }, { id: 'updown', name: 'Up & down' }, { id: 'down', name: 'Down' }];
const KEYS = 'asdfghjkl;\'';

const engine = new Engine();
const scene = new Scene($('scene'));
const state = { scale: byId.hijaz, root: 0, voice: 'auto', pattern: 'updown', bpm: 150, drone: false, edit: false, custom: null };
let playing = null;
const hue = new Hue(renderHue);

const wheel = new Wheel($('wheel'), {
  onNode: i => playDegree(i),
  onSlot: pc => {
    const rel = ((pc - state.root) % 12 + 12) % 12;
    if (!state.edit) {
      const i = steps().findIndex(s => Math.abs(s - rel) < 0.01);
      if (i >= 0) playDegree(i); else note(rootMidi() + rel);
      return;
    }
    toggleCustom(rel);
  },
});

// ---- derived values --------------------------------------------------------
const current = () => state.custom || state.scale;
const steps = () => current().steps;
const region = () => regionOf(current().region);
const rootMidi = () => 60 + state.root - (state.root >= 6 ? 12 : 0);
const voice = () => state.voice === 'auto' ? region().voice : state.voice;

function label(s) {
  const n = Math.round(s), off = Math.round((s - n) * 100);
  const micro = Math.abs(off) >= 5;
  const arrow = off < 0 ? '↓' : '↑';
  return {
    micro,
    note: NOTE_NAMES[(state.root + n) % 12] + (micro ? arrow : ''),
    int: INT[n % 12] + (micro ? arrow : ''),
    short: micro ? `${off > 0 ? '+' : '−'}${Math.abs(off)}¢` : '',
  };
}

// ---- rendering -------------------------------------------------------------
function renderRegions() {
  $('regions').innerHTML = '';
  REGIONS.forEach(r => {
    const b = document.createElement('button');
    b.className = 'region' + (r.id === region().id ? ' on' : '');
    b.style.setProperty('--rh', r.hue);
    b.innerHTML = `<span class="sw"></span>${r.name}`;
    b.onclick = () => pickRegion(r.id);
    $('regions').appendChild(b);
  });
}

function renderList() {
  const r = region(), box = $('scales');
  box.innerHTML = '';
  box.className = 'scales';
  const list = SCALES.filter(s => s.region === r.id);
  if (r.id === 'carnatic') {
    $('list-head').textContent = '72 melakartas';
    box.className = 'scales mela-box';
    const grid = document.createElement('div');
    grid.className = 'mela';
    list.forEach(s => {
      const b = document.createElement('button');
      b.textContent = s.mela;
      b.title = s.name;
      if (s === state.scale && !state.custom) b.className = 'on';
      b.onclick = () => pick(s);
      grid.appendChild(b);
    });
    box.appendChild(grid);
    const lg = document.createElement('div');
    lg.className = 'mela-legend';
    lg.innerHTML = '<span>1–36 · Shuddha Ma</span><span>37–72 · Prati Ma</span>';
    box.appendChild(lg);
    return;
  }
  $('list-head').textContent = r.name;
  list.forEach(s => {
    const b = document.createElement('button');
    b.className = 'chip' + (s === state.scale && !state.custom ? ' on' : '');
    b.textContent = s.name;
    b.onclick = () => pick(s);
    box.appendChild(b);
  });
}

function renderStage() {
  const s = current(), r = region();
  document.documentElement.style.setProperty('--h', r.hue);
  $('plate-name').textContent = s.name;
  $('plate-sub').textContent = s.sub || r.tag;
  $('origin-text').textContent = s.o || 'Drawn by you';
  const cap = $('caption');
  cap.textContent = s.d || '';
  [cap, $('plate'), $('origin')].forEach(e => { e.classList.remove('fade-in'); void e.offsetWidth; e.classList.add('fade-in'); });

  const pcs = s.steps.map(x => (state.root + x) % 12);
  const ghosts = (s.region === 'carnatic' && s.mela
    ? [-2, -1, 1, 2].map(d => byId[`mela-${s.mela + d}`]).filter(Boolean)
    : SCALES.filter(o => o.region === s.region && o.id !== s.id && o.steps.length <= 12))
    .map(o => o.steps.map(x => (state.root + x) % 12));
  const labels = s.steps.map(label);
  wheel.set(pcs, ghosts, labels);
  wheel.setOrb(NOTE_NAMES[state.root]);

  const notes = $('notes');
  notes.innerHTML = '';
  if (s.steps.length <= 12) labels.forEach((l, i) => {
    const b = document.createElement('button');
    b.className = 'note' + (l.micro ? ' micro' : '');
    b.innerHTML = `<b>${l.note}</b><small>${l.int}${l.micro ? ' ' + l.short : ''}</small>`;
    b.onclick = () => playDegree(i);
    notes.appendChild(b);
  });

  scene.set(s.scene || r.scene, isLight());
  hue.ambient(lampColours(s.scene || r.scene));
  renderMatches();
  document.title = `${s.name} · Gamut`;
}

function renderMatches() {
  const s = current(), box = $('matches');
  const { same, modes } = matches(s.steps, s.id);
  box.innerHTML = '';
  const add = (o, kind) => {
    const b = document.createElement('button');
    b.className = 'chip';
    const r = regionOf(o.region);
    b.innerHTML = `<span class="sw" style="width:7px;height:7px;border-radius:50%;background:hsl(${r.hue} 75% 62%)"></span>${o.name}${kind === 'mode' ? ' <small>mode</small>' : ''}`;
    b.title = `${o.name} · ${o.o || r.name}`;
    // Jump keeping the same notes: a mode moves the root, not the shape.
    b.onclick = () => {
      let root = state.root;
      if (kind === 'mode') {
        const abs = new Set(s.steps.map(x => (state.root + x) % 12));
        for (let k = 0; k < 12; k++) if (o.steps.every(x => abs.has((k + x) % 12))) { root = k; break; }
      }
      state.root = root;
      pick(o);
    };
    box.appendChild(b);
  };
  const all = [...same.map(o => [o, 'same']), ...modes.map(o => [o, 'mode'])];
  const cap = 12;
  all.slice(0, cap).forEach(([o, k]) => add(o, k));
  if (all.length > cap) {
    const more = document.createElement('span');
    more.className = 'chip'; more.textContent = `+${all.length - cap}`;
    more.title = all.slice(cap).map(([o]) => o.name).join(', ');
    box.appendChild(more);
  }
  if (!all.length) box.innerHTML = `<span class="none">${s.steps.every(Number.isInteger) ? 'A shape all its own.' : 'Microtonal: it lives between the twelve keys.'}</span>`;
}

function renderControls() {
  const roots = $('roots');
  roots.innerHTML = '';
  NOTE_NAMES.forEach((n, i) => {
    const b = document.createElement('button');
    b.className = 'chip' + (i === state.root ? ' on' : '');
    b.textContent = n;
    b.onclick = () => { state.root = i; restartIfPlaying(); update(); };
    roots.appendChild(b);
  });
  const seg = (box, items, key, after) => {
    $(box).innerHTML = '';
    items.forEach(it => {
      const b = document.createElement('button');
      b.className = 'chip' + (state[key] === it.id ? ' on' : '');
      b.textContent = it.name;
      b.onclick = () => { state[key] = it.id; renderControls(); after?.(); };
      $(box).appendChild(b);
    });
  };
  const autoName = `Auto · ${VOICES.find(v => v.id === region().voice).name}`;
  seg('voices', [{ id: 'auto', name: autoName }, ...VOICES], 'voice', () => note(rootMidi()));
  seg('patterns', PATTERNS, 'pattern', restartIfPlaying);
  $('drone-btn').setAttribute('aria-pressed', state.drone);
  $('edit-btn').setAttribute('aria-pressed', state.edit);
}

function renderHue() {
  const b = $('hue-btn');
  b.hidden = !hue.lights.length;
  b.setAttribute('aria-pressed', hue.on);
  b.title = hue.lights.map(l => l.name).join(', ');
}

function update(push = true) {
  renderRegions(); renderList(); renderStage(); renderControls();
  if (state.drone) startDrone();
  if (push) {
    const id = state.custom ? 'custom-' + state.custom.steps.join('.') : state.scale.id;
    history.replaceState(null, '', `#${id}/${URL_NOTES[state.root]}`);
  }
}

// ---- actions ---------------------------------------------------------------
function pick(s) {
  state.scale = s; state.custom = null;
  restartIfPlaying();
  update();
}

function pickRegion(id) {
  const first = SCALES.find(s => s.region === id && (id !== 'carnatic' || s.mela === 15)) || SCALES.find(s => s.region === id);
  pick(first);
}

function toggleCustom(rel) {
  if (rel === 0) return;
  const base = steps().filter(x => Number.isInteger(x));
  const has = base.includes(rel);
  const next = (has ? base.filter(x => x !== rel) : [...base, rel]).sort((a, b) => a - b);
  state.custom = { id: 'custom', name: 'Your shape', sub: 'Drawn on the wheel', region: state.scale.region, steps: next, o: '', d: 'Tap sockets to add or remove notes. Matching scales from around the world appear on the right.' };
  const named = matches(next, null).same[0];
  if (named) { state.custom.name = named.name; state.custom.o = named.o; state.custom.sub = `= ${named.sub || regionOf(named.region).tag}`; }
  update();
  if (!has) note(rootMidi() + rel);
}

function note(m, pos = 0) { engine.note(m, null, 0.5, voice()); scene.pulse(0.5); hue.pulse(pos, 0.8); }

function playDegree(i) {
  const s = steps(); if (i == null || i >= s.length * 2) return;
  const oct = Math.floor(i / s.length), k = i % s.length;
  note(rootMidi() + s[k] + oct * 12, k / s.length);
  wheel.play(k);
  flashNote(k);
  setTimeout(() => { wheel.play(null); flashNote(-1); }, 280);
}

function flashNote(k) { [...$('notes').children].forEach((n, j) => n.classList.toggle('hit', j === k)); }

function sequence() {
  const s = steps(), n = s.length;
  const up = [...s.map((x, i) => [x, i]), [12, 0]];
  if (state.pattern === 'up') return up;
  if (state.pattern === 'down') return up.slice().reverse();
  return [...up, ...up.slice(0, -1).reverse()];
}

function play() {
  if (playing) { stop(); return; }
  const seq = sequence();
  const step = 60 / state.bpm;
  const nodes = seq.map(([, i]) => i);
  playing = engine.sequence(seq.map(([x]) => rootMidi() + x), {
    step, voice: voice(),
    onStep: (i, prog) => {
      if (i === -1) { stop(); return; }
      if (i !== null) { wheel.play(nodes[i]); flashNote(nodes[i]); scene.pulse(0.55); hue.pulse(nodes[i] / steps().length); }
      wheel.cometAt(prog, nodes);
    },
  });
  $('play-btn').classList.add('playing');
  $('play-btn').querySelector('.cta-label').textContent = 'Stop';
}

function stop() {
  playing?.stop(); playing = null;
  wheel.play(null); wheel.cometAt(null); flashNote(-1);
  $('play-btn').classList.remove('playing');
  $('play-btn').querySelector('.cta-label').textContent = 'Hear this scale';
}

function restartIfPlaying() { if (playing) { stop(); setTimeout(play, 60); } }

function startDrone() {
  const s = steps();
  const fifth = s.includes(7) ? 7 : s.includes(5) ? 5 : 7;
  engine.startDrone(rootMidi(), fifth, region().drone ? 'tanpura' : 'pad');
}

// ---- theme -----------------------------------------------------------------
function isLight() {
  const t = document.documentElement.dataset.theme;
  return t ? t === 'light' : matchMedia('(prefers-color-scheme: light)').matches;
}
function themeLabel() {
  const b = $('theme-btn'), l = isLight() ? 'Switch to dark theme' : 'Switch to light theme';
  b.setAttribute('aria-label', l); b.title = l;
  document.querySelector('meta[name="theme-color"]').content = isLight() ? '#f4ede2' : '#0b0a14';
}
$('theme-btn').onclick = () => {
  const t = isLight() ? 'dark' : 'light';
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('sc-theme', t); } catch (e) {}
  themeLabel(); scene.set(current().scene || region().scene, isLight());
};
matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { themeLabel(); scene.set(current().scene || region().scene, isLight()); });

// ---- wiring ----------------------------------------------------------------
$('play-btn').onclick = play;
$('tempo').oninput = e => { state.bpm = +e.target.value; $('tempo-out').textContent = state.bpm; };
$('tempo').onchange = restartIfPlaying;
$('drone-btn').onclick = () => {
  state.drone = !state.drone;
  state.drone ? startDrone() : engine.stopDrone();
  renderControls();
};
$('edit-btn').onclick = () => { state.edit = !state.edit; renderControls(); };
$('hue-btn').onclick = () => hue.set(!hue.on);
$('about-btn').onclick = () => { $('about').hidden = false; };
$('about').onclick = () => { $('about').hidden = true; };
engine.onNote(() => {});

addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey || e.target.tagName === 'INPUT') return;
  if (e.key === 'H') { hue.lights.length ? hue.set(!hue.on) : hue.connect(); return; }
  const k = e.key.toLowerCase();
  if (k === 'escape') { $('about').hidden = true; return; }
  if (k === ' ') { e.preventDefault(); play(); return; }
  if (k === 'arrowright' || k === 'arrowleft') {
    e.preventDefault();
    const list = SCALES.filter(s => s.region === current().region);
    const i = list.indexOf(state.scale);
    pick(list[(i + (k === 'arrowright' ? 1 : -1) + list.length) % list.length]);
    return;
  }
  if (k === 'arrowdown' || k === 'arrowup') {
    e.preventDefault();
    const i = REGIONS.indexOf(region());
    pickRegion(REGIONS[(i + (k === 'arrowdown' ? 1 : -1) + REGIONS.length) % REGIONS.length].id);
    return;
  }
  if (k === 'd') { $('drone-btn').click(); return; }
  const di = KEYS.indexOf(k);
  if (di >= 0 && !e.repeat) playDegree(di);
  else if (/^[1-9]$/.test(k)) playDegree(+k - 1);
});

// Film grain texture, generated once.
(() => {
  const c = document.createElement('canvas'); c.width = c.height = 160;
  const g = c.getContext('2d'), d = g.createImageData(160, 160);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0);
  document.documentElement.style.setProperty('--grain', `url(${c.toDataURL()})`);
})();

// ---- boot from URL ---------------------------------------------------------
function fromHash() {
  const [id, rn] = decodeURIComponent(location.hash.slice(1)).split('/');
  const ri = URL_NOTES.indexOf(rn);
  if (ri >= 0) state.root = ri;
  if (id?.startsWith('custom-')) {
    const st = id.slice(7).split('.').map(Number).filter(n => n >= 0 && n < 12);
    if (st.length) { state.custom = { id: 'custom', name: 'Your shape', sub: 'Drawn on the wheel', region: 'symmetric', steps: st, o: '', d: '' }; }
  } else if (byId[id]) state.scale = byId[id];
}
fromHash();
themeLabel();
update(false);
