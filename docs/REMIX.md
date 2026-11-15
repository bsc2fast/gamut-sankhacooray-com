# Remix a song (experimental)

Load a song's notes, see which scale each stretch of it is in, give any stretch
another scale, and hear the result. Happy Birthday in natural minor sounds sad;
in Locrian it sounds wrong in an interesting way; in Hijaz it travels.

The music button in the app bar (or `R`) opens it. A song is one of:

- the built-in demo (Happy Birthday, public domain);
- a standard MIDI file (`.mid`);
- a note export from Cadence (`cadence-notes` JSON), dropped on the page or
  handed over with `?song=<url>` (only this origin or `127.0.0.1` is fetched).

Audio is never loaded: Gamut plays the *notes* through its own synths, which is
what makes it possible to move them.

## What is on screen

- **Dock along the bottom** (full width, in place of the apps bar while a song is loaded)**:** title, time, a chip per track (mute), `Original`
  (hear it as written), and a timeline with two lanes: **Was** (the scale each
  stretch was written in) and **Now** (what it plays in). Changed stretches are
  filled with the accent colour. Under the lanes is a small piano roll; moved
  notes are drawn in the accent colour. Click or drag to seek.
- **Picking a scale** works exactly as before (list, arrows, Same shape, Draw a
  shape, Root). While a song is loaded the pick goes to the selected stretch.
  With several stretches, click one in the timeline to change only that one;
  the `Now` button selects the whole song again.
- **The wheel** shows the new scale, with the old one as a dashed outline. The
  plate reads "was C Major". Melody notes light their vertex as they sound.
- **Mood chips** are shortcuts: As written, Sad (natural minor), Dark
  (Phrygian), Scary (Locrian), Dreamy (Lydian), Bluesy, Desert (Hijaz), Japan
  (Hirajoshi).
- **Root** moves the stretch's root, so it also transposes.
- The app bar's one button becomes **Play song / Pause** (Space).

## How a note is moved (`remap.js`)

For each stretch, `buildMap(oldSteps, newSteps, weights)` returns twelve
numbers: for every semitone above the old root, where it sounds above the new
root. The octave is kept, so `mapNote` is `note − rel + map[rel] + rootShift`.

1. **Same number of notes: by degree.** The 3rd goes to the 3rd, the 6th to the
   6th. Major to natural minor lowers 3, 6 and 7. This is the parallel-mode
   swap musicians do by hand, and it is the order-preserving one-to-one voice
   leading between the two scales (Tymoczko's interscalar transposition with
   the root held).
2. **Different number of notes: aligned in order.** A small dynamic programme
   pairs old degrees with new ones without any voice crossing another, with
   the root fixed, minimising `Σ weight × distance moved`. `weight` is how
   long the song spends on each note in that stretch, so the notes it leans
   on move least.
   - Fewer notes in the new scale (7 → 5): neighbours merge onto one note, and
     every note of the new scale is used.
   - More notes (5 → 7): each old note gets its own new note; some stay unused.
3. **Notes outside the old scale** (passing notes, blue notes, transcription
   slips) keep their place between their two scale neighbours:
   - if both neighbours stay where they were, so does the note;
   - otherwise it lands on a note of the new scale between the neighbours'
     new positions if there is one, else on the nearer neighbour;
   - with **Keep passing notes** on, it lands on the nearest semitone there
     instead, so it stays outside the scale as it was.
4. **Ties** go to the note nearer the original pitch, then down when the new
   scale is darker than the old one (lower on average) and up when brighter.
5. **A stretch that uses only part of the song's main scale** (a pentatonic
   verse inside a major song) is mapped as the main scale, so the notes it
   happens to leave out go where they go in the rest of the song.

Microtonal targets work: the map holds floats, and the synths take fractional
MIDI numbers (C major to Pelog gives 0, 1.2, 2.7, 5.4…).

Worked examples from C major (rows are the twelve semitones above the root):

| to | map |
|---|---|
| Natural minor | 0 1 2 3 **3** 5 6 7 8 **8** 10 **10** |
| Locrian | 0 1 **1** 3 **3** 5 6 **6** 8 **8** 10 **10** |
| Hijaz | 0 1 **1** 4 4 5 6 7 8 **8** 10 **10** |
| Minor pentatonic | 0 0 **3** 3 **3** 5 6 7 7 **10** 10 **10** |

### Why this way

- Mapping by scale degree keeps each note's job in the tune (tonic stays home,
  the leading note still leads), which is what carries a melody's identity;
  only the colour of the degrees changes.
- Minimal, crossing-free voice leading between scales is the standard
  formal answer to "which note of scale B corresponds to this note of scale
  A": Tymoczko, *A Geometry of Music* (2011), §4.8–4.9; "Scale Theory, Serial
  Theory and Voice Leading" (2008).
- Lowering scale degrees makes a tune sound less happy, in order from Lydian
  down to Phrygian and Locrian: Temperley & Tan, "The Emotional Connotations of
  Diatonic Modes", *Music Perception* 30(3), 2013. That is why the mood chips
  run Dreamy → Sad → Dark → Scary, and why ties follow the direction of the
  change.
- Plain "snap to the nearest scale note" (what MIDI scale effects such as
  Ableton's Scale device do) is the fallback for notes outside the old scale
  only. Used for everything, it leaves most of a major tune untouched in minor
  (E is as close to F as to E♭) and gives the wrong third.

## Finding the scale (`detectLane`)

A Cadence export carries its own scale lane (from the audio). A MIDI file does
not, so the key is found from the notes: the time each pitch class sounds is
correlated with the Krumhansl-Kessler major and minor profiles on all twelve
roots. The song is cut into windows of about 16 s; a window gets its own key
only when that key beats the song's main key by a clear margin, so the lane
shows real changes and not noise. Detected stretches are Major or Natural minor.

## Playing (`song.js`, `audio.js`)

- A look-ahead scheduler (40 ms tick, 0.3 s horizon) sends each note to
  `Engine.note` at its exact audio-clock time. Each track has its own gain, so
  mute is instant.
- Voices by track kind: vocals → reed, piano and other → keys, guitar and bass
  → pluck, drums → `Engine.drum` (synth kick, snare, hat by General MIDI note).
  The Voice selector overrides the lead track.
- Speed re-anchors the clock; note lengths scale with it.

## Song shape (`songfile.js`)

```js
{ title, artist, seconds,
  tracks: [{ id, name, kind, notes: [[t, dur, midi, vel], …] }],   // kind: vocals bass guitar piano other drums mix
  lane:   [{ t0, t1, root, id?, steps? }] }                        // empty → detected
```

Cadence's `lane[].notes` are absolute pitch classes; `fromCadence` turns them
into steps above the root.

## Limits

- It is a re-performance by synths, not the recording. Lyrics and timbre go.
- Transcribed notes (from Cadence) contain mistakes; a wrong note is moved as
  faithfully as a right one.
- One root per stretch. A chord borrowed from another key is treated as
  passing notes.
- Not deployed yet; the Cadence hand-off points at a local Gamut.
