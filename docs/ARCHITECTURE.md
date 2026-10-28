# How Gamut works

Plain ES modules served as static files. No build step, no dependencies. Everything
on screen and every sound is generated in the browser.

```
index.html ─ app.js ─┬─ scales.js   data + matching
                     ├─ audio.js    Web Audio engine
                     ├─ wheel.js    SVG wheel
                     ├─ scene.js    canvas landscape
                     └─ hue.js ─ http://127.0.0.1:8811 ─ scripts/hue-relay.mjs ─ Hue bridge
```

## Origin

Inspired by bit_wonder's reel "One Melody, Five World Scales" (Maqam Hijaz,
Degung, In, Gong, Dorian drawn as polygons on a pixel-art brass 12-tone wheel,
C on top). Gamut extends it to scales from around the world, adds blues (missing
in the reel), makes every scale playable, and ties each one to a landscape from
its home culture.

## Pitch model

- A scale is `steps`: semitones above the root, ascending, starting at `0`.
- Steps may be fractional for microtones: `3.5` is a quarter tone above E♭
  (Rast's E half-flat); `1.2`, `2.7`… are Pelog cents ÷ 100.
- Audio takes MIDI numbers as floats (`60 + root + step`), so microtones are
  exact. The wheel places a vertex at angle `pc / 12 × 360°`, so microtones sit
  between sockets.
- The root is a pitch class 0–11 (0 = C). URL names: `C Db D Eb E F Fs G Ab A Bb B`.

## scales.js

| Export | What |
|---|---|
| `NOTE_NAMES` | Display names with ♭/♯ |
| `REGIONS` | 12 regions: `id, name, tag, hue, scene, voice, drone?` |
| `SCALES` | 180 scales: `region, id, name, steps, sub?, o, d, scene?` |
| `byId`, `regionOf(id)` | Lookups |
| `melakarta(n)` | Steps for melakarta 1–72 (from the RIGA/DHANI tables) |
| `matches(steps, selfId)` | Other scales with the same pitch set (`same`) or a rotation of it (`mode`, with the offset) |

Scale fields:
- `o` is the origin shown under the title, e.g. "Okinawa, Japan".
- `d` is a one-line description.
- `sub` is a subtitle.
- `scene` overrides the region's landscape. Examples: Korea → `pines`,
  Ryūkyū → `island`, Selisir → `terraces`, Thai → `river`,
  Ethiopian → `highlands`.

Count by region: western 12, blues 6, jazz 13, arabic 13, europe 10,
hindustani 16, carnatic 72 (generated), china 7, japan 7, seasia 5, africa 10,
symmetric 9.

**Adding a scale:** append one line to `RAW` in its region block:

```js
['japan', 'kumoi', 'Kumoi', [0, 2, 3, 7, 9], { o: 'Japan', d: '…' }],
```

It then appears in the list, in matching, and in URLs (`#kumoi/D`) with no
other changes.

**Adding a region:** add it to `REGIONS` with a hue, a scene id, a default
voice and optionally `drone: true`.

## audio.js — `Engine`

- `ensure()` creates the AudioContext on the first user gesture. The chain is
  master → compressor → destination, plus a convolver reverb send (generated
  impulse).
- `note(midi, t, dur, voice, dest?, vel?)` plays one note. The voices:

  | Voice | Sound |
  |---|---|
  | `pluck` | Karplus-Strong string, retuned with playbackRate so microtones stay exact (oud, kora, veena) |
  | `koto` | brighter, shorter pluck |
  | `bell` | inharmonic metallophone partials plus a detuned twin for gamelan ombak beating |
  | `reed` | detuned saws through a lowpass, harmonium-like |
  | `keys` | FM electric piano |

- `sequence(midis, {step, voice, onStep})` schedules a run and returns
  `{stop()}`. `onStep(i)` drives the wheel highlight and the comet.
- `startDrone(rootMidi, fifthMidi, style)` / `stopDrone()`. The style is
  `tanpura` (Hindustani and Carnatic: plucked Pa–Sa–Sa–low Sa cycle) or `pad` (detuned saws through a slowly swept lowpass).
- `level()` returns the output loudness, which pulses the scene.
  `onNote(cb)` is a hook.
- `VOICES` lists the voice ids and names for the UI. When the voice is set to
  `auto`, the region's default voice is used.

## wheel.js — `Wheel(svg, {onNode, onSlot})`

- The SVG viewBox is −200…200. It's built from a brass ring, a face,
  engravings (48 ticks for quarter tones), 12 sockets and labels, plus the
  polygon, glow, spokes, nodes, comet and centre orb.
- `set(pcs, ghosts, labels)`: `pcs` are absolute pitch classes (floats) in
  scale order. Vertices tween from the nearest previous vertex over 420 ms.
  `ghosts` holds up to 6 faint polygons for the other scales in the region.
  `labels[i].micro` adds a small label for microtonal notes.
- `play(i)` lights node i and beats the orb.
- `cometAt(prog, seq)` moves the comet along the run.
- `setOrb(text)` sets the text in the centre orb.
- `onNode(i)` fires when a vertex is clicked and plays that degree. `onSlot(pc)`
  fires when a socket is clicked and toggles a note in Draw a shape mode.

## scene.js — `Scene(canvas)`

- `SCENES` holds 17 scene configs:
  `alps bayou rain desert steppe ganges palms karst pines sakura volcano terraces river island savanna highlands aurora`.
  Each config has:
  - a sky gradient;
  - a celestial body (`moon`, `crescent`, `sun`);
  - a star count;
  - ridge `layers` of kind `peaks mountains hills dunes mesa karst volcano fuji terraces islands ghats city flat`, with props;
  - optional water line, haze colour, ink (silhouette) colour;
  - particles `[kind, count, colour]`: snow, fireflies, rain, sand, pollen, diyas, leaves, petals, lanterns, …;
  - flags: `mist`, `birds`, `boat`, `aurora`.
- `PROPS` holds the silhouette painters: pine, cypress, poplar, eucalyptus,
  palm, acacia, baobab, giraffe, mosque, windmill, grass, shikhara, gopuram,
  pagoda, pavilion, torii, sakura, stupa, candi, chedi, tukul.
- `set(id, light)` switches scenes with a crossfade. `light` renders the
  daytime palette for the light theme.
- `pulse(v)` brightens the scene for a note. Each frame adds camera drift and
  parallax.
- Ridges use a seeded RNG, so a given scene always looks the same.

**Adding a scene:** add a config to `SCENES` (and new props to `PROPS` if
needed), then point a region or scale `scene` at it.

## Philips Hue — hue.js + scripts/hue-relay.mjs

Room lights follow the scene and flash with the music.

- **Why a relay:** the site is HTTPS, so the browser can't call the bridge's
  plain-HTTP API (mixed content), and the bridge username must not reach a
  public page. `node scripts/hue-relay.mjs` listens on `127.0.0.1:8811`. It
  reads the bridge IP and username from `~/.config/hue/bridge.json`, and only
  accepts requests from `https://gamut.sankhacooray.com` and localhost origins.
  It answers Chrome's Private Network Access preflight.
- **Relay endpoints:**

  | Endpoint | What |
  |---|---|
  | `GET /hue` | `{lights:[{id,name}], sent, error}`, listing reachable colour lights (all of them are used) |
  | `POST /hue/ambient` | `{xy, bri, ms}` |
  | `POST /hue/pulse` | `{xy, bri, back:{xy,bri}, hold, fade}` |
  | `POST /hue/release` | restores each light's saved state |

- **How the relay sends commands:**
  - Commands are coalesced per light (the latest one wins) and paced at
    90 ms, within the bridge's budget of about 10 commands a second.
  - Each light's state is saved the first time it's touched. It's restored on
    release and on Ctrl+C.
- **Colours:** `lampColours(sceneId)` in scene.js gives `base`, `note` and
  `body`:
  - `base` is the horizon colour (`sky[2]`), which sets the ambient light at
    bri 110.
  - `note` is the particle colour, or the sun or moon colour when the particle
    colour is dark.
  - `body` is the sun or moon colour.

  Each note flashes a mix of `note` and `body`, by the note's position in the
  scale, then fades back to `base` over 450 ms. `vivid()` keeps the hue but
  boosts saturation, because lamps wash dusky colours out to white. Whites stay
  white. The colours are converted to CIE xy (Wide RGB D65).
- **Opt-in:**
  - Probing 127.0.0.1 from a public page can raise Chrome's local-network
    permission prompt, so nothing is probed until the user turns Hue on in one
    of these ways:
    - Shift+H;
    - visiting with `?hue`;
    - being on a localhost origin.
  - The choice is stored under the `gamut-hue` localStorage key.
  - The "Hue lights" chip appears only when the relay answers.
- Safari blocks the relay (no Private Network Access support), so use Chrome
  or Edge.

## app.js

- **State:** `{scale, root, voice, pattern: up|updown|down, bpm, drone, edit, custom}`.
- **Panes:**
  - Left: World (regions) → Scales. Carnatic shows a 6-column grid of the 72
    melakartas (one row per chakra; the chakra name is in each subtitle).
  - Centre: title plate, origin pin, wheel, note chips, caption.
  - Right: Root, Voice, Run, Tempo, Drone, Draw a shape, and Same shape
    elsewhere.
- **Mode chips:** "mode of X on F" moves the root so the sounding pitches stay
  the same. Hijaz on C becomes Harmonic minor on F.
- **Draw a shape:** clicking sockets toggles notes. The shape is named when it
  matches a known scale. The URL becomes `#custom-0.1.4.5.7/D`.
- **Keys:**

  | Key | Action |
  |---|---|
  | Space | play / stop |
  | ← / → | scale within the region |
  | ↑ / ↓ | region |
  | A–L, 1–9 | play scale degrees |
  | D | drone |
  | Shift+H | Hue lights on/off (connects to the relay the first time) |
  | Esc | close About |

- **URL hash:** `#<scaleId>/<root>`, e.g. `#hijaz/D`. Updated with
  `replaceState`.
- **Theme:** stored under the `sc-theme` localStorage key. The `--h` CSS
  variable takes the region's hue, which tints the UI.

## css/app.css

- Theme tokens are defined for light and dark (`data-theme` and
  `prefers-color-scheme`).
- The body is the scroller, so there's no overscroll bounce.
- The desktop grid is `286px 1fr 286px` with `grid-template-rows: minmax(0,1fr)`.
  The wheel SVG is absolutely positioned inside `.wheel-wrap`, so the page
  never scrolls at 1280×720 and up.
- Below 900px the panes stack.
- Film grain is a generated PNG data URI at opacity .045. It deliberately uses
  no `mix-blend-mode` (see Testing).
- `[hidden]{display:none!important}` is required because `.overlay` sets
  `display:grid`.

## Share assets

- `public/og.jpg`: 1200×630, rendered from `scripts/og.js` via `shoot.mjs`.
- `public/icons/*`: from `scripts/icon.html`, which takes `?mask=1` for the
  maskable icon and `?bg=1` for the apple touch icon. The polygon is Hijaz.
- `manifest.webmanifest`, and full OG/Twitter meta in `index.html`.

## Testing

`scripts/shoot.mjs <url> <out.png> [w] [h] [theme] [js] [dpr]` drives headless
Chrome over CDP and prints console errors.

- It removes the animated `.grain` layer before capture. With grain, captures
  can stall.
- It uses a random debugging port and SIGKILLs Chrome on exit.
- If captures time out, check for piled-up headless Chromes:
  `pgrep -fl "Google Chrome.*gamut-"`, then `pkill -f "Google Chrome.*gamut-"`.
  Don't run `pkill -f gamut-` alone, because it also kills the local server.
- macOS has no `timeout` command; use `perl -e 'alarm 40; exec @ARGV' node scripts/shoot.mjs …`.
- Audio can't be judged headless. Listen on a real device.
