// Web MIDI input: every connected keyboard or pad feeds note-ons to one callback.
// Chrome, Edge and Firefox support it; Safari does not.

export class Midi {
  constructor(onNote, onChange) {
    this.onNote = onNote; this.onChange = onChange;
    this.supported = !!navigator.requestMIDIAccess;
    this.access = null; this.names = [];
    // Reconnect silently when the browser already holds permission.
    if (this.supported) navigator.permissions?.query({ name: 'midi' }).then(p => { if (p.state === 'granted') this.connect(); }).catch(() => {});
  }

  get connected() { return this.names.length > 0; }

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
    this.access.inputs.forEach(input => {
      if (input.state === 'disconnected') return;
      this.names.push(input.name || 'MIDI input');
      input.onmidimessage = e => {
        const [status, note, vel] = e.data;
        if ((status & 0xf0) === 0x90 && vel > 0) this.onNote(note, vel / 127);
      };
    });
    this.onChange();
  }
}
