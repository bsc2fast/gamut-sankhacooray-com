# Scales by genre

The left pane has two ways into the library: **World** (scales by region) and
**Genre** (scales by the music that uses them). A genre lists scales from any
region, and each one carries a line on how the genre uses it. That line is the
caption under the wheel while you browse by genre.

## How it works

- `GENRES` in `scales.js`: `{ id, name, short?, hue, scales: [{ s, why }] }`.
  `short` is the chip label when the full name is too long for two chips a row.
- `app.js` keeps the active genre in `genre`. `pickGenre(id)` sets it and picks
  its first scale (or keeps the current one if it belongs). Picking a scale
  outside the genre, or a region, ends genre browsing.
- While a genre is active: the list pane shows its scales (the dot is the
  scale's region colour), ←/→ step through them, ↑/↓ step through genres, and
  the URL gains a third part: `#freygish/D/klezmer`.
- The scene, colour and voice still come from the scale's own region.

## Rules for the lists

- A scale is listed only where it is a recognised part of the genre's
  practice, not merely possible in it. Every genre can borrow anything.
- At most 12 scales a genre, so the list fits the pane without scrolling.
- Where two library scales share a shape, the genre uses the name its own
  musicians use (Freygish in klezmer, Phrygian dominant in metal, Hitzaz noted
  under Balkan).
- A genre scale that the library lacks is left out and noted below, not faked.

## What the research says, and where it is thin

- **Celtic.** Irish and Scottish tunes use Ionian, Dorian, Mixolydian and
  Aeolian, often with one or two notes left out (hexatonic, pentatonic).
  Dorian is far more common than Aeolian; Mixolydian comes from the pipes.
- **Klezmer.** Four modes named after synagogue prayer modes: Ahava Rabbah
  (Freygish), Mi Sheberach, Adonoy Moloch and Mogen Ovos. Beregovski estimated
  Freygish at about a quarter of the tunes he collected. Malin and Shanahan's
  corpus study is the rigorous source; mode names vary between writers.
- **Flamenco.** The "flamenco key" is Phrygian with a major tonic chord, so
  the 3rd is raised at rest (Phrygian dominant) and both 3rds are in use
  (Spanish 8-tone). The Andalusian cadence is iv–III–II–I in Phrygian.
- **Metal.** Natural minor is the most used; Phrygian's ♭2 is a marker of the
  style; harmonic minor and Phrygian dominant for neoclassical and "Eastern"
  colour; Locrian is rare in pure form. Sources are mostly guitar teaching
  material, with one academic article on the ♭2 in Spanish metal.
- **Ethio-jazz.** The four qenet (tizita, bati, ambassel, anchihoye) are the
  base. Sources disagree on exact pitches and on which variants count; the
  library keeps major and minor forms of tizita and bati.
- **Enka · Min'yō.** Enka's main scale is yonanuki minor (minor without its
  4th and 7th) and its major twin; both came from Western-influenced school
  songs, not from older Japanese music. Min'yō uses the yo scale; miyako-bushi
  is the in scale. Yonanuki minor has the notes of Hirajoshi, so that entry
  stands in for it.
- **Indian film music.** Yaman, Bhairavi and Bhimpalasi are named again and
  again as film favourites. **Pahadi is described as the most common raga in
  Hindi film song and is not in the library yet**; it should be added. No
  source ranks ragas by count; K. L. Pandey's Hindi Cine Raag Encyclopaedia is
  the place to check.
- **Arabic song.** Bayati, Rast and Hijaz are described as the most widely
  used maqamat; Kurd, Nahawand and Ajam have no quarter tones, which is why
  they suit keyboards and chords. No corpus study of maqam use in pop was
  found, so the list is "widely used", not ranked.
- **Hip-hop · Electronic, Film scores, Pop & rock.** These rest on common
  teaching practice, not on corpus studies. The notes are worded as
  tendencies.

## Not built yet

- Add Raga Pahadi, then put it first under Indian film music.
- Reggae, Latin (son, salsa, bossa nova) and K-pop were left out: their scale
  use is not distinct enough from Pop & rock or Jazz to earn a list.
- Gamelan, Hindustani and Carnatic classical music are regions already.
- A genre could also set the voice (distorted guitar for metal, oud for Arabic
  song).

## Sources

- Qenet: https://wikipedia.com/wiki/Qenet
- Ethio-jazz: https://en.wikipedia.org/wiki/Mulatu_Astatke
- Malin and Shanahan, Modes in Klezmer Music (Music Theory Online): https://mtosmt.org/issues/mto.25.31.3/mto.25.31.3.malin.php
- Horowitz, The Main Klezmer Modes: https://klezmershack.com/articles/horowitz/horowitz.klezmodes.html
- Film songs based on classical ragas (Songs of Yore): https://www.songsofyore.com/best-film-songs-based-on-classical-ragas/
- Hindi Cine Raag Encyclopaedia, review: https://www.songsofyore.com/hindi-cine-raag-encyclopaedia-by-kl-pandey-book-review/
- Enka: https://en.wikipedia.org/wiki/Enka
- Min'yō: https://www.wikipedia.org/wiki/Min%27yo
- The Music of the Arab World (Piza): https://pressbooks.cuny.edu/apiza/chapter/chapter-3-the-music-of-the-arab-world/
- Arabic maqam: https://en.wikipedia.org/wiki/Arabic_maqam
- Scales for metal (Guitar World): https://www.guitarworld.com/lessons/harmonic-minor-and-beyond-great-scales-heavy-metal-guitar-playing
- The flatted second in Spanish heavy metal: https://revistas.ucm.es/index.php/CMIB/en/article/view/65528
- Moore, The Flamenco Key: https://pages.ucsd.edu/~moore/solbul.pdf
- Flamenco mode: https://en.wikipedia.org/wiki/Flamenco_mode
- Andalusian cadence: https://en.wikipedia.org/wiki/Andalusian_cadence
- A Brief Tutorial on Musical Modes (Chambers): https://trillian.mit.edu/~jc/doc/abc/Modes.html
- Irish traditional music: https://en.wikipedia.org/wiki/Irish_traditional_music
