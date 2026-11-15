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

## Not built yet

- MIDI output (send the mapped notes to a synth or DAW, with pitch bend for
  microtones). See ROADMAP.md.
- Sustain pedal and note-off: voices decay on their own, so they aren't needed
  yet.
- A retention check for the Fading guide: come back the next day, play with no
  help, and compare accuracy.
- Snap that follows melodic direction on ties, instead of always going down.

## Sources

- Novation Launchkey scale modes: https://userguides.novationmusic.com/hc/en-gb/articles/27537167308562
- Hsieh et al., Skill-Adaptive Ghost Instructors: https://arxiv.org/abs/2603.06253
- Guidance hypothesis overview: https://perceptionactionlab.blogspot.com/2012/03/guidance-hypothesis.html
- Faded feedback and retention (review): https://pmc.ncbi.nlm.nih.gov/articles/PMC7205416
