// Web MIDI: every connected keyboard or pad feeds note-ons to one callback.
// Chrome, Edge and Firefox support it; Safari does not.
//
// Sound from keyboard (thru): Gamut sends Local Control Off (CC 122 = 0), so the
// keys no longer sound the keyboard's own voice. Each key press comes here, the
// app maps it onto the scale and plays the result back to the keyboard's sound
// engine with play(). Releases, the sustain pedal, pitch bend and other controls
// pass back unchanged. Local Control goes back on when thru is turned off or the
// page closes. The keyboard plays 12 equal steps, so microtones are rounded by
// the caller.

// A few keyboards echo what they receive back out over USB. Keys never send
// Local Control, so getting our CC 122 back proves an echo; only then are
// incoming copies of what we just sent dropped (a real key could match one).
const ECHO_MS = 40;

export class Midi {
  constructor(onNote, onChange) {
    this.onNote = onNote; this.onChange = onChange;
    this.supported = !!navigator.requestMIDIAccess;
    this.access = null; this.names = [];
    this.thru = false; this.out = null;
    this.held = new Map();   // `${ch}:${key}` -> note sent for that key
    this.sounding = new Map(); // `${ch}:${note}` -> how many held keys send it
    this.sent = [];          // recent messages, for the echo guard
    this.echoes = false;
    addEventListener('pagehide', () => { if (this.out && this.thru) this.local(true); });
    // Reconnect silently when the browser already holds permission.
    if (this.supported) navigator.permissions?.query({ name: 'midi' }).then(p => { if (p.state === 'granted') this.connect(); }).catch(() => {});
  }

  get connected() { return this.names.length > 0; }
  // Thru only works when the keyboard's output port was found too.
  get thruActive() { return this.thru && !!this.out; }

  async connect() {
    if (!this.supported) return false;
    try {
      this.access = await navigator.requestMIDIAccess();
      this.access.onstatechange = () => this.bind();
      this.bind();
      return true;
    } catch (e) { this.denied = true; this.onChange(); return false; }
  }

  bind() {
    this.names = [];
    const inputs = [];
    this.access.inputs.forEach(input => {
      if (input.state === 'disconnected') return;
      inputs.push(input);
      this.names.push(input.name || 'MIDI input');
      input.onmidimessage = e => this.message(e.data);
    });
    const out = this.pairOutput(inputs);
    if (out !== this.out) {
      this.out = out; this.held.clear(); this.sounding.clear(); this.echoes = false;
      if (out && this.thru) this.local(false); // a reconnected keyboard starts with Local On
    }
    this.onChange();
  }

  // The keyboard's own output: same name as an input, else the only output there is.
  pairOutput(inputs) {
    const outs = [];
    this.access.outputs.forEach(o => { if (o.state !== 'disconnected') outs.push(o); });
    const names = inputs.map(i => i.name);
    return outs.find(o => names.includes(o.name))
      || outs.find(o => inputs.some(i => i.manufacturer && i.manufacturer === o.manufacturer))
      || (outs.length === 1 && inputs.length ? outs[0] : null);
  }

  message(d) {
    if (!d.length || d[0] >= 0xf0) return; // clock, sysex and other system messages
    const st = d[0] & 0xf0, ch = d[0] & 0x0f;
    if (st === 0xb0 && d[1] === 122) { this.echoes = true; return; }
    if (this.thruActive && this.echoes && this.isEcho(d)) return;
    if (st === 0x90 && d[2] > 0) { this.onNote(d[1], d[2] / 127, ch); return; }
    if (st === 0x80 || st === 0x90) { if (this.thruActive) this.release(ch, d[1]); return; }
    if (this.thruActive && !(st === 0xb0 && d[1] >= 120)) this.send([...d]); // pedal, bend, mod, program…
  }

  send(d) {
    if (!this.out) return;
    try { this.out.send(d); } catch (e) { return; }
    const now = performance.now();
    this.sent = this.sent.filter(s => now - s.t < ECHO_MS);
    this.sent.push({ k: d.join(','), t: now });
  }

  isEcho(d) {
    const now = performance.now(), k = [...d].join(',');
    const i = this.sent.findIndex(s => s.k === k && now - s.t < ECHO_MS);
    if (i < 0) return false;
    this.sent.splice(i, 1);
    return true;
  }

  // Key `key` on channel `ch` sounds `note` on the keyboard. Two held keys can
  // snap to one note; it stops only when both are released.
  play(ch, key, note, vel) {
    const hk = `${ch}:${key}`;
    if (this.held.has(hk)) this.release(ch, key);
    note = Math.max(0, Math.min(127, note));
    const sk = `${ch}:${note}`, n = this.sounding.get(sk) || 0;
    if (n) this.send([0x80 | ch, note, 0]); // retrigger
    this.send([0x90 | ch, note, Math.max(1, Math.min(127, Math.round(vel * 127)))]);
    this.held.set(hk, note); this.sounding.set(sk, n + 1);
  }

  release(ch, key) {
    const hk = `${ch}:${key}`, note = this.held.get(hk);
    if (note === undefined) return;
    this.held.delete(hk);
    const sk = `${ch}:${note}`, n = (this.sounding.get(sk) || 1) - 1;
    if (n > 0) { this.sounding.set(sk, n); return; }
    this.sounding.delete(sk);
    this.send([0x80 | ch, note, 0]);
  }

  // Local Control (CC 122) on all 16 channels: a keyboard listens on its own one.
  local(on) {
    for (let ch = 0; ch < 16; ch++) {
      if (on) this.send([0xb0 | ch, 123, 0]); // all notes off first
      this.send([0xb0 | ch, 122, on ? 127 : 0]);
    }
  }

  setThru(on) {
    if (on === this.thru) return;
    if (this.out) {
      if (!on) [...this.held.keys()].forEach(k => { const [ch, key] = k.split(':'); this.release(+ch, +key); });
      this.local(!on);
    }
    this.thru = on;
    this.onChange();
  }
}
