import { REGIONS, SCALES, NOTE_NAMES, byId, regionOf, matches } from './scales.js';
import { Engine, VOICES } from './audio.js';
import { Wheel } from './wheel.js';
import { Scene, lampColours } from './scene.js';
import { Hue } from './hue.js';
import { Midi } from './midi.js';
import { MODES, FADE_STAGES, keyMap, resolve, Fader } from './assist.js';
import { Remix } from './song.js';
import { fromFile, fromCadence, demo } from './songfile.js';

const $ = id => document.getElementById(id);
const URL_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Fs', 'G', 'Ab', 'A', 'Bb', 'B'];
const INT = ['1', '♭2', '2', '♭3', '3', '4', '♯4', '5', '♭6', '6', '♭7', '7'];
const PATTERNS = [{ id: 'up', name: 'Up' }, { id: 'updown', name: 'Up & down' }, { id: 'down', name: 'Down' }];
const KEYS = 'asdfghjkl;\'';
const DRAW_HINT = 'Tap an empty socket to add a note, a lit one to remove it.';

const engine = new Engine();
const scene = new Scene($('scene'));
const state = { scale: byId.hijaz, root: 0, voice: 'auto', pattern: 'updown', bpm: 150, drone: false, edit: false, custom: null };
let playing = null;
const hue = new Hue(renderHue);
// Remix player: a loaded song's notes, moved to whichever scale is picked (song.js).
const MOODS = [{ id: '', name: 'As written' }, { id: 'aeolian', name: 'Sad' }, { id: 'phrygian', name: 'Dark' }, { id: 'locrian', name: 'Scary' },
  { id: 'lydian', name: 'Dreamy' }, { id: 'blues', name: 'Bluesy' }, { id: 'hijaz', name: 'Desert' }, { id: 'hirajoshi', name: 'Japan' }];
let syncing = false;                       // true while the wheel is following the song, not the other way round
const remix = new Remix(engine, { change: songChanged, note: songNote, state: renderPlayState });

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
    b.onclick = () => { leftTab = 'scales'; pickRegion(r.id); };
    $('regions').appendChild(b);
  });
}

// Left pane shows one tab at a time: the world's regions or the current region's scales.
let leftTab = 'scales';
function renderLeftTab() {
  const w = leftTab === 'world';
  $('tab-world').classList.toggle('on', w); $('tab-world').setAttribute('aria-selected', w);
  $('tab-scales').classList.toggle('on', !w); $('tab-scales').setAttribute('aria-selected', !w);
  $('tab-scales').style.setProperty('--rh', region().hue);
  $('regions').hidden = !w; $('scales').hidden = w;
}

// Sub-tab shown in the list for regions with groups; follows the picked scale.
let listTab = null;

