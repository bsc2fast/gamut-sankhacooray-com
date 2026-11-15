# Gamut

Scales of the world on one chromatic wheel. Each scale is drawn as a polygon
(C on top) over a cinematic landscape from its homeland, and every scale is
playable with synthesised voices (pluck, koto, gamelan bell, reed, keys) and a
tanpura or pad drone.

Live: https://gamut.sankhacooray.com

- About 250 scales across 12 regions: Western modes, blues (including microtonal
  blue notes), jazz, Arabic maqamat, Persian dastgahs and a Turkish makam with
  true quarter tones, folk Europe (klezmer, Greek dromoi, Gaelic hexatonics),
  Hindustani thaats and some forty ragas grouped by time of day, all 72
  Carnatic melakartas plus well-known janya ragas, China and Korea, Japan,
  Southeast Asia (pelog and its pathet, slendro, Thai 7-equal), Africa
  (Ethiopian qenet, kora, mbira, Gnawa, Chopi) and symmetric scales.
- Long regions are split into sub-tabs (thaats and ragas by time of day;
  melakartas and janyas; quarter-tone and 12-tone maqamat) so the list never
  scrolls.
- "Same shape elsewhere" links scales with identical notes or modes across
  cultures (Kafi = Dorian = Kharaharapriya).
- "Draw a shape" lets you tap sockets to add notes and tap lit notes to remove
  them, building a scale and seeing what it is called around the world.

- "Play along" connects a MIDI keyboard (Chrome, Edge, Firefox). Keys outside
  the scale can snap to the nearest scale note, stay silent, or sound as
  played; white keys can play any scale in order; and a Fading guide withdraws
  the help as you improve. A piano diagram shows what every key will sound.

## Layout

```
public/
  index.html          shell + share metadata
  css/app.css         theme tokens (light/dark), floating panes, wheel styles
  js/scales.js        scale data, melakarta generator, cross-culture matching
  js/audio.js         Web Audio engine (MIDI-number API, microtone-safe)
  js/assist.js        play-along key mapping, assist modes, fading guide
  js/midi.js          Web MIDI input
  js/wheel.js         SVG chromatic wheel with morphing polygon
  js/scene.js         procedural landscapes, particles, camera drift
  js/app.js           state, UI, keyboard, URL hash (#hijaz/D)
scripts/shoot.mjs     headless Chrome screenshots + console errors
```

## Run locally

```
cd public && python3 -m http.server 8810 --bind 127.0.0.1
```

## Hue lights

Philips Hue lamps on the same network take each scene's colours and flash with
every note.

```
node scripts/hue-relay.mjs      # reads ~/.config/hue/bridge.json
```

Then open https://gamut.sankhacooray.com/?hue in Chrome and allow local network
access if asked. Shift+H toggles the lights.

## Deploy

Cloudflare Worker `gamut-sankhacooray` (static assets only):

```
CLOUDFLARE_ACCOUNT_ID=9a1da48a0f61e7cebcba39517856d87e npx wrangler deploy
```

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how each module works, the data format, how to add a scale, region or scene, and testing pitfalls
- [docs/ASSIST.md](docs/ASSIST.md): the play-along modes, the research behind fading help, and how it differs from existing scale modes
- [docs/ROADMAP.md](docs/ROADMAP.md): the MIDI plan (input quantised to the scale, output with pitch-bend microtones), other ideas and known limits
