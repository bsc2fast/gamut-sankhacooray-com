# Play along: MIDI assist

A connected MIDI keyboard plays the selected scale. The Play along page (the
keyboard button in the app bar, or `M`) sets how keys outside the scale behave
and shows, on a piano diagram, the note every key will sound.

Code: `public/js/assist.js` (mapping and fading, no DOM), `public/js/midi.js`
(Web MIDI input), and the "play along" section of `public/js/app.js` (UI).

## Modes

| Mode | Keys in the scale | Keys outside the scale |
|---|---|---|
| Free | sound | sound as played; the wheel socket flashes red |
| Snap | sound | play the nearest scale note (ties go down) |
| Mute | sound | silent |
| White keys | every white key is the next scale note, starting at middle C = root | black keys are silent |
| Fading guide | sound | Snap, then Mute, then Free, as accuracy rises |

- **Microtones.** A quarter-tone degree has no key of its own, so it takes the
  nearest free key as its home. In Maqam Rast on C the E key plays E half-flat
  at its true pitch. This holds in every mode.
- **White keys** fits scales of any size: five-note slendro, seven-equal Thai
  and nine-note scales all run up the white keys with no gaps.
- **Fading guide** counts the last 16 notes. At 90% or more in the scale, help
  steps back one stage (Snap → Mute → Free). Under 60% over 8 or more notes, it
  steps forward again. Changing the scale or root starts over at Snap.
- **Follow the run** rings the next note of the current run (Up, Up & down or
  Down) on the wheel and on the diagram, and moves on when that note is played.
- With no MIDI device, tapping the diagram's keys plays through the same path.

## Why help should fade

- **Guidance hypothesis.** Salmoni, Schmidt & Walter (1984, *Psychological
  Bulletin* 95) reviewed feedback studies and proposed that guidance given on
  every attempt helps during practice but makes learners depend on it.
  Winstein & Schmidt (1990, *JEP: Learning, Memory, and Cognition* 16) found
  that a reduced, faded feedback schedule matched full feedback during
  practice and beat it on later no-feedback tests. Snap on every wrong key is
  that kind of constant guidance: it sounds right, and teaches little.
- **Challenge point.** Guadagnoli & Lee (2004, *Journal of Motor Behavior* 36)
  argue that learning is best when task difficulty matches the learner's
  current skill. The Fading guide moves the difficulty with measured accuracy
  instead of leaving one fixed setting.
- **Scaffolding.** Wood, Bruner & Ross (1976) describe support that a tutor
  withdraws as the learner takes over. The three stages are that withdrawal.
- **Piano evidence.** Hsieh et al. (CHI 2026, arXiv:2603.06253) compared fixed
  and skill-adaptive visual guides in VR piano with 30 players. Guides that
  faded on passages played well and returned after slips gave steadier
  retention. The retention test was 10 minutes later, so long-term effects are
  untested.

These claims come from secondary summaries and abstracts, not the full papers.
The piano-specific studies are small and short-term. Nobody has tested Gamut's
own thresholds (16 notes, 90%, 60%); they are starting values to tune.

## What exists, and the gap

- Novation Launchkey has three scale modes: Snap to Scale, Filter out of Scale
  and Easy Scale (scale on the white keys). Ableton Push, Live's Scale MIDI
  effect and Logic's scale quantise do similar things.
- These are fixed settings chosen for performance. None withdraws help as the
  player improves.
- They work in 12 equal steps. Quarter-tone maqamat, pelog, slendro and
  seven-equal tunings aren't playable at their true pitch.
- They don't show the mapping. Gamut's diagram labels every key with the note
  it will sound, and the wheel shows the scale's shape while you play.

## Sound from keyboard (thru)

A keyboard's keys and sound engine are wired together inside it, so a note
sounds before any MIDI leaves; Gamut can't cancel it afterwards. Instead the
chip sends Local Control Off (CC 122 = 0, on all 16 channels) to the paired
output port, which unhooks the keys from the engine:

    keys -> MIDI out -> Gamut (assist mode) -> MIDI in -> keyboard voice

- Each key press goes through `resolve()` as usual; `midi.play()` sends the
  result rounded to a whole note. Mute mode sends nothing.
- Note-off follows the key, not the note: midi.js remembers which note each
  held key sent. Two keys that snap to one note stop only when both are up.
- Pedal, pitch bend, modulation and program changes pass back unchanged.
- Local Control goes back on (after All Notes Off) when the chip is turned
  off or the page closes. If the browser crashes, power-cycling the keyboard
  restores it.
- Some keyboards echo received MIDI back out. Getting CC 122 back proves it,
  and only then are copies of what Gamut just sent dropped.
- Microtones: the keyboard plays 12 equal steps, so quarter tones round to the
  nearest key (the hint says so). With the chip off, Gamut plays them true.
- The output port is the one named like the input, else the same maker, else
  the only output. The chip is disabled when none is found.
- On-screen keys, scale runs, the drone and Remix still sound in Gamut.
- Some keyboards ignore CC 122 and only offer Local Control in a menu
  (Function or MIDI settings). Turn it off there and keep the chip on.

## Not built yet

- MIDI output to any port (a synth or DAW), with pitch bend for microtones.
  See ROADMAP.md.
- Microtones on the keyboard itself: one channel per note with its own pitch
  bend would play quarter tones on most GM keyboards.
- A retention check for the Fading guide: come back the next day, play with no
  help, and compare accuracy.
- Snap that follows melodic direction on ties, instead of always going down.

## Sources

- Novation Launchkey scale modes: https://userguides.novationmusic.com/hc/en-gb/articles/27537167308562
- Hsieh et al., Skill-Adaptive Ghost Instructors: https://arxiv.org/abs/2603.06253
- Guidance hypothesis overview: https://perceptionactionlab.blogspot.com/2012/03/guidance-hypothesis.html
- Faded feedback and retention (review): https://pmc.ncbi.nlm.nih.gov/articles/PMC7205416