function renderList() {
  const r = region(), box = $('scales');
  box.innerHTML = '';
  box.className = 'scales';
  let list = SCALES.filter(s => s.region === r.id);
  $('list-head').textContent = r.name;
  let tab = null;
  if (r.groups) {
    tab = r.groups.some(g => g.id === listTab) ? listTab : (current().g || r.groups[0].id);
    const tabs = document.createElement('div');
    tabs.className = 'subtabs';
    r.groups.forEach(g => {
      const b = document.createElement('button');
      b.className = 'subtab' + (g.id === tab ? ' on' : '');
      b.textContent = g.name;
      b.onclick = () => { listTab = g.id; renderList(); };
      tabs.appendChild(b);
    });
    box.appendChild(tabs);
    list = list.filter(s => s.g === tab);
  }
  if (tab === 'mela') {
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
  // Chips drop a first word every name in the list shares ("Maqam …"): the tab already says it.
  const first = list.map(s => s.name.split(' ')[0]);
  const prefix = list.length > 2 && first.every(w => w === first[0] && w.length < list.find(s => s.name.startsWith(w)).name.length) ? first[0] + ' ' : '';
  list.forEach(s => {
    const b = document.createElement('button');
    b.className = 'chip' + (s === state.scale && !state.custom ? ' on' : '');
    b.textContent = s.name.slice(prefix.length);
    b.onclick = () => pick(s);
    box.appendChild(b);
  });
}

function renderStage() {
  const s = current(), r = region();
  document.documentElement.style.setProperty('--h', r.hue);
  $('plate-name').textContent = s.name;
  const sv = remix.song ? remix.view() : null;
  $('plate-sub').textContent = sv?.changed ? `was ${NOTE_NAMES[sv.wasRoot]} ${sv.was.name}` : s.sub || r.tag;
  $('origin-text').textContent = s.o || '';
  const cap = $('caption');
  cap.textContent = state.edit ? DRAW_HINT : s.d || '';
  [cap, $('plate'), $('origin')].forEach(e => { e.classList.remove('fade-in'); void e.offsetWidth; e.classList.add('fade-in'); });

  const pcs = s.steps.map(x => (state.root + x) % 12);
  // Faint neighbours: nearby melakartas, a janya's parent, or the rest of the group.
  const ghosts = sv ? (sv.changed ? [sv.was.steps.map(x => (sv.wasRoot + x) % 12)] : []) : ((s.mela
    ? [-2, -1, 1, 2].map(d => byId[`mela-${s.mela + d}`]).filter(Boolean)
    : s.parent ? [byId[`mela-${s.parent}`]]
    : SCALES.filter(o => o.region === s.region && o.id !== s.id && o.g === s.g && o.steps.length <= 12))
    .map(o => o.steps.map(x => (state.root + x) % 12)));
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
  remix.leadVoice = state.voice === 'auto' ? null : state.voice;
  if (remix.song) {
    const v = remix.view(), box = $('moods');
    box.innerHTML = '';
    MOODS.forEach(m => {
      const b = document.createElement('button');
      b.className = 'chip' + ((m.id ? v.changed && v.scale.id === m.id : !v.changed) ? ' on' : '');
      b.textContent = m.name;
      b.onclick = () => { if (m.id) pick(byId[m.id]); else { state.root = v.wasRoot; show(v.was); update(); } };
      box.appendChild(b);
    });
    $('keep-btn').setAttribute('aria-pressed', remix.keep);
  }
  $('drone-btn').setAttribute('aria-pressed', state.drone);
  $('edit-btn').setAttribute('aria-pressed', state.edit);
  wheel.setEdit(state.edit);
}

function renderHue() {
  const b = $('hue-btn');
  b.hidden = !hue.lights.length;
  b.setAttribute('aria-pressed', hue.on);
  b.title = hue.lights.map(l => l.name).join(', ');
}

function update(push = true) {
  if (remix.song && !syncing) remix.assign(current(), state.root);
  renderRegions(); renderList(); renderLeftTab(); renderStage(); renderControls();
  assistReset();
  if (remix.song) remix.drawRoll();          // after the stage: the roll takes the region's colour
  if (state.drone) startDrone();
  if (push) {
    const id = state.custom ? 'custom-' + state.custom.steps.join('.') : state.scale.id;
    history.replaceState(null, '', `#${id}/${URL_NOTES[state.root]}`);
  }
}

// ---- actions ---------------------------------------------------------------
// Put a scale on the wheel: a library scale, or a shape of its own (drawn, or found in a song).
function show(s) {
  if (s.id === 'custom') state.custom = s; else { state.scale = s; state.custom = null; }
  listTab = s.g || null;
}

function pick(s) {
  state.scale = s; state.custom = null; listTab = s.g || null;
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
  state.custom = { id: 'custom', name: 'Your shape', sub: 'Drawn on the wheel', region: state.scale.region, steps: next, o: '', d: '' };
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
  if (remix.song) { remix.toggle(); return; }
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

// ---- remix a song (player in song.js) ---------------------------------------
// The song, or the stretch picked in its timeline, changed: the wheel follows it.
function songChanged() {
  stop();
  syncing = true;
  if (remix.song) { const v = remix.view(); state.root = v.root; show(v.scale); }
  update(false);
  syncing = false;
  renderPlayState();
}

function renderPlayState() {
  const b = $('play-btn');
  if (!remix.song) { if (!playing) { b.classList.remove('playing'); b.querySelector('.cta-label').textContent = 'Hear this scale'; } return; }
  b.classList.toggle('playing', remix.playing);
  b.querySelector('.cta-label').textContent = remix.playing ? 'Pause' : 'Play song';
}

// A melody note sounded: light its place on the wheel.
function songNote(m) {
  const rel = ((m - state.root) % 12 + 12) % 12, k = steps().findIndex(x => Math.abs(x - rel) < 0.02);
  scene.pulse(0.4); hue.pulse(k < 0 ? 0 : k / steps().length, 0.6);
  if (k < 0) return;
  wheel.play(k); flashNote(k);
  clearTimeout(songNote.t);
  songNote.t = setTimeout(() => { wheel.play(null); flashNote(-1); }, 240);
}

function songMsg(text) { $('song-msg').textContent = text || 'Or drop a file anywhere on the page.'; }
function openSong(open) { $('song-open').hidden = !open; if (open) songMsg(''); }
async function loadSongFile(file) {
  if (!file) return;
  try { remix.load(await fromFile(file)); openSong(false); }
  catch (e) { openSong(true); songMsg(e.message || 'That file could not be read.'); }
}
$('song-btn').onclick = () => openSong(true);
$('song-open').onclick = e => { if (e.target === $('song-open')) openSong(false); };
$('song-demo').onclick = () => { remix.load(demo()); openSong(false); };
$('song-file').onclick = () => $('song-input').click();
$('song-input').onchange = e => { loadSongFile(e.target.files[0]); e.target.value = ''; };
addEventListener('dragover', e => { if (e.dataTransfer?.types.includes('Files')) e.preventDefault(); });
addEventListener('drop', e => { if (e.dataTransfer?.files.length) { e.preventDefault(); loadSongFile(e.dataTransfer.files[0]); } });
$('speed').oninput = e => { $('speed-out').textContent = `${e.target.value}%`; };
$('speed').onchange = e => remix.setSpeed(+e.target.value / 100);
$('keep-btn').onclick = () => { remix.keep = !remix.keep; remix.remap(); remix.renderLanes(); remix.drawRoll(); renderControls(); };

// Hand-off from Cadence: ?song=<url of a note export>. Only this origin or the local machine is fetched.
async function songFromUrl() {
  const u = new URLSearchParams(location.search).get('song');
  if (!u) return;
  try {
    const url = new URL(u, location.href);
    if (url.origin !== location.origin && !['127.0.0.1', 'localhost'].includes(url.hostname)) throw new Error('Songs can only be opened from this computer.');
    const r = await fetch(url);
    if (!r.ok) throw new Error('Cadence has no notes for that song yet.');
    remix.load(fromCadence(await r.json()));
  } catch (e) { openSong(true); songMsg(e instanceof TypeError ? 'Cadence is not running on this computer.' : e.message); }
}

function restartIfPlaying() { if (playing) { stop(); setTimeout(play, 60); } }

function startDrone() {
  const s = steps();
  const fifth = s.includes(7) ? 7 : s.includes(5) ? 5 : 7;
  engine.startDrone(rootMidi(), fifth, region().drone ? 'tanpura' : 'pad');
}

// ---- play along: MIDI keyboard + assist modes (logic in assist.js) ----------
const MODE_ICONS = {
  free: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  snap: '<path d="M6 4v8a6 6 0 0 0 12 0V4h-4v8a2 2 0 0 1-4 0V4Z"/><path d="M6 8h4M14 8h4"/>',
  mute: '<path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="m17 9.5 4 5m0-5-4 5"/>',
  white: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M9 5v14M15 5v14"/>',
  fade: '<path d="M3 7h5v4h5v4h5v4h3"/>',
};
const KB_LO = 48, KB_HI = innerWidth < 600 ? 71 : 83; // C3 to B5 on the mapping keyboard (two octaves on phones)
const assist = { mode: 'snap', follow: false, pos: 0, runs: 0 };
try { Object.assign(assist, JSON.parse(localStorage.getItem('gamut-assist') || '{}')); assist.pos = 0; assist.runs = 0; } catch (e) {}
if (!MODES.some(m => m.id === assist.mode)) assist.mode = 'snap';
const fader = new Fader();
let kmap = null;
const midi = new Midi((n, vel) => pressKey(n, vel), renderMidi);

const activeMode = () => assist.mode === 'fade' ? fader.mode : assist.mode;
const saveAssist = () => { try { localStorage.setItem('gamut-assist', JSON.stringify({ mode: assist.mode, follow: assist.follow })); } catch (e) {} };

// The scale, root or mode changed: rebuild the key map and start the guide over.
function assistReset() {
  kmap = keyMap(steps());
  fader.reset(); assist.pos = 0; assist.runs = 0;
  renderAssist();
}

function followTarget() { const seq = sequence(); return seq[assist.pos % seq.length][1]; }

// One key press, from MIDI or the on-screen keyboard.
function pressKey(n, vel = 0.8) {
  const r = resolve(activeMode(), n, state.root, rootMidi(), steps(), kmap);
  if (r.midi !== null) {
    engine.note(r.midi, null, 0.5, voice(), null, 0.35 + 0.65 * vel);
    scene.pulse(0.5); hue.pulse(r.deg === null ? 0 : r.deg / steps().length, 0.8);
  }
  if (r.deg !== null) {
    wheel.play(r.deg); flashNote(r.deg);
    clearTimeout(pressKey.t);
    pressKey.t = setTimeout(() => { if (!playing) { wheel.play(null); flashNote(-1); } }, 280);
  }
  if (!r.ok) wheel.miss(((n % 12) + 12) % 12);
  const key = $('kb').querySelector(`[data-n="${n}"]`);
  if (key) { const c = r.ok ? 'hit' : 'miss'; key.classList.add(c); setTimeout(() => key.classList.remove(c), 220); }

  let redraw = false;
  if (assist.mode === 'fade' && fader.push(r.ok)) redraw = true;
  if (assist.follow && r.ok && r.deg === followTarget()) {
    assist.pos++;
    if (assist.pos % sequence().length === 0) assist.runs++;
    redraw = true;
  }
  redraw ? renderAssist() : renderFade();
}

function renderMidi() {
  const b = $('midi-connect'), on = midi.connected;
  b.setAttribute('aria-pressed', on);
  $('midi-label').textContent = on ? midi.names.join(', ')
    : !midi.supported ? 'MIDI needs Chrome, Edge or Firefox'
    : midi.denied ? 'MIDI access was blocked'
    : midi.access ? 'No keyboard found' : 'Connect keyboard';
  b.disabled = !midi.supported;
  $('assist-btn').querySelector('.live-dot').hidden = !on;
}

function renderFade() {
  const show = assist.mode === 'fade';
  $('fade-meter').hidden = !show;
  if (!show) return;
  [...$('fade-stages').children].forEach((e, i) => e.classList.toggle('on', i === fader.stage));
  $('fade-fill').style.width = `${fader.stage === 2 ? 100 : Math.round(fader.progress / Fader.UP * 100)}%`;
}

function renderAssist() {
  if (!kmap) return;
  $('assist-scale').textContent = `${current().name} in ${NOTE_NAMES[state.root]}`;
  const modes = $('modes');
  modes.innerHTML = '';
  MODES.forEach(m => {
    const b = document.createElement('button');
    b.className = 'mode' + (m.id === assist.mode ? ' on' : '');
    b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', m.id === assist.mode);
    b.innerHTML = `<span class="mode-head"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${MODE_ICONS[m.id]}</svg><b>${m.name}</b></span><span class="mode-text">${m.text}</span>`;
    b.onclick = () => { assist.mode = m.id; saveAssist(); assistReset(); };
    modes.appendChild(b);
  });
  // App bar switch: shown only while an assist mode is on; pressing it returns to Free.
  const off = $('assist-off'), on = assist.mode !== 'free';
  off.hidden = !on;
  if (on) {
    const l = `Assist on: ${MODES.find(m => m.id === assist.mode).name}. Press to turn it off`;
    off.title = l; off.setAttribute('aria-label', l);
  }
  $('fade-stages').innerHTML = FADE_STAGES.map(id => `<span>${MODES.find(m => m.id === id).name}</span>`).join('');
  renderFade();

  // The mapping keyboard: each key is labelled with the note it will sound.
  const mode = activeMode(), s = steps(), target = assist.follow ? followTarget() : null;
  const kb = $('kb');
  kb.innerHTML = '';
  let whites = 0;
  const total = Array.from({ length: KB_HI - KB_LO + 1 }, (_, i) => KB_LO + i).filter(n => ![1, 3, 6, 8, 10].includes(n % 12)).length;
  for (let n = KB_LO; n <= KB_HI; n++) {
    const black = [1, 3, 6, 8, 10].includes(n % 12);
    const r = resolve(mode, n, state.root, rootMidi(), s, kmap);
    const b = document.createElement('button');
    b.dataset.n = n;
    let cls = 'k ' + (black ? 'kb-b' : 'kb-w'), text = '';
    if (r.midi === null) cls += ' off';
    else if (r.ok) { cls += ' in' + (r.deg === 0 ? ' root' : '') + (r.deg === target ? ' next' : ''); text = label(s[r.deg]).note; }
    else if (r.snapped) { cls += ' snap'; text = `${r.midi < n ? '‹' : '›'}${label(s[r.deg]).note}`; }
    else cls += ' stray';
    b.className = cls;
    if (text) b.innerHTML = `<span>${text}</span>`;
    b.setAttribute('aria-label', r.midi === null ? 'Silent key' : `Plays ${text.replace(/[‹›]/, '') || 'as played'}`);
    if (black) b.style.left = `${whites / total * 100}%`; else whites++;
    b.onpointerdown = e => { e.preventDefault(); pressKey(n); };
    kb.appendChild(b);
  }
  kb.style.setProperty('--whites', total);

  $('follow-btn').setAttribute('aria-pressed', assist.follow);
  wheel.next(target);
  const hint = $('assist-hint');
  if (assist.follow) hint.textContent = `Next: ${label(s[target]).note}${assist.runs ? ` · run ${assist.runs + 1}` : ''}`;
  else if (assist.mode === 'fade') hint.textContent = fader.stage === 2 ? 'No help now. It returns if you slip.' : 'Stay in the scale and the help steps back.';
  else hint.textContent = midi.connected ? '' : 'No keyboard? Tap these keys.';
}

function openAssist(open) { $('assist').hidden = !open; if (open) renderAssist(); }
$('assist-btn').onclick = () => openAssist(true);
$('assist-close').onclick = () => openAssist(false);
$('assist').onclick = e => { if (e.target === $('assist')) openAssist(false); };
$('midi-connect').onclick = () => midi.connect();
$('assist-off').onclick = () => { assist.mode = 'free'; saveAssist(); assistReset(); };
$('follow-btn').onclick = () => { assist.follow = !assist.follow; assist.pos = 0; assist.runs = 0; saveAssist(); renderAssist(); };

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
  if (remix.song) remix.drawRoll();
};
matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { themeLabel(); scene.set(current().scene || region().scene, isLight()); });

