// Web Audio engine. Every sound is synthesised: Karplus-Strong plucks (oud,
// koto, kora, veena), metallophone bells with gamelan beating, a harmonium-like
// reed and an FM electric piano. Notes are MIDI numbers with fractions for
// microtones, so later a MIDI interface can drive the same calls.

export const VOICES = [
  { id: 'pluck', name: 'Pluck' },
  { id: 'koto', name: 'Koto' },
  { id: 'bell', name: 'Bell' },
  { id: 'reed', name: 'Reed' },
  { id: 'keys', name: 'Keys' },
];

const hz = m => 440 * Math.pow(2, (m - 69) / 12);

export class Engine {
  constructor() {
    this.ctx = null;
    this.ks = new Map();
    this.listeners = new Set();
  }

  ensure() {
    if (!this.ctx) {
      const ctx = this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16; comp.ratio.value = 4;
      comp.connect(ctx.destination);
      this.out = ctx.createGain(); this.out.gain.value = 0.8;
      this.out.connect(comp);
      const verb = ctx.createConvolver();
      verb.buffer = this.impulse(2.6);
      const wet = ctx.createGain(); wet.gain.value = 0.28;
      this.out.connect(verb); verb.connect(wet); wet.connect(comp);
      this.analyser = ctx.createAnalyser(); this.analyser.fftSize = 256;
      comp.connect(this.analyser);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  impulse(sec) {
    const sr = this.ctx.sampleRate, len = sr * sec;
    const b = this.ctx.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    return b;
  }

  onNote(fn) { this.listeners.add(fn); }
  emit(midi, t) {
    const delay = Math.max(0, (t - this.ctx.currentTime) * 1000);
    setTimeout(() => this.listeners.forEach(fn => fn(midi)), delay);
  }

  // Karplus-Strong string, cached per delay length. The returned rate retunes
  // it exactly, so microtones stay in tune.
  string(f, decay, bright) {
    const sr = this.ctx.sampleRate;
    const N = Math.max(8, Math.round(sr / f));
    const key = `${N}:${decay}:${bright}`;
    let buf = this.ks.get(key);
    if (!buf) {
      const len = Math.floor(sr * 3);
      buf = this.ctx.createBuffer(1, len, sr);
      const y = buf.getChannelData(0);
      let prev = 0;
      for (let i = 0; i < N; i++) { prev = bright * (Math.random() * 2 - 1) + (1 - bright) * prev; y[i] = prev; }
      for (let i = N; i < len; i++) y[i] = decay * 0.5 * (y[i - N] + (i - N - 1 >= 0 ? y[i - N - 1] : 0));
      this.ks.set(key, buf);
    }
    return { buf, rate: f / (sr / (N + 0.5)) };
  }

  note(midi, t, dur, voice, dest = this.out, vel = 1) {
    const ctx = this.ensure();
    t = Math.max(t ?? ctx.currentTime, ctx.currentTime);
    const f = hz(midi);
    const env = ctx.createGain();
    env.connect(dest);
    const g = env.gain;
    const stop = (nodes, end) => nodes.forEach(n => { n.start(t); n.stop(end); });

    if (voice === 'pluck' || voice === 'koto') {
      const koto = voice === 'koto';
      const { buf, rate } = this.string(f, koto ? 0.994 : 0.997, koto ? 0.9 : 0.6);
      const src = ctx.createBufferSource();
      src.buffer = buf; src.playbackRate.value = rate;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
      lp.frequency.value = Math.min(9000, f * (koto ? 14 : 8));
      src.connect(lp); lp.connect(env);
      const end = t + Math.max(dur * 2.5, 1.6);
      g.setValueAtTime(0.9 * vel, t);
      g.setTargetAtTime(0, end - 0.25, 0.08);
      stop([src], end + 0.2);
    } else if (voice === 'bell') {
      // Metallophone partials, plus a twin tuned a few Hz sharp: the
      // "ombak" beating that makes a gamelan shimmer.
      const parts = [[1, 1, 2.8], [2.76, 0.45, 1.1], [5.4, 0.22, 0.5], [8.93, 0.1, 0.25]];
      const end = t + 3.2;
      const nodes = [];
      parts.forEach(([r, a, d], i) => {
        [0, i === 0 ? 3.5 : null].forEach(det => {
          if (det === null) return;
          const o = ctx.createOscillator(); o.frequency.value = f * r + det;
          const pg = ctx.createGain();
          pg.gain.setValueAtTime(0, t);
          pg.gain.linearRampToValueAtTime(a * (det ? 0.6 : 1), t + 0.004);
          pg.gain.exponentialRampToValueAtTime(0.0001, t + d);
          o.connect(pg); pg.connect(env); nodes.push(o);
        });
      });
      g.value = 0.32 * vel;
      stop(nodes, end);
    } else if (voice === 'reed') {
      const nodes = [-6, 6].map(c => {
        const o = ctx.createOscillator(); o.type = 'sawtooth';
        o.frequency.value = f; o.detune.value = c; return o;
      });
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
      lp.frequency.value = Math.min(4200, f * 5); lp.Q.value = 0.8;
      nodes.forEach(o => o.connect(lp)); lp.connect(env);
      const rel = t + dur * 0.95;
      g.setValueAtTime(0, t);
      g.linearRampToValueAtTime(0.16 * vel, t + 0.05);
      g.setValueAtTime(0.16 * vel, rel);
      g.linearRampToValueAtTime(0, rel + 0.25);
      stop(nodes, rel + 0.3);
    } else {
      // FM electric piano
      const car = ctx.createOscillator(); car.frequency.value = f;
      const mod = ctx.createOscillator(); mod.frequency.value = f;
      const idx = ctx.createGain();
      idx.gain.setValueAtTime(f * 2.2, t);
      idx.gain.exponentialRampToValueAtTime(f * 0.05, t + 0.9);
      mod.connect(idx); idx.connect(car.frequency); car.connect(env);
      const end = t + Math.max(dur * 2, 1.8);
      g.setValueAtTime(0, t);
      g.linearRampToValueAtTime(0.42 * vel, t + 0.006);
      g.exponentialRampToValueAtTime(0.0008, end);
      stop([car, mod], end + 0.05);
    }
    this.emit(midi, t);
  }

  // Plays a run of notes; returns a handle whose stop() fades it out.
  sequence(midis, { step, voice, onStep }) {
    const ctx = this.ensure();
    const bus = ctx.createGain(); bus.connect(this.out);
    const t0 = ctx.currentTime + 0.06;
    midis.forEach((m, i) => this.note(m, t0 + i * step, step, voice, bus));
    let raf, last = -1, done = false;
    const total = midis.length * step;
    const tick = () => {
      const i = Math.floor((ctx.currentTime - t0) / step);
      if (i !== last && i >= 0 && i < midis.length) { last = i; onStep?.(i, (ctx.currentTime - t0) / step); }
      if (ctx.currentTime - t0 > total + 0.1) { done = true; onStep?.(-1); return; }
      onStep?.(null, (ctx.currentTime - t0) / step);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return {
      get done() { return done; },
      stop: () => {
        cancelAnimationFrame(raf);
        bus.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
        setTimeout(() => bus.disconnect(), 600);
        done = true;
      },
    };
  }

  // Tanpura: Pa, Sa', Sa', Sa plucked in a slow cycle. Other regions get a
  // soft sustained pad on the root and fifth.
  startDrone(root, fifth, style) {
    this.stopDrone();
    const ctx = this.ensure();
    const bus = ctx.createGain(); bus.gain.value = 0; bus.connect(this.out);
    bus.gain.setTargetAtTime(1, ctx.currentTime, 0.4);
    const d = { bus, nodes: [], timer: null };
    if (style === 'tanpura') {
      const pat = [root - 12 + fifth, root, root, root - 12];
      let next = ctx.currentTime + 0.1, i = 0;
      d.timer = setInterval(() => {
        while (next < ctx.currentTime + 0.3) {
          const m = pat[i % 4];
          const { buf, rate } = this.string(hz(m), 0.9993, 0.5);
          const src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = rate;
          const g = ctx.createGain(); g.gain.value = 0.22;
          src.connect(g); g.connect(bus); src.start(next); src.stop(next + 3);
          next += i % 4 === 3 ? 1.1 : 0.55; i++;
        }
      }, 80);
    } else {
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = 2;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08;
      const lfoAmt = ctx.createGain(); lfoAmt.gain.value = 220;
      lfo.connect(lfoAmt); lfoAmt.connect(lp.frequency); lfo.start();
      lp.connect(bus);
      [root - 24, root - 12, root - 12 + fifth].forEach((m, k) => {
        [-5, 5].forEach(c => {
          const o = ctx.createOscillator(); o.type = 'sawtooth';
          o.frequency.value = hz(m); o.detune.value = c;
          const g = ctx.createGain(); g.gain.value = k === 2 ? 0.035 : 0.05;
          o.connect(g); g.connect(lp); o.start(); d.nodes.push(o);
        });
      });
      d.nodes.push(lfo);
    }
    this.drone = d;
  }

  stopDrone() {
    const d = this.drone;
    if (!d) return;
    this.drone = null;
    clearInterval(d.timer);
    d.bus.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25);
    setTimeout(() => { d.nodes.forEach(n => n.stop()); d.bus.disconnect(); }, 1500);
  }

  level() {
    if (!this.analyser) return 0;
    const a = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(a);
    let s = 0;
    for (const v of a) s += ((v - 128) / 128) ** 2;
    return Math.sqrt(s / a.length);
  }
}
