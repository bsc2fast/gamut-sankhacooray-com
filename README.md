# Gamut

Scales of the world on one chromatic wheel. Each scale is drawn as a polygon
(C on top) over a cinematic landscape from its homeland, and every scale is
playable with synthesised voices (pluck, koto, gamelan bell, reed, keys) and a
tanpura or pad drone.

Live: https://gamut.sankhacooray.com

- About 180 scales across 12 regions: Western modes, blues (including microtonal
  blue notes), jazz, Arabic maqamat and Persian dastgahs with true quarter
  tones, folk Europe and klezmer, Hindustani thaats and ragas, all 72 Carnatic
  melakartas, China and Korea, Japan, Southeast Asia (pelog, slendro, Thai
  7-equal), Africa (Ethiopian qenet, kora, mbira, Chopi) and symmetric scales.
- "Same shape elsewhere" links scales with identical notes or modes across
  cultures (Kafi = Dorian = Kharaharapriya).
- "Draw a shape" lets you tap sockets to build a scale and see what it is called
  around the world.

## Layout

```
public/
  index.html          shell + share metadata
  css/app.css         theme tokens (light/dark), floating panes, wheel styles
  js/scales.js        scale data, melakarta generator, cross-culture matching
  js/audio.js         Web Audio engine (MIDI-number API, microtone-safe)
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
- [docs/ROADMAP.md](docs/ROADMAP.md): the MIDI plan (input quantised to the scale, output with pitch-bend microtones), other ideas and known limits
