# Roadmap

Status as of 2026-10-28: v1 is live at https://gamut.sankhacooray.com. All
scales are visual and audible.

## Next: MIDI

The goal is to connect MIDI gear and use Gamut to choose the scale.

1. **Input, quantise to scale.** `navigator.requestMIDIAccess()` reads
   note-on/off from a keyboard or pad and snaps each note to the nearest degree
   of the current scale and root, then plays it through `engine.note()`.
   - Option: map white keys to scale degrees in order, so any scale is playable
     on the white keys.
   - Light the matching wheel node with `wheel.play(i)`.
2. **Output, send to a synth or DAW.** Choose a MIDI output port and send the
   scale run, or quantised input, out.
   - Microtones: send pitch bend per note (±2 semitone range), with one channel
     per voice (MPE style). An alternative is MTS-ESP / MIDI Tuning Standard
     SysEx (bulk tuning dump) for synths that support it.
3. **Control.** MIDI CC or program change selects the scale. A CC knob changes
   the root. Learn mode would be useful.
4. **UI.** Add a "MIDI" chip group in the right pane: input port, output port,
   mode (Quantise / White keys / Thru). Show a small activity dot when MIDI is
   connected. Web MIDI needs Chrome or Edge, and Safari doesn't support it, so
   hide the group when `requestMIDIAccess` is missing.

Hooks already in place:
- `engine.note(midi, …)` takes float MIDI.
- `state.scale.steps` and `state.root` give the pitch set.
- `wheel.play(i)` lights a node.

## Done since v1

- Philips Hue (2026-10-28): the ambient colour follows the scene and the lamps
  flash on every note, through a local relay. See ARCHITECTURE.md.

## Ideas

- Hue:
  - an Entertainment API (DTLS streaming) mode for faster, tighter light
    sync;
  - spreading notes across several lamps by scale degree;
  - a launchd agent so the relay starts at login.

- More scales:
  - Turkish makam with 53-TET commas;
  - more Persian gushehs;
  - Greek rebetiko dromoi;
  - Byzantine echoi;
  - Indonesian regional pelog sets;
  - Andean, Celtic and Hungarian folk variants;
  - Hindustani ragas with vakra (zigzag) movement.
- Raga phrases: play the characteristic aroha/avaroha and pakad rather than
  plain runs.
- Play a well-known melody across scales, as the reel does with "one melody,
  five scales".
- Recording or export of a run as WAV/MIDI.
- Sampled instruments as an option alongside synthesis: oud, sitar, koto,
  gamelan.
- A tuning view showing cents deviation from 12-TET per degree.
- PWA offline cache (a service worker).

## Known limits

- Pelog and slendro vary by gamelan. Only one tuning set is used.
- Maqam quarter tones are idealised at 50 cents. Real practice varies by region
  and by maqam.
- The light theme scenes are daytime recolours of the night scenes, not
  separate art.
- Audio quality has only been checked headless (no errors). The voices,
  especially the tanpura, still need tuning by ear on a real device.