// ---- wiring ----------------------------------------------------------------
$('play-btn').onclick = play;
$('tab-world').onclick = () => { leftTab = 'world'; renderLeftTab(); };
$('tab-scales').onclick = () => { leftTab = 'scales'; renderLeftTab(); };
$('tempo').oninput = e => { state.bpm = +e.target.value; $('tempo-out').textContent = state.bpm; };
$('tempo').onchange = restartIfPlaying;
$('drone-btn').onclick = () => {
  state.drone = !state.drone;
  state.drone ? startDrone() : engine.stopDrone();
  renderControls();
};
$('edit-btn').onclick = () => { state.edit = !state.edit; update(false); };
$('hue-btn').onclick = () => hue.set(!hue.on);
$('about-btn').onclick = () => { $('about').hidden = false; };
$('about').onclick = () => { $('about').hidden = true; };
engine.onNote(() => {});

addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey || e.target.tagName === 'INPUT') return;
  if (e.key === 'H') { hue.lights.length ? hue.set(!hue.on) : hue.connect(); return; }
  const k = e.key.toLowerCase();
  if (k === 'escape') { $('about').hidden = true; openAssist(false); openSong(false); return; }
  if (k === 'r') { openSong($('song-open').hidden); return; }
  if (k === 'm') { openAssist($('assist').hidden); return; }
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
renderMidi();
update(false);
songFromUrl();
