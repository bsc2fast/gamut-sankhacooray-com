// Local relay between Gamut and a Philips Hue bridge.
//
// The live site is HTTPS, so the browser can't call the bridge's plain-HTTP API
// directly. Gamut talks to this relay on 127.0.0.1 instead, and the bridge
// username never leaves this Mac. Bridge IP and username come from
// ~/.config/hue/bridge.json ({ "ip": "...", "username": "..." }).
//
//   node scripts/hue-relay.mjs            (port 8811)
//
// Commands are coalesced per light (latest wins) and paced to stay inside the
// bridge's ~10 commands/second budget. Each light's state is saved on first
// use and restored on release or Ctrl+C.

import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const PORT = +(process.env.PORT || 8811);
const CONF = path.join(os.homedir(), '.config/hue/bridge.json');
const ORIGINS = [/^https:\/\/gamut\.sankhacooray\.com$/, /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/];
const GAP = 90;           // ms between bridge commands
const RESCAN = 30000;     // ms between light list refreshes

const conf = JSON.parse(fs.readFileSync(CONF, 'utf8'));
const api = p => `http://${conf.ip}/api/${conf.username}${p}`;

async function bridge(method, p, body) {
  const r = await fetch(api(p), { method, body: body && JSON.stringify(body), signal: AbortSignal.timeout(3000) });
  return r.json();
}

// ---- lights ----------------------------------------------------------------
let lights = [], scanned = 0, lastErr = null;
async function scan(force) {
  if (!force && Date.now() - scanned < RESCAN) return lights;
  try {
    const all = await bridge('GET', '/lights');
    lights = Object.entries(all)
      .filter(([, l]) => l.state?.reachable && 'xy' in l.state)
      .map(([id, l]) => ({ id, name: l.name }));
    scanned = Date.now(); lastErr = null;
  } catch (e) { lastErr = `Bridge not reachable at ${conf.ip}`; lights = []; }
  return lights;
}

// ---- paced sender ----------------------------------------------------------
const pending = new Map();   // light id -> state body
const saved = new Map();     // light id -> state before Gamut touched it
const timers = new Map();    // light id -> pulse fade-back timer
let lastSend = 0, sent = 0;

function queue(id, body) { pending.set(id, { ...(pending.get(id) || {}), ...body }); }

setInterval(async () => {
  if (!pending.size || Date.now() - lastSend < GAP) return;
  const [id, body] = pending.entries().next().value;
  pending.delete(id);
  lastSend = Date.now(); sent++;
  try { await bridge('PUT', `/lights/${id}/state`, body); } catch (e) { lastErr = e.message; }
}, 20);

async function remember(ids) {
  for (const id of ids) {
    if (saved.has(id)) continue;
    try {
      const s = (await bridge('GET', `/lights/${id}`)).state;
      saved.set(id, { on: s.on, bri: s.bri, ...(s.colormode === 'ct' ? { ct: s.ct } : s.colormode === 'hs' ? { hue: s.hue, sat: s.sat } : { xy: s.xy }) });
    } catch (e) {}
  }
}

function release() {
  timers.forEach(clearTimeout); timers.clear();
  pending.clear();
  saved.forEach((s, id) => queue(id, { ...s, transitiontime: 10 }));
  saved.clear();
}

const targets = ids => (ids?.length ? lights.filter(l => ids.includes(l.id)) : lights).map(l => l.id);
const tt = ms => Math.max(0, Math.round((ms || 0) / 100));

// ---- HTTP ------------------------------------------------------------------
const routes = {
  'GET /hue': async () => ({ ok: !lastErr || lights.length > 0, lights: await scan(true), sent, error: lastErr }),

  // Ambient colour: { xy, bri, ms, lights? }
  'POST /hue/ambient': async b => {
    await scan(); const ids = targets(b.lights); await remember(ids);
    ids.forEach(id => { clearTimeout(timers.get(id)); queue(id, { on: true, xy: b.xy, bri: b.bri, transitiontime: tt(b.ms ?? 1000) }); });
    return { ok: true, lights: ids };
  },

  // Note flash, then fade back: { xy, bri, back: { xy, bri }, hold, fade, lights? }
  'POST /hue/pulse': async b => {
    await scan(); const ids = targets(b.lights); await remember(ids);
    ids.forEach(id => {
      queue(id, { on: true, xy: b.xy, bri: b.bri, transitiontime: 0 });
      clearTimeout(timers.get(id));
      timers.set(id, setTimeout(() => queue(id, { xy: b.back.xy, bri: b.back.bri, transitiontime: tt(b.fade ?? 400) }), b.hold ?? 120));
    });
    return { ok: true };
  },

  'POST /hue/release': async () => { release(); return { ok: true }; },
};

http.createServer(async (req, res) => {
  const origin = req.headers.origin || '';
  const allowed = !origin || ORIGINS.some(r => r.test(origin));
  const head = {
    'Content-Type': 'application/json',
    ...(allowed && origin ? {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Private-Network': 'true',
      'Vary': 'Origin',
    } : {}),
  };
  if (!allowed) { res.writeHead(403, head); return res.end('{"error":"origin"}'); }
  if (req.method === 'OPTIONS') { res.writeHead(204, head); return res.end(); }
  const route = routes[`${req.method} ${req.url.split('?')[0]}`];
  if (!route) { res.writeHead(404, head); return res.end('{"error":"not found"}'); }
  let raw = '';
  for await (const c of req) { raw += c; if (raw.length > 4096) return res.destroy(); }
  try {
    const out = await route(raw ? JSON.parse(raw) : {});
    res.writeHead(200, head); res.end(JSON.stringify(out));
  } catch (e) { res.writeHead(400, head); res.end(JSON.stringify({ error: e.message })); }
}).listen(PORT, '127.0.0.1', async () => {
  const ls = await scan(true);
  console.log(`Hue relay on http://127.0.0.1:${PORT} · bridge ${conf.ip} · ${ls.length ? ls.map(l => `${l.id} ${l.name}`).join(', ') : lastErr || 'no colour lights reachable'}`);
});

const quit = () => { release(); setTimeout(() => process.exit(0), GAP * (pending.size + 2)); };
process.on('SIGINT', quit);
process.on('SIGTERM', quit);
