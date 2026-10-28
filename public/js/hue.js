// Philips Hue lights through the local relay (scripts/hue-relay.mjs). The room
// glows in the scene's horizon colour, and each note flashes the lamps in the
// colour of the scene's particles (petals, lanterns, fireflies…).
//
// Probing 127.0.0.1 from a public page can raise Chrome's local-network
// prompt, so nothing is probed until the user opts in (Shift+H or ?hue), after
// which the choice is remembered.

const RELAY = 'http://127.0.0.1:8811/hue';
const KEY = 'gamut-hue';

// sRGB hex -> CIE xy (D65, Wide RGB formula from the Hue docs)
function xy(hex) {
  const n = parseInt(hex.slice(1), 16);
  const lin = c => (c /= 255) > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92;
  const [r, g, b] = [n >> 16 & 255, n >> 8 & 255, n & 255].map(lin);
  const X = r * 0.664511 + g * 0.154324 + b * 0.162028;
  const Y = r * 0.283881 + g * 0.668433 + b * 0.047685;
  const Z = r * 0.000088 + g * 0.072310 + b * 0.986039;
  const s = X + Y + Z || 1;
  return [+(X / s).toFixed(4), +(Y / s).toFixed(4)];
}

// Lamps wash out dusky colours to white, so keep the hue and push saturation.
function vivid(hex, sat = 0.85) {
  const n = parseInt(hex.slice(1), 16);
  let [r, g, b] = [n >> 16 & 255, n >> 8 & 255, n & 255].map(v => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  const a = d < 0.06 ? 0 : sat * .5;   // greys and whites stay white
  const f = k => { const t = (k + h / 30) % 12; return .5 - a * Math.max(-1, Math.min(t - 3, 9 - t, 1)); };
  return '#' + [f(0), f(8), f(4)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
}

function mix(a, b, k) {
  const p = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
}

export class Hue {
  constructor(onChange) {
    this.onChange = onChange;
    this.lights = [];      // available colour lights, empty when not connected
    this.on = false;
    this.ambientC = null;
    this.last = 0;
    let want = false;
    try { want = localStorage.getItem(KEY) === '1'; } catch (e) {}
    if (want || /[?&]hue\b/.test(location.search) || /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) this.connect(want || /[?&]hue\b/.test(location.search));
  }

  async call(path, body) {
    const r = await fetch(RELAY + path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {});
    return r.json();
  }

  // Looks for the relay; `enable` also switches the lights on.
  async connect(enable = true) {
    try {
      const r = await this.call('');
      this.lights = r.lights || [];
    } catch (e) { this.lights = []; }
    if (enable && this.lights.length) this.set(true);
    this.onChange?.();
    return this.lights.length > 0;
  }

  set(on) {
    this.on = on;
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {}
    if (on && this.ambientC) this.ambient(this.ambientC, true);
    if (!on && this.lights.length) this.call('/release', {}).catch(() => {});
    this.onChange?.();
  }

  // Scene colours: base = horizon glow, note = particle colour.
  ambient(c, force) {
    const same = this.ambientC && this.ambientC.base === c.base && this.ambientC.note === c.note;
    this.ambientC = c;
    if (!this.on || (same && !force)) return;
    this.call('/ambient', { xy: xy(vivid(c.base)), bri: 110, ms: 1500 }).catch(() => {});
  }

  // A note at scale position `pos` (0..1). The flash colour slides from the
  // particle colour toward the sun/moon colour along the scale.
  pulse(pos = 0, strength = 1) {
    if (!this.on || !this.ambientC) return;
    const now = performance.now();
    if (now - this.last < 70) return;
    this.last = now;
    const c = this.ambientC;
    const col = mix(c.note, c.body || c.note, pos);
    this.call('/pulse', {
      xy: xy(vivid(col, 0.95)), bri: Math.round(150 + 104 * strength),
      back: { xy: xy(vivid(c.base)), bri: 110 }, hold: 110, fade: 450,
    }).catch(() => {});
  }
}
