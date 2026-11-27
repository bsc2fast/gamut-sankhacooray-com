// Scale library. Steps are semitones above the root; fractions are microtones
// (1.5 = 150 cents). `o` is where the scale comes from, `scene` overrides the
// region's landscape for scales rooted somewhere specific. A region with
// `groups` shows its list behind sub-tabs; each of its scales names its group
// in `g`. Ragas are their full note set (aroha ∪ avaroha), so a raga that only
// differs from its thaat by movement shares the thaat's shape.

export const NOTE_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

export const REGIONS = [
  { id: 'western',   name: 'Western',        tag: 'European mode',  hue: 265, scene: 'alps',      voice: 'keys' },
  { id: 'blues',     name: 'Blues',          tag: 'Blues',          hue: 222, scene: 'bayou',     voice: 'reed' },
  { id: 'jazz',      name: 'Jazz',           tag: 'Jazz',           hue: 196, scene: 'rain',      voice: 'keys' },
  { id: 'arabic',    name: 'Arabic & Persian', tag: 'Maqam',        hue: 172, scene: 'desert',    voice: 'pluck',
    groups: [{ id: 'maqam-q', name: 'Quarter-tone' }, { id: 'maqam', name: '12-tone' }, { id: 'persian', name: 'Dastgah · Makam' }] },
  { id: 'europe',    name: 'Folk Europe',    tag: 'Folk',           hue: 340, scene: 'steppe',    voice: 'reed' },
  { id: 'hindustani', name: 'Hindustani',    tag: 'Raga · North India', hue: 26, scene: 'ganges', voice: 'reed', drone: true,
    groups: [{ id: 'thaat', name: 'Thaats' }, { id: 'morning', name: 'Morning' }, { id: 'afternoon', name: 'Afternoon' }, { id: 'evening', name: 'Evening' }, { id: 'night', name: 'Night' }] },
  { id: 'carnatic',  name: 'Carnatic',       tag: 'Melakarta · South India', hue: 100, scene: 'palms', voice: 'pluck', drone: true,
    groups: [{ id: 'mela', name: 'Melakartas' }, { id: 'janya', name: 'Janya ragas' }] },
  { id: 'china',     name: 'China & Korea',  tag: 'Pentatonic',     hue: 6,   scene: 'karst',     voice: 'pluck' },
  { id: 'japan',     name: 'Japan',          tag: 'Japanese',       hue: 318, scene: 'sakura',    voice: 'koto' },
  { id: 'seasia',    name: 'Southeast Asia', tag: 'Gamelan',        hue: 44,  scene: 'volcano',   voice: 'bell' },
  { id: 'africa',    name: 'Africa',         tag: 'African',        hue: 74,  scene: 'savanna',   voice: 'pluck' },
  { id: 'symmetric', name: 'Symmetric',      tag: 'Symmetric',      hue: 140, scene: 'aurora',    voice: 'keys' },
];

const RAW = [
  // Western
  ['western', 'ionian', 'Major', [0, 2, 4, 5, 7, 9, 11], { sub: 'Ionian mode', o: 'Europe', d: 'The bright home scale of most Western music.' }],
  ['western', 'dorian', 'Dorian', [0, 2, 3, 5, 7, 9, 10], { o: 'Medieval Europe · named for ancient Greece', d: 'Minor with a raised 6th. Celtic airs, folk, funk and modal jazz.' }],
  ['western', 'phrygian', 'Phrygian', [0, 1, 3, 5, 7, 8, 10], { o: 'Medieval Europe · named for Phrygia, Anatolia', d: 'Minor with a dark ♭2. Heard in flamenco and metal.' }],
  ['western', 'lydian', 'Lydian', [0, 2, 4, 6, 7, 9, 11], { o: 'Medieval Europe · named for Lydia, Anatolia', d: 'Major with a floating ♯4. The sound of film scores and wonder.' }],
  ['western', 'mixolydian', 'Mixolydian', [0, 2, 4, 5, 7, 9, 10], { o: 'Medieval Europe', d: 'Major with a ♭7. Rock riffs, bagpipe tunes and Irish reels.' }],
  ['western', 'aeolian', 'Natural minor', [0, 2, 3, 5, 7, 8, 10], { sub: 'Aeolian mode', o: 'Europe', d: 'The plain minor scale.' }],
  ['western', 'locrian', 'Locrian', [0, 1, 3, 5, 6, 8, 10], { o: 'Europe · theory', d: 'A diminished 5th leaves it with no stable home. Rare but striking.' }],
  ['western', 'harmonic-minor', 'Harmonic minor', [0, 2, 3, 5, 7, 8, 11], { o: 'Baroque Europe', d: 'Minor with a raised 7th, the leading tone of classical cadences.' }],
  ['western', 'melodic-minor', 'Melodic minor', [0, 2, 3, 5, 7, 9, 11], { o: 'Europe', d: 'Minor below, major above. Jazz players call it "jazz minor".' }],
  ['western', 'harmonic-major', 'Harmonic major', [0, 2, 4, 5, 7, 8, 11], { o: 'Europe · Rimsky-Korsakov', d: 'Major with a ♭6. Bittersweet and Romantic.' }],
  ['western', 'major-pent', 'Major pentatonic', [0, 2, 4, 7, 9], { o: 'Worldwide', d: 'Five notes with no half steps. Found on every inhabited continent.' }],
  ['western', 'minor-pent', 'Minor pentatonic', [0, 3, 5, 7, 10], { o: 'Worldwide', d: 'The rock and blues guitar box.' }],

  // Blues
  ['blues', 'blues', 'Blues', [0, 3, 5, 6, 7, 10], { sub: 'Minor blues · hexatonic', o: 'Mississippi Delta, USA', d: 'Minor pentatonic plus the ♭5 "blue note". Born from West African song in the American South.' }],
  ['blues', 'blues-major', 'Major blues', [0, 2, 3, 4, 7, 9], { o: 'American South, USA', d: 'Major pentatonic plus a ♭3 slide. Country, gospel and boogie.' }],
  ['blues', 'blues-hepta', 'Heptatonic blues', [0, 2, 3, 5, 6, 9, 10], { o: 'USA', d: 'Seven-note blues with ♭3, ♭5 and ♭7.' }],
  ['blues', 'blues-nine', 'Nine-note blues', [0, 2, 3, 4, 5, 7, 9, 10, 11], { o: 'USA', d: 'Major and minor 3rds and 7ths side by side, the way blues players bend between them.' }],
  ['blues', 'blue-notes', 'Blue notes', [0, 3.5, 5, 6, 7, 9.69], { sub: 'Microtonal · between the keys', o: 'Mississippi Delta, USA', scene: 'bayou', d: 'What singers actually bend to: a neutral 3rd and the harmonic 7th, both between piano keys.' }],
  ['blues', 'gospel', 'Gospel', [0, 2, 3, 4, 7, 9, 10], { o: 'African American church, USA', d: 'Major blues with a ♭7 for the shout and turnaround.' }],

  // Jazz
  ['jazz', 'lydian-dominant', 'Lydian dominant', [0, 2, 4, 6, 7, 9, 10], { sub: 'Acoustic scale', o: 'New York · Bartók in Hungary', d: 'Major with ♯4 and ♭7. Follows the overtone series closely.' }],
  ['jazz', 'altered', 'Altered', [0, 1, 3, 4, 6, 8, 10], { sub: 'Super Locrian', o: 'Bebop, USA', d: 'Every tension at once over a dominant chord.' }],
  ['jazz', 'dorian-b2', 'Dorian ♭2', [0, 1, 3, 5, 7, 9, 10], { sub: 'Phrygian ♮6', o: 'Jazz theory', d: 'Second mode of melodic minor.' }],
  ['jazz', 'lydian-aug', 'Lydian augmented', [0, 2, 4, 6, 8, 9, 11], { o: 'Jazz theory', d: 'Lydian with a raised 5th. Shimmering and unresolved.' }],
  ['jazz', 'mixo-b6', 'Mixolydian ♭6', [0, 2, 4, 5, 7, 8, 10], { sub: 'Aeolian dominant', o: 'Jazz theory', d: 'Major turning minor halfway up.' }],
  ['jazz', 'locrian-2', 'Half-diminished', [0, 2, 3, 5, 6, 8, 10], { sub: 'Locrian ♮2', o: 'Jazz theory', d: 'For the m7♭5 chord in minor ii–V–i.' }],
  ['jazz', 'bebop-dom', 'Bebop dominant', [0, 2, 4, 5, 7, 9, 10, 11], { o: 'Harlem, New York · 1940s', d: 'Mixolydian plus a passing major 7th so chord tones land on the beat.' }],
  ['jazz', 'bebop-major', 'Bebop major', [0, 2, 4, 5, 7, 8, 9, 11], { o: 'Harlem, New York · 1940s', d: 'Major plus a passing ♭6.' }],
  ['jazz', 'bebop-dorian', 'Bebop Dorian', [0, 2, 3, 4, 5, 7, 9, 10], { o: 'Harlem, New York · 1940s', d: 'Dorian plus a passing major 3rd.' }],
  ['jazz', 'whole-tone', 'Whole tone', [0, 2, 4, 6, 8, 10], { o: 'Paris · Debussy', d: 'Six equal steps. Dreamy and directionless. Messiaen\'s mode 1.' }],
  ['jazz', 'dim-hw', 'Diminished half-whole', [0, 1, 3, 4, 6, 7, 9, 10], { o: 'Jazz · Messiaen\'s mode 2', d: 'Octatonic scale for dominant 7♭9 chords.' }],
  ['jazz', 'dim-wh', 'Diminished whole-half', [0, 2, 3, 5, 6, 8, 9, 11], { o: 'Jazz · Russia (Rimsky-Korsakov)', d: 'Octatonic scale for diminished chords.' }],
  ['jazz', 'augmented', 'Augmented', [0, 3, 4, 7, 8, 11], { o: 'Jazz · Coltrane', d: 'Two augmented triads interlocked.' }],

  // Arabic & Persian
  ['arabic', 'rast', 'Maqam Rast', [0, 2, 3.5, 5, 7, 9, 10.5], { g: 'maqam-q', sub: 'Arabic · quarter-tone', o: 'Arab world · Turkey', d: 'The "head" maqam. Its 3rd and 7th sit a quarter tone flat, between major and minor.' }],
  ['arabic', 'bayati', 'Maqam Bayati', [0, 1.5, 3, 5, 7, 8, 10], { g: 'maqam-q', sub: 'Arabic · quarter-tone', o: 'Iraq · Egypt · Levant', d: 'The most common maqam in Arabic song, with a three-quarter-tone 2nd. The Turkish Uşşak.' }],
  ['arabic', 'husayni', 'Maqam Husayni', [0, 1.5, 3, 5, 7, 8.5, 10], { g: 'maqam-q', sub: 'Arabic · quarter-tone', o: 'Iraq · Turkey (Hüseyni)', d: 'Bayati with the 6th half-flat as well. The Turkish Hüseyni.' }],
  ['arabic', 'saba', 'Maqam Saba', [0, 1.5, 3, 4, 7, 8, 10], { g: 'maqam-q', sub: 'Arabic · quarter-tone', o: 'Levant · Iraq', d: 'Saba sounds like weeping. A flat 4th makes it ache.' }],
  ['arabic', 'sikah', 'Maqam Sikah', [0, 1.5, 3.5, 5.5, 7, 8.5, 10.5], { g: 'maqam-q', sub: 'Arabic · quarter-tone', o: 'Egypt · Arab world', d: 'Sikah starts on a half-flat note, so the whole scale floats between the keys.' }],
  ['arabic', 'huzam', 'Maqam Huzam', [0, 1.5, 3.5, 4.5, 7.5, 8.5, 10.5], { g: 'maqam-q', sub: 'Arabic · quarter-tone', o: 'Egypt · Turkey (Hüzzam)', d: 'Sikah below, Hijaz above, all from a half-flat note. The Turkish Hüzzam.' }],
  ['arabic', 'jiharkah', 'Maqam Jiharkah', [0, 2, 4, 5, 7, 9, 10.5], { g: 'maqam-q', sub: 'Arabic · quarter-tone', o: 'Egypt', d: 'Major with the 7th a quarter tone flat. From the Persian chahargah, "fourth place".' }],
  ['arabic', 'suznak', 'Maqam Suznak', [0, 2, 3.5, 5, 7, 8, 11], { g: 'maqam-q', sub: 'Arabic · quarter-tone', o: 'Egypt · Turkey', d: 'Rast below, Hijaz above. Persian suz-nak, "burning".' }],
  ['arabic', 'hijaz', 'Maqam Hijaz', [0, 1, 4, 5, 7, 8, 10], { g: 'maqam', sub: 'Arabic ≈ 12-tone', o: 'Hejaz, Arabian Peninsula', scene: 'desert', d: 'Named after the Hejaz region. The wide 1½-step gap from ♭2 to 3 is its signature.' }],
  ['arabic', 'hijaz-kar', 'Maqam Hijaz Kar', [0, 1, 4, 5, 7, 8, 11], { g: 'maqam', sub: 'Arabic ≈ 12-tone', o: 'Egypt · Turkey', d: 'Two Hijaz tetrachords stacked. Also called Double harmonic.' }],
  ['arabic', 'nahawand', 'Maqam Nahawand', [0, 2, 3, 5, 7, 8, 11], { g: 'maqam', sub: 'Arabic ≈ 12-tone', o: 'Nahavand, Iran', d: 'Named after the Persian town. Close to harmonic minor.' }],
  ['arabic', 'kurd', 'Maqam Kurd', [0, 1, 3, 5, 7, 8, 10], { g: 'maqam', sub: 'Arabic ≈ 12-tone', o: 'Kurdistan', d: 'Named after the Kurds. The same notes as Western Phrygian.' }],
  ['arabic', 'lami', 'Maqam Lami', [0, 1, 3, 5, 6, 8, 10], { g: 'maqam', sub: 'Arabic ≈ 12-tone', o: 'Iraq', d: 'A rare Iraqi maqam built on a diminished 5th. The notes of Locrian.' }],
  ['arabic', 'ajam', 'Maqam Ajam', [0, 2, 4, 5, 7, 9, 11], { g: 'maqam', sub: 'Arabic ≈ 12-tone', o: 'Persia ("Ajam")', d: 'Ajam is the Arabic word for "Persian". It matches the Western major scale.' }],
  ['arabic', 'shawq-afza', 'Maqam Shawq Afza', [0, 2, 4, 5, 7, 8, 11], { g: 'maqam', sub: 'Arabic ≈ 12-tone', o: 'Egypt', d: 'Ajam below, Hijaz above. Harmonic major shares the notes.' }],
  ['arabic', 'nikriz', 'Maqam Nikriz', [0, 2, 3, 6, 7, 9, 10], { g: 'maqam', sub: 'Arabic ≈ 12-tone', o: 'Levant · Turkey', d: 'Minor with a raised 4th.' }],
  ['arabic', 'nawa-athar', 'Maqam Nawa Athar', [0, 2, 3, 6, 7, 8, 11], { g: 'maqam', sub: 'Arabic ≈ 12-tone', o: 'Egypt · Levant', d: 'Nikriz below, Hijaz above: two augmented 2nds. Hungarian minor shares the notes.' }],
  ['arabic', 'athar-kurd', 'Maqam Athar Kurd', [0, 1, 3, 6, 7, 8, 11], { g: 'maqam', sub: 'Arabic ≈ 12-tone', o: 'Egypt', d: 'Nawa Athar with a ♭2. The notes of the Hindustani Todi thaat.' }],
  ['arabic', 'persian', 'Persian', [0, 1, 4, 5, 6, 8, 11], { g: 'persian', o: 'Iran', d: 'A 12-tone stand-in for Persian colour, with a ♭5 and a major 7th.' }],
  ['arabic', 'shur', 'Dastgah Shur', [0, 1.5, 3, 5, 7, 8, 10], { g: 'persian', sub: 'Persian · koron', o: 'Iran', d: 'The mother of Persian dastgahs. Its 2nd is lowered by a koron, about a quarter tone.' }],
  ['arabic', 'homayoun', 'Dastgah Homayoun', [0, 1.5, 4, 5, 7, 8, 10], { g: 'persian', sub: 'Persian · koron', o: 'Iran', d: 'Regal and grave, with a koron 2nd and a major 3rd.' }],
  ['arabic', 'chahargah', 'Dastgah Chahargah', [0, 1.5, 4, 5, 7, 8.5, 11], { g: 'persian', sub: 'Persian · koron', o: 'Iran', d: 'Heroic and festive. Koron 2nd and 6th around a major 3rd and 7th, a cousin of Hijaz Kar.' }],
  ['arabic', 'esfahan', 'Bayat-e Esfahan', [0, 2, 3, 5, 7, 8.5, 11], { g: 'persian', sub: 'Persian · koron', o: 'Isfahan, Iran', d: 'Harmonic minor with the 6th raised by a koron. Named after the city.' }],
  ['arabic', 'karcigar', 'Makam Karcığar', [0, 1.5, 3, 5, 6, 9, 10], { g: 'persian', sub: 'Turkish · ≈ comma', o: 'Turkey', d: 'Uşşak below, Hicaz above. A favourite of Turkish folk and Romani bands.' }],

  // Folk Europe
  ['europe', 'freygish', 'Freygish', [0, 1, 4, 5, 7, 8, 10], { sub: 'Ahava Rabbah', o: 'Ashkenazi Jewish · Eastern Europe', d: 'The klezmer scale, from the prayer mode Ahava Rabbah.' }],
  ['europe', 'phrygian-dom', 'Phrygian dominant', [0, 1, 4, 5, 7, 8, 10], { sub: 'Flamenco', o: 'Andalusia, Spain', d: 'The flamenco sound of the Andalusian cadence.' }],
  ['europe', 'mi-sheberach', 'Ukrainian Dorian', [0, 2, 3, 6, 7, 9, 10], { sub: 'Mi Sheberach · Romanian minor', o: 'Ukraine · Romania', d: 'Dorian with a raised 4th. Used in doina laments and klezmer.' }],
  ['europe', 'hungarian-minor', 'Hungarian minor', [0, 2, 3, 6, 7, 8, 11], { sub: 'Gypsy minor', o: 'Hungary · Romani', d: 'Harmonic minor with a ♯4. Liszt\'s favourite colour.' }],
  ['europe', 'hungarian-major', 'Hungarian major', [0, 3, 4, 6, 7, 9, 10], { o: 'Hungary', d: 'Opens with an augmented 2nd and closes with a ♭7.' }],
  ['europe', 'double-harmonic', 'Byzantine', [0, 1, 4, 5, 7, 8, 11], { sub: 'Double harmonic', o: 'Byzantium · Greece · Balkans', d: 'Two augmented 2nds, symmetrical around the root.' }],
  ['europe', 'neapolitan-minor', 'Neapolitan minor', [0, 1, 3, 5, 7, 8, 11], { o: 'Naples, Italy', d: 'Harmonic minor with a ♭2.' }],
  ['europe', 'neapolitan-major', 'Neapolitan major', [0, 1, 3, 5, 7, 9, 11], { o: 'Naples, Italy', d: 'Melodic minor with a ♭2.' }],
  ['europe', 'spanish-8', 'Spanish 8-tone', [0, 1, 3, 4, 5, 6, 8, 10], { o: 'Spain', d: 'Phrygian with both minor and major 3rd, the way flamenco guitarists play it.' }],
  ['europe', 'enigmatic', 'Enigmatic', [0, 1, 4, 6, 8, 10, 11], { o: 'Italy · Verdi', d: 'Verdi\'s puzzle scale, from a newspaper riddle of 1888.' }],
  ['europe', 'pireotikos', 'Pireotikos', [0, 1, 4, 6, 7, 8, 11], { sub: 'Greek dromos', o: 'Piraeus, Greece', d: 'The rebetiko road from the port of Piraeus: Hijaz with a ♯4. The notes of the Poorvi thaat.' }],
  ['europe', 'houzam', 'Houzam', [0, 3, 4, 5, 7, 8, 11], { sub: 'Greek dromos', o: 'Greece', d: 'A rebetiko road with both 3rds and an augmented 2nd on top, after the Turkish Hüzzam.' }],
  ['europe', 'romanian-major', 'Romanian major', [0, 1, 4, 6, 7, 9, 10], { o: 'Romania', d: '♭2 with ♯4 and ♭7. A mode of Hungarian major, heard in lăutari fiddling.' }],
  ['europe', 'gaelic-major', 'Gaelic hexatonic', [0, 2, 4, 5, 7, 9], { sub: 'Major without the 7th', o: 'Ireland · Scotland', d: 'Six-note major with no 7th, so tunes drift between major and Mixolydian.' }],
  ['europe', 'gaelic-minor', 'Gaelic hexatonic minor', [0, 2, 3, 5, 7, 10], { sub: 'Minor without the 6th', o: 'Ireland · Scotland', d: 'Minor with no 6th, between Dorian and Aeolian. Common in Gaelic song and pipe tunes.' }],

  // Hindustani: the ten thaats, then ragas by their time of day (samay)
  ['hindustani', 'bilawal', 'Bilawal', [0, 2, 4, 5, 7, 9, 11], { g: 'thaat', sub: 'Thaat', o: 'North India', d: 'All natural swaras. The morning thaat, equal to the major scale.' }],
  ['hindustani', 'khamaj', 'Khamaj', [0, 2, 4, 5, 7, 9, 10], { g: 'thaat', sub: 'Thaat', o: 'North India', d: 'Komal Ni. Light and romantic, often used for thumri.' }],
  ['hindustani', 'kafi', 'Kafi', [0, 2, 3, 5, 7, 9, 10], { g: 'thaat', sub: 'Thaat', o: 'North India', d: 'Komal Ga and Ni. Folk-like, sung at Holi.' }],
  ['hindustani', 'asavari', 'Asavari', [0, 2, 3, 5, 7, 8, 10], { g: 'thaat', sub: 'Thaat', o: 'North India', d: 'Komal Ga, Dha and Ni. Serious late-morning mood.' }],
  ['hindustani', 'bhairavi', 'Bhairavi', [0, 1, 3, 5, 7, 8, 10], { g: 'thaat', sub: 'Thaat', o: 'North India', d: 'All komal swaras. Concerts traditionally close in Bhairavi.' }],
  ['hindustani', 'bhairav', 'Bhairav', [0, 1, 4, 5, 7, 8, 11], { g: 'thaat', sub: 'Thaat', o: 'North India', d: 'Komal Re and Dha. A dawn raga of devotion.' }],
  ['hindustani', 'kalyan', 'Kalyan', [0, 2, 4, 6, 7, 9, 11], { g: 'thaat', sub: 'Thaat', o: 'North India', d: 'Tivra Ma. Parent of Yaman, Bhupali and Shuddha Kalyan.' }],
  ['hindustani', 'marwa', 'Marwa', [0, 1, 4, 6, 7, 9, 11], { g: 'thaat', sub: 'Thaat', o: 'Marwar, Rajasthan', d: 'Komal Re and tivra Ma. Restless and sung at sunset.' }],
  ['hindustani', 'poorvi', 'Poorvi', [0, 1, 4, 6, 7, 8, 11], { g: 'thaat', sub: 'Thaat', o: 'Eastern India', d: '"Eastern". Komal Re and Dha with tivra Ma, for dusk.' }],
  ['hindustani', 'todi', 'Todi', [0, 1, 3, 6, 7, 8, 11], { g: 'thaat', sub: 'Thaat', o: 'North India', d: 'Komal Re, Ga and Dha with tivra Ma. Intense morning raga.' }],

  ['hindustani', 'ahir-bhairav', 'Ahir Bhairav', [0, 1, 4, 5, 7, 9, 10], { g: 'morning', sub: 'Raga · morning', o: 'North India', d: 'Komal Re from Bhairav, komal Ni from Kafi. The same notes as Carnatic Chakravakam.' }],
  ['hindustani', 'lalit', 'Lalit', [0, 1, 4, 5, 6, 9, 11], { g: 'morning', sub: 'Raga · dawn', o: 'North India', d: 'Both madhyams side by side and no Pa. The strangest and most loved sunrise raga.' }],
  ['hindustani', 'vibhas', 'Vibhas', [0, 1, 4, 7, 8], { g: 'morning', sub: 'Raga · dawn', o: 'North India', d: 'Pentatonic Bhairav: komal Re and Dha, no Ma or Ni. Bauli in the south.' }],
  ['hindustani', 'gunakri', 'Gunakri', [0, 1, 5, 7, 8], { g: 'morning', sub: 'Raga · morning', o: 'North India', d: 'Komal Re and Dha with no Ga or Ni. The same five notes as the Japanese In scale.' }],
  ['hindustani', 'bairagi', 'Bairagi', [0, 1, 5, 7, 10], { g: 'morning', sub: 'Raga · morning', o: 'North India', d: 'An ascetic pentatonic with komal Re and Ni, made popular by Ravi Shankar. Revati in the south.' }],
  ['hindustani', 'jogiya', 'Jogiya', [0, 1, 5, 7, 8, 11], { g: 'morning', sub: 'Raga · morning', o: 'North India', d: 'Bhairav without Ga. Devotional, with the wandering jogi in mind.' }],
  ['hindustani', 'nat-bhairav', 'Nat Bhairav', [0, 2, 4, 5, 7, 8, 11], { g: 'morning', sub: 'Raga · morning', o: 'North India', d: 'Bhairav with a shuddha Re. The same notes as harmonic major.' }],
  ['hindustani', 'basant-mukhari', 'Basant Mukhari', [0, 1, 4, 5, 7, 8, 10], { g: 'morning', sub: 'Raga · morning', o: 'North India', d: 'Bhairav below, Bhairavi above. The notes of Maqam Hijaz.' }],
  ['hindustani', 'gujari-todi', 'Gujari Todi', [0, 1, 3, 6, 8, 11], { g: 'morning', sub: 'Raga · late morning', o: 'North India', d: 'Todi without Pa. Grave and tender.' }],
  ['hindustani', 'hindol', 'Hindol', [0, 4, 6, 9, 11], { g: 'morning', sub: 'Raga · morning', o: 'North India', d: 'Tivra Ma with no Re or Pa. A spring swing (hindola); not the Carnatic Hindolam.' }],

  ['hindustani', 'shuddha-sarang', 'Shuddha Sarang', [0, 2, 5, 6, 7, 11], { g: 'afternoon', sub: 'Raga · midday', o: 'North India', d: 'Both madhyams, no Ga or Dha. The noon raga of the Sarang family.' }],
  ['hindustani', 'brindabani-sarang', 'Brindabani Sarang', [0, 2, 5, 7, 10, 11], { g: 'afternoon', sub: 'Raga · midday', o: 'Vrindavan, North India', d: 'Both nishads, no Ga or Dha. Krishna\'s raga, sung at noon.' }],
  ['hindustani', 'bhimpalasi', 'Bhimpalasi', [0, 2, 3, 5, 7, 9, 10], { g: 'afternoon', sub: 'Raga · afternoon', o: 'North India', d: 'Kafi notes, rising on five (S g m P n) and falling on all seven. Tender and longing.' }],
  ['hindustani', 'dhani', 'Dhani', [0, 3, 5, 7, 10], { g: 'afternoon', sub: 'Raga · afternoon', o: 'North India', d: 'Bhimpalasi without Re and Dha: the minor pentatonic as a raga.' }],
  ['hindustani', 'patdeep', 'Patdeep', [0, 2, 3, 5, 7, 11], { g: 'afternoon', sub: 'Raga · afternoon', o: 'North India', d: 'Komal Ga with a shuddha Ni and no Dha. Bright for the late afternoon.' }],
  ['hindustani', 'multani', 'Multani', [0, 1, 3, 6, 7, 8, 11], { g: 'afternoon', sub: 'Raga · late afternoon', o: 'Multan, Punjab', d: 'Todi notes sung as the day ends, with Re and Dha only in descent.' }],
  ['hindustani', 'madhuvanti', 'Madhuvanti', [0, 2, 3, 6, 7, 9, 11], { g: 'afternoon', sub: 'Raga · late afternoon', o: 'North India', d: 'Komal Ga with tivra Ma. A 20th-century raga, sweet as its name.' }],

  ['hindustani', 'yaman', 'Yaman', [0, 2, 4, 6, 7, 9, 11], { g: 'evening', sub: 'Raga · evening · Kalyan thaat', o: 'North India', d: 'Tivra Ma and all else shuddha. The first raga most students learn, and an evening favourite in film song.' }],
  ['hindustani', 'bhupali', 'Bhupali', [0, 2, 4, 7, 9], { g: 'evening', sub: 'Raga · evening · Mohanam', o: 'India', d: 'Pentatonic evening raga. Called Mohanam in the south.' }],
  ['hindustani', 'hamsadhwani', 'Hamsadhwani', [0, 2, 4, 7, 11], { g: 'evening', sub: 'Raga · evening', o: 'South India', scene: 'palms', d: '"Cry of the swan". Carnatic in origin, now sung in both traditions.' }],
  ['hindustani', 'puriya-dhanashree', 'Puriya Dhanashree', [0, 1, 4, 6, 7, 8, 11], { g: 'evening', sub: 'Raga · sunset', o: 'North India', d: 'Poorvi notes for the hour the lamps are lit. Raga Shree shares them.' }],
  ['hindustani', 'puriya', 'Puriya', [0, 1, 4, 6, 9, 11], { g: 'evening', sub: 'Raga · sunset', o: 'North India', d: 'Komal Re and tivra Ma with no Pa. Marwa and Sohini use the same six notes.' }],
  ['hindustani', 'kalavati', 'Kalavati', [0, 4, 7, 9, 10], { g: 'evening', sub: 'Raga · evening', o: 'India', d: 'Pentatonic with no Re or Ma. Playful; Valaji in the south.' }],
  ['hindustani', 'desh', 'Desh', [0, 2, 4, 5, 7, 9, 10, 11], { g: 'evening', sub: 'Raga · evening', o: 'North India', d: 'Shuddha Ni rising, komal Ni falling. The raga of "Vande Mataram" and the rains.' }],
  ['hindustani', 'tilang', 'Tilang', [0, 4, 5, 7, 10, 11], { g: 'evening', sub: 'Raga · evening', o: 'North India', d: 'Both nishads, no Re or Dha. Light, for thumri and bhajan.' }],
  ['hindustani', 'bihag', 'Bihag', [0, 2, 4, 5, 6, 7, 9, 11], { g: 'evening', sub: 'Raga · late evening', o: 'North India', d: 'Bilawal with a touch of tivra Ma in descent. Romantic.' }],
  ['hindustani', 'jaijaiwanti', 'Jaijaiwanti', [0, 2, 3, 4, 5, 7, 9, 10, 11], { g: 'evening', sub: 'Raga · evening', o: 'North India', d: 'Both gandhars and both nishads. Ornate; the last of the 31 ragas of the Guru Granth Sahib.' }],
  ['hindustani', 'charukeshi', 'Charukeshi', [0, 2, 4, 5, 7, 8, 10], { g: 'evening', sub: 'Raga · evening', o: 'South India · adopted in the north', scene: 'palms', d: 'Major below, minor above. Melakarta 26, now a film favourite in both traditions.' }],
  ['hindustani', 'gorakh-kalyan', 'Gorakh Kalyan', [0, 2, 5, 7, 9, 10], { g: 'evening', sub: 'Raga · evening', o: 'North India', d: 'No Ga, and Pa only in descent. Named for the yogi Gorakhnath; folk-like and calm.' }],
  ['hindustani', 'bhinna-shadja', 'Bhinna Shadja', [0, 4, 5, 9, 11], { g: 'evening', sub: 'Raga · evening', o: 'North India', d: 'Pentatonic with no Re or Pa. Also called Kaushik Dhwani.' }],

  ['hindustani', 'malkauns', 'Malkauns', [0, 3, 5, 8, 10], { g: 'night', sub: 'Raga · midnight · Hindolam', o: 'India', d: 'A midnight raga, deep and meditative. Called Hindolam in the south.' }],
  ['hindustani', 'darbari', 'Darbari Kanada', [0, 2, 3, 5, 7, 8, 10], { g: 'night', sub: 'Raga · late night', o: 'North India', d: 'Asavari notes sung slow and low, with a slow shake on komal Ga and Dha. Tansen\'s court raga.' }],
  ['hindustani', 'bageshri', 'Bageshri', [0, 2, 3, 5, 7, 9, 10], { g: 'night', sub: 'Raga · night', o: 'North India', d: 'Kafi notes with a weak Pa. A raga of waiting for the beloved.' }],
  ['hindustani', 'rageshri', 'Rageshri', [0, 2, 4, 5, 9, 10], { g: 'night', sub: 'Raga · night', o: 'North India', d: 'Bageshri\'s cousin with a shuddha Ga and no Pa.' }],
  ['hindustani', 'chandrakauns', 'Chandrakauns', [0, 3, 5, 8, 11], { g: 'night', sub: 'Raga · night', o: 'North India', d: 'Malkauns with a shuddha Ni. Moonlit and modern.' }],
  ['hindustani', 'abhogi', 'Abhogi', [0, 2, 3, 5, 9], { g: 'night', sub: 'Raga · night', o: 'South India · adopted in the north', d: 'Komal Ga with no Pa or Ni. Carnatic in origin, sung as Abhogi Kanada in the north.' }],
  ['hindustani', 'kirwani', 'Kirwani', [0, 2, 3, 5, 7, 8, 11], { g: 'night', sub: 'Raga · night', o: 'South India · adopted in the north', scene: 'palms', d: 'Harmonic minor as a raga. Melakarta 21, loved on sitar and in film.' }],
  ['hindustani', 'jog', 'Jog', [0, 3, 4, 5, 7, 10], { g: 'night', sub: 'Raga · night', o: 'North India', d: 'Both gandhars, no Re or Dha. Bluesy and bold.' }],
  ['hindustani', 'shivaranjani', 'Shivaranjani', [0, 2, 3, 7, 9], { g: 'night', sub: 'Raga · night', o: 'India', d: 'Pentatonic with komal Ga. Plaintive, much loved in film songs.' }],
  ['hindustani', 'durga', 'Durga', [0, 2, 5, 7, 9], { g: 'night', sub: 'Raga · night', o: 'India', d: 'Pentatonic without Ga and Ni. Bright and devotional.' }],
  ['hindustani', 'megh', 'Megh', [0, 2, 5, 7, 10], { g: 'night', sub: 'Raga · monsoon · Madhyamavati', o: 'India', d: 'The monsoon raga, said to summon rain clouds.' }],
  ['hindustani', 'miyan-malhar', 'Miyan ki Malhar', [0, 2, 3, 5, 7, 9, 10, 11], { g: 'night', sub: 'Raga · monsoon', o: 'North India', d: 'Both nishads over Kafi. Tansen\'s rain raga.' }],

  // China & Korea
  ['china', 'gong', 'Gong mode', [0, 2, 4, 7, 9], { sub: 'Chinese pentatonic', o: 'China', d: 'Gong, the "palace" note, as home. The bright Chinese pentatonic.' }],
  ['china', 'shang', 'Shang mode', [0, 2, 5, 7, 10], { sub: 'Chinese pentatonic', o: 'China', d: 'Starts on Shang, the "merchant" note.' }],
  ['china', 'jue', 'Jue mode', [0, 3, 5, 8, 10], { sub: 'Chinese pentatonic', o: 'China', d: 'Starts on Jue, the "horn" note.' }],
  ['china', 'zhi', 'Zhi mode', [0, 2, 5, 7, 9], { sub: 'Chinese pentatonic', o: 'China', d: 'Starts on Zhi. Open and folk-like.' }],
  ['china', 'yu', 'Yu mode', [0, 3, 5, 7, 10], { sub: 'Chinese pentatonic', o: 'China', d: 'Starts on Yu, the "feather" note. Wistful and minor.' }],
  ['china', 'pyeongjo', 'Pyeongjo', [0, 2, 5, 7, 9], { sub: 'Korean', o: 'Korea', scene: 'pines', d: 'The calm, "even" mode of Korean court and folk music.' }],
  ['china', 'gyemyeonjo', 'Gyemyeonjo', [0, 3, 5, 7, 10], { sub: 'Korean', o: 'Korea', scene: 'pines', d: 'The sorrowful Korean mode heard in Arirang laments.' }],
  ['china', 'qingyue', 'Qingyue', [0, 2, 4, 5, 7, 9, 11], { sub: 'Chinese heptatonic', o: 'China', d: 'The pentatonic plus two passing bian notes. The "clear music" scale, equal to major.' }],
  ['china', 'yayue', 'Yayue', [0, 2, 4, 6, 7, 9, 11], { sub: 'Chinese heptatonic', o: 'China', d: 'The court "elegant music" scale with a raised 4th. The same notes as Lydian.' }],
  ['china', 'yanyue', 'Yanyue', [0, 2, 4, 5, 7, 9, 10], { sub: 'Chinese heptatonic', o: 'China', d: 'The "banquet music" scale with a ♭7. The same notes as Mixolydian.' }],

  // Japan
  ['japan', 'in', 'In scale', [0, 1, 5, 7, 8], { sub: 'Japanese Miyako-bushi', o: 'Kyoto, Japan', d: 'The "city" scale of koto and shamisen. Dark half steps.' }],
  ['japan', 'yo', 'Yo scale', [0, 2, 5, 7, 9], { sub: 'Japanese folk', o: 'Rural Japan', d: 'The bright folk scale of min\'yō songs, with no half steps.' }],
  ['japan', 'hirajoshi', 'Hirajoshi', [0, 2, 3, 7, 8], { sub: 'Koto tuning', o: 'Japan', d: 'A standard koto tuning, from 17th-century Edo.' }],
  ['japan', 'iwato', 'Iwato', [0, 1, 5, 6, 10], { o: 'Japan', d: 'Named after the cave of the sun goddess Amaterasu. Stark and stony.' }],
  ['japan', 'kumoi', 'Kumoi', [0, 2, 3, 7, 9], { sub: 'Koto tuning', o: 'Japan', d: '"Among the clouds". A koto tuning.' }],
  ['japan', 'insen', 'Insen', [0, 1, 5, 7, 10], { o: 'Japan', d: 'In scale with a ♭7. Haunting.' }],
  ['japan', 'ryukyu', 'Ryūkyū', [0, 4, 5, 7, 11], { sub: 'Okinawan', o: 'Okinawa, Japan', scene: 'island', d: 'The island scale of the sanshin, with no 2nd or 6th. Sunny and lilting.' }],
  ['japan', 'ryo', 'Ryo', [0, 2, 4, 7, 9], { sub: 'Shōmyō · gagaku', o: 'Japan', d: 'The "male" scale of Buddhist chant and court music.' }],
  ['japan', 'ritsu', 'Ritsu', [0, 2, 5, 7, 9], { sub: 'Shōmyō · gagaku', o: 'Japan', d: 'The "female" scale of Buddhist chant, and the root of the Yo scale.' }],

  // Southeast Asia
  ['seasia', 'pelog', 'Pelog', [0, 1.2, 2.7, 5.4, 6.7, 7.85, 9.5], { sub: 'Javanese · gamelan tuning', o: 'Java, Indonesia', d: 'Seven unequal steps, and every gamelan has its own. These are the cents of one Javanese set.' }],
  ['seasia', 'pelog-bem', 'Pelog bem', [0, 1.2, 2.7, 6.7, 7.85], { sub: 'Javanese pathet · five of pelog', o: 'Java, Indonesia', d: 'Pelog notes 1 2 3 5 6, the five most pieces actually use.' }],
  ['seasia', 'pelog-barang', 'Pelog barang', [0, 1.5, 5.5, 6.65, 8.3], { sub: 'Javanese pathet · five of pelog', o: 'Java, Indonesia', d: 'Pelog notes 2 3 5 6 7, with note 7 in place of 1.' }],
  ['seasia', 'slendro', 'Slendro', [0, 2.4, 4.8, 7.2, 9.6], { sub: 'Javanese · ≈ 5 equal steps', o: 'Java, Indonesia', d: 'Five nearly equal steps, each between a whole tone and a minor 3rd.' }],
  ['seasia', 'degung', 'Degung', [0, 1, 3, 7, 8], { sub: 'Sundanese ≈ 12-tone', o: 'West Java, Indonesia', d: 'The gentle gamelan degung of the Sundanese courts.' }],
  ['seasia', 'selisir', 'Selisir', [0, 1, 3, 7, 8], { sub: 'Balinese ≈ 12-tone', o: 'Bali, Indonesia', scene: 'terraces', d: 'The five-note pelog mode of Balinese gong kebyar.' }],
  ['seasia', 'thai', 'Thai 7-equal', [0, 1.714, 3.429, 5.143, 6.857, 8.571, 10.286], { sub: 'Thang · 7-tone equal', o: 'Thailand', scene: 'river', d: 'The octave split into seven equal steps of about 171 cents. No major or minor.' }],

  // Africa
  ['africa', 'tizita-major', 'Tizita major', [0, 2, 4, 7, 9], { sub: 'Ethiopian qenet', o: 'Ethiopia', scene: 'highlands', d: 'Tizita means "nostalgia". It is the sound of Ethio-jazz and Mulatu Astatke.' }],
  ['africa', 'tizita-minor', 'Tizita minor', [0, 2, 3, 7, 8], { sub: 'Ethiopian qenet', o: 'Ethiopia', scene: 'highlands', d: 'The yearning minor form of Tizita.' }],
  ['africa', 'bati-major', 'Bati major', [0, 4, 5, 7, 11], { sub: 'Ethiopian qenet', o: 'Ethiopia', scene: 'highlands', d: 'Named after the market town of Bati in Wollo.' }],
  ['africa', 'bati-minor', 'Bati minor', [0, 3, 5, 7, 10], { sub: 'Ethiopian qenet', o: 'Ethiopia', scene: 'highlands', d: 'The minor form of Bati.' }],
  ['africa', 'ambassel', 'Ambassel', [0, 1, 5, 7, 8], { sub: 'Ethiopian qenet', o: 'Ethiopia', scene: 'highlands', d: 'Named after the Ambassel mountains of Wollo.' }],
  ['africa', 'anchihoye', 'Anchihoye', [0, 1, 5, 6, 9], { sub: 'Ethiopian qenet', o: 'Ethiopia', scene: 'highlands', d: 'The most unusual of the four qenet, with a ♭5 and a major 6th.' }],
  ['africa', 'chopi', 'Equiheptatonic', [0, 1.714, 3.429, 5.143, 6.857, 8.571, 10.286], { sub: 'Chopi timbila · 7-tone equal', o: 'Mozambique', d: 'Chopi xylophone orchestras tune the octave to seven near-equal steps.' }],
  ['africa', 'sauta', 'Sauta', [0, 2, 4, 6, 7, 9, 11], { sub: 'Kora tuning', o: 'Mali · Gambia · Senegal', d: 'A Mande kora tuning with a raised 4th.' }],
  ['africa', 'hardino', 'Hardino', [0, 2, 4, 5, 7, 9, 11], { sub: 'Kora tuning', o: 'Mali · Gambia · Senegal', d: 'A Mande kora tuning close to the major scale.' }],
  ['africa', 'tomora', 'Tomora', [0, 2, 4, 5, 7, 9, 10], { sub: 'Kora tuning', o: 'Mali · Gambia · Senegal', d: 'A Mande kora tuning with a ♭7. The same notes as Mixolydian.' }],
  ['africa', 'gnawa', 'Gnawa', [0, 3, 5, 7, 10], { sub: 'Guembri · pentatonic', o: 'Morocco', scene: 'desert', d: 'The trance pentatonic of the Gnawa, carried north across the Sahara on the bass guembri.' }],
  ['africa', 'mbira', 'Nyamaropa', [0, 2, 3.5, 5, 7, 8.5, 10], { sub: 'Mbira tuning · approx.', o: 'Zimbabwe (Shona)', d: 'A Shona mbira tuning. Its neutral 3rd and 6th vary from maker to maker.' }],

  // Symmetric and synthetic
  ['symmetric', 'messiaen-3', 'Messiaen mode 3', [0, 2, 3, 4, 6, 7, 8, 10, 11], { o: 'Paris · Olivier Messiaen', d: 'Nine notes that repeat every major 3rd.' }],
  ['symmetric', 'messiaen-4', 'Messiaen mode 4', [0, 1, 2, 5, 6, 7, 8, 11], { o: 'Paris · Olivier Messiaen', d: 'Repeats every tritone.' }],
  ['symmetric', 'messiaen-5', 'Messiaen mode 5', [0, 1, 5, 6, 7, 11], { o: 'Paris · Olivier Messiaen', d: 'Six notes that repeat every tritone.' }],
  ['symmetric', 'messiaen-6', 'Messiaen mode 6', [0, 2, 4, 5, 6, 8, 10, 11], { o: 'Paris · Olivier Messiaen', d: 'Whole tones with half-step pairs. Repeats every tritone.' }],
  ['symmetric', 'messiaen-7', 'Messiaen mode 7', [0, 1, 2, 3, 5, 6, 7, 8, 9, 11], { o: 'Paris · Olivier Messiaen', d: 'Ten notes that repeat every tritone.' }],
  ['symmetric', 'prometheus', 'Prometheus', [0, 2, 4, 6, 9, 10], { sub: 'Mystic chord', o: 'Moscow · Scriabin', d: 'Scriabin\'s "mystic chord" laid out as a scale.' }],
  ['symmetric', 'tritone', 'Tritone', [0, 1, 4, 6, 7, 10], { o: 'Theory', d: 'Two major triads a tritone apart (Petrushka chord).' }],
  ['symmetric', 'chromatic', 'Chromatic', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], { o: 'Everywhere', d: 'All twelve notes. Every other shape on the wheel is drawn from these.' }],
  ['symmetric', 'quarter', 'Quarter-tone', Array.from({ length: 24 }, (_, i) => i / 2), { sub: '24 equal steps', o: 'Arab world · 20th-c. Europe', d: 'All 24 quarter tones. Arabic theory measures its maqamat on this grid.' }],
];

// The 72 melakarta ragas follow from their number, so they are generated.
const MELA_NAMES = 'Kanakangi Ratnangi Ganamurthi Vanaspathi Manavathi Thanarupi Senavathi Hanumathodi Dhenuka Natakapriya Kokilapriya Rupavathi Gayakapriya Vakulabharanam Mayamalavagowla Chakravakam Suryakantam Hatakambari Jhankaradhwani Natabhairavi Keeravani Kharaharapriya Gourimanohari Varunapriya Mararanjani Charukesi Sarasangi Harikambhoji Dheerasankarabharanam Naganandini Yagapriya Ragavardhini Gangeyabhushani Vagadheeswari Shulini Chalanata Salagam Jalarnavam Jhalavarali Navaneetam Pavani Raghupriya Gavambhodi Bhavapriya Shubhapantuvarali Shadvidamargini Suvarnangi Divyamani Dhavalambari Namanarayani Kamavardhini Ramapriya Gamanashrama Vishwambari Shamalangi Shanmukhapriya Simhendramadhyamam Hemavati Dharmavati Neetimati Kantamani Rishabhapriya Latangi Vachaspati Mechakalyani Chitrambari Sucharitra Jyotiswarupini Dhatuvardhani Nasikabhushani Kosalam Rasikapriya'.split(' ');
const CHAKRAS = 'Indu Netra Agni Veda Bana Rutu Rishi Vasu Brahma Disi Rudra Aditya'.split(' ');
const RIGA = [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]];
const DHANI = [[8, 9], [8, 10], [8, 11], [9, 10], [9, 11], [10, 11]];

export function melakarta(n) {
  const k = (n - 1) % 36;
  const ma = n <= 36 ? 5 : 6;
  const [r, g] = RIGA[Math.floor(k / 6)];
  const [d, ni] = DHANI[k % 6];
  return [0, r, g, ma, 7, d, ni];
}

// Well-known janya (derived) ragas: id, name, parent melakarta, steps, note.
const JANYA = [
  ['mohanam', 'Mohanam', 28, [0, 2, 4, 7, 9], 'The pentatonic of the first varnam, Ninnukori. Bhupali in the north.'],
  ['hindolam', 'Hindolam', 20, [0, 3, 5, 8, 10], 'Minor pentatonic with no Pa. Malkauns in the north.'],
  ['madhyamavati', 'Madhyamavati', 22, [0, 2, 5, 7, 10], 'Concerts end with it, for auspiciousness. Megh in the north.'],
  ['abheri', 'Abheri', 22, [0, 2, 3, 5, 7, 9, 10], 'Rises on five notes, falls on seven. Bhimpalasi in the north.'],
  ['sriranjani', 'Sriranjani', 22, [0, 2, 3, 5, 9, 10], 'Kharaharapriya without Pa. Bright despite its komal notes.'],
  ['shuddha-dhanyasi', 'Shuddha Dhanyasi', 22, [0, 3, 5, 7, 10], 'The minor pentatonic. Dhani in the north.'],
  ['revati', 'Revati', 2, [0, 1, 5, 7, 10], 'Komal Re and Ni with no Ga or Dha. Bairagi in the north.'],
  ['shuddha-saveri', 'Shuddha Saveri', 29, [0, 2, 5, 7, 9], 'Pentatonic without Ga or Ni. Durga in the north.'],
  ['bilahari', 'Bilahari', 29, [0, 2, 4, 5, 7, 9, 11], 'Rises on the major pentatonic, falls on all seven.'],
  ['nalinakanti', 'Nalinakanti', 27, [0, 2, 4, 5, 7, 11], 'No Dha; famous from Tyagaraja\'s Manavyalakinchara.'],
  ['bauli', 'Bauli', 15, [0, 1, 4, 7, 8], 'Pentatonic Mayamalavagowla. Vibhas in the north.'],
  ['valaji', 'Valaji', 28, [0, 4, 7, 9, 10], 'Pentatonic with no Re or Ma. Kalavati in the north.'],
  ['hamsanandi', 'Hamsanandi', 53, [0, 1, 4, 6, 9, 11], 'Komal Re and tivra Ma, no Pa. Puriya and Sohini in the north.'],
  ['amritavarshini', 'Amritavarshini', 66, [0, 4, 6, 7, 11], '"Rain of nectar". Dikshitar is said to have sung rain down on Ettayapuram with it.'],
];

export const SCALES = RAW.map(([region, id, name, steps, x]) => ({ region, id, name, steps, ...x }));
for (let n = 1; n <= 72; n++) {
  SCALES.push({
    region: 'carnatic', id: `mela-${n}`, name: MELA_NAMES[n - 1], steps: melakarta(n), mela: n, g: 'mela',
    sub: `Melakarta ${n} · ${CHAKRAS[Math.floor((n - 1) / 6)]} chakra`,
    o: 'South India',
    d: `Melakarta ${n} of 72. Every Carnatic raga descends from one of these parent scales. ${n <= 36 ? 'Shuddha' : 'Prati'} Madhyamam.`,
  });
}
JANYA.forEach(([id, name, parent, steps, d]) => SCALES.push({
  region: 'carnatic', id, name, steps, parent, g: 'janya',
  sub: `Janya · ${MELA_NAMES[parent - 1]} (${parent})`, o: 'South India',
  d: `${d} Born of melakarta ${parent}, ${MELA_NAMES[parent - 1]}.`,
}));

export const byId = Object.fromEntries(SCALES.map(s => [s.id, s]));

// Genres: a second way into the library. A genre lists the scales its music is
// built on, from any region, each with a line on how the genre uses it (shown as
// the caption while browsing by genre). `short` is the name on the genre chip.
// Sources are in docs/GENRES.md.
export const GENRES = [
  { id: 'pop', name: 'Pop & rock', hue: 265, scales: [
    ['ionian', 'The default of pop: most chart songs sit in major.'],
    ['aeolian', 'The minor of rock ballads and modern pop.'],
    ['mixolydian', 'Major with a ♭7: the classic rock riff sound, as in Norwegian Wood.'],
    ['dorian', 'Minor with a bright 6th, as in Scarborough Fair and Oye Como Va.'],
    ['major-pent', 'Five safe notes for hooks and singalong melodies.'],
    ['minor-pent', 'The first scale of rock guitar: riffs and solos.'],
  ] },
  { id: 'blues', name: 'Blues', hue: 222, scales: [
    ['blues', 'Minor pentatonic plus the ♭5 blue note.'],
    ['minor-pent', 'Played over major chords: that clash is the blues.'],
    ['blues-major', 'The sweeter side: major pentatonic with a ♭3 slide.'],
    ['mixolydian', 'The scale of the dominant 7th chords a 12-bar blues runs on.'],
    ['blues-hepta', 'Seven notes with a ♭3, ♭5 and ♭7.'],
    ['blues-nine', 'Major and minor 3rds and 7ths side by side.'],
    ['blue-notes', 'Where singers and slide players really pitch the blue notes: between the keys.'],
    ['dorian', 'Minor blues with a lifted 6th.'],
  ] },
  { id: 'jazz', name: 'Jazz', hue: 196, scales: [
    ['dorian', 'The minor 7th chord scale. Modal jazz: So What.'],
    ['mixolydian', 'The plain dominant 7th chord scale.'],
    ['lydian', 'The major 7th chord scale with a ♯4, the centre of George Russell\'s Lydian concept.'],
    ['melodic-minor', 'Jazz minor: the parent of altered and Lydian dominant.'],
    ['lydian-dominant', 'For dominant chords that don\'t resolve down a 5th.'],
    ['altered', 'Every tension at once over a dominant 7th.'],
    ['locrian-2', 'For the half-diminished chord in a minor ii–V.'],
    ['bebop-dom', 'An added passing note keeps chord tones on the beat.'],
    ['bebop-major', 'Major with a passing ♭6 for long bebop lines.'],
    ['dim-hw', 'Eight notes for a dominant 7th with ♭9.'],
    ['whole-tone', 'Floating, no leading note. A Thelonious Monk favourite.'],
    ['blues', 'Jazz never left the blues.'],
  ] },
  { id: 'soul', name: 'Funk · Soul · Gospel', short: 'Funk & soul', hue: 30, scales: [
    ['dorian', 'The funk minor: grooves that sit on one minor 7th chord.'],
    ['mixolydian', 'Funk vamps on a dominant 7th chord.'],
    ['minor-pent', 'Bass lines, horn stabs and vocal runs.'],
    ['blues', 'The grit in soul singing.'],
    ['blues-major', 'Gospel piano runs: major pentatonic with a ♭3.'],
    ['gospel', 'Major pentatonic with both ♭3 and ♭7.'],
  ] },
  { id: 'metal', name: 'Metal', hue: 0, scales: [
    ['aeolian', 'The most used scale in metal.'],
    ['phrygian', 'The ♭2 against a low open string is the sound of thrash.'],
    ['harmonic-minor', 'Neoclassical metal: fast runs with a classical leading note.'],
    ['phrygian-dom', 'Harmonic minor from its 5th note. Tense and "Eastern".'],
    ['locrian', 'Rare on its own; its ♭2 and ♭5 colour chromatic riffs.'],
    ['double-harmonic', 'Phrygian dominant with a major 7th: two augmented 2nds.'],
    ['hungarian-minor', 'Harmonic minor with a ♯4, for exotic solos.'],
    ['minor-pent', 'The blues-rock root that early heavy metal grew from.'],
  ] },
  { id: 'hiphop', name: 'Hip-hop · Electronic', short: 'Hip-hop', hue: 290, scales: [
    ['aeolian', 'Most trap, house and techno hooks are in natural minor.'],
    ['phrygian', 'The dark ♭2 of trap and drill melodies.'],
    ['harmonic-minor', 'A dramatic leading note for trap and trance leads.'],
    ['dorian', 'Minor with a lift: house, deep house and neo-soul loops.'],
    ['minor-pent', 'Simple hooks that survive any sample or bass line.'],
  ] },
  { id: 'country', name: 'Country · Bluegrass', short: 'Country', hue: 44, scales: [
    ['major-pent', 'The backbone of country melody and guitar licks.'],
    ['blues-major', 'The "country scale": major pentatonic with a ♭3 passing note.'],
    ['ionian', 'Hymn-like tunes on three major chords.'],
    ['mixolydian', 'Old-time fiddle tunes with a ♭7, as in Old Joe Clark.'],
    ['dorian', 'Mountain minor: the modal banjo sound of Shady Grove.'],
    ['gaelic-major', 'Gapped six-note tunes carried from Ireland and Scotland.'],
  ] },
  { id: 'celtic', name: 'Celtic', hue: 140, scales: [
    ['dorian', 'The usual "minor" of Irish dance tunes; far more common than Aeolian.'],
    ['mixolydian', 'The scale the bagpipe chanter gives, so pipe tunes live here.'],
    ['ionian', 'Most reels and jigs, usually in D or G.'],
    ['aeolian', 'Used for slow airs; rare in dance tunes.'],
    ['gaelic-major', 'Leave out the 7th and a tune sits between major and Mixolydian.'],
    ['gaelic-minor', 'Leave out the 6th and it sits between Dorian and Aeolian.'],
    ['major-pent', 'Old Scottish and Hebridean songs use five notes.'],
  ] },
  { id: 'flamenco', name: 'Flamenco', hue: 12, scales: [
    ['phrygian', 'The flamenco key: soleá and siguiriya fall to the tonic by a half step.'],
    ['phrygian-dom', 'The tonic chord is major, so the 3rd is raised when resting on it.'],
    ['spanish-8', 'Both 3rds together, the way guitarists actually play the mode.'],
    ['harmonic-minor', 'Behind the Andalusian cadence: Am, G, F, E.'],
    ['ionian', 'Alegrías and the other cantiñas are in major.'],
    ['aeolian', 'Farruca is in minor.'],
  ] },
  { id: 'klezmer', name: 'Klezmer', hue: 340, scales: [
    ['freygish', 'Ahava Rabbah, the best-known klezmer mode: about a quarter of the old repertoire.'],
    ['mi-sheberach', 'Minor with a raised 4th, for doinas and slow dances.'],
    ['mixolydian', 'Adonoy Moloch: the major-type prayer mode, with a ♭7.'],
    ['aeolian', 'Mogen Ovos, one of the oldest synagogue modes.'],
    ['harmonic-minor', 'Minor tunes that reach for a leading note at cadences.'],
  ] },
  { id: 'balkan', name: 'Balkan · Rebetiko', short: 'Balkan', hue: 320, scales: [
    ['phrygian-dom', 'Hitzaz, the most common road (dromos) of rebetiko.'],
    ['double-harmonic', 'Hitzazkiar: Hitzaz with a major 7th. The scale of Misirlou.'],
    ['hungarian-minor', 'Niavent in Greece; the "Gypsy minor" of Hungarian Roma bands and Liszt.'],
    ['mi-sheberach', 'Nikriz: minor with a raised 4th, across Greece, Romania and Ukraine.'],
    ['pireotikos', 'The road named for the port of Piraeus.'],
    ['houzam', 'A rebetiko road after the Turkish Hüzzam.'],
    ['romanian-major', 'Heard in Romanian lăutari fiddling.'],
    ['hungarian-major', 'A Hungarian colour with an augmented 2nd at the bottom.'],
  ] },
  { id: 'classical', name: 'Classical', hue: 250, scales: [
    ['ionian', 'With harmonic minor, the basis of tonal music from Bach to Brahms.'],
    ['harmonic-minor', 'Minor with a leading note, so the dominant chord is major.'],
    ['melodic-minor', 'Raises the 6th and 7th on the way up to smooth the melody.'],
    ['harmonic-major', 'Major with a ♭6, a Romantic colour described by Rimsky-Korsakov.'],
    ['neapolitan-minor', 'Minor with the ♭2 of the Neapolitan chord.'],
    ['hungarian-minor', 'Liszt\'s Hungarian Rhapsodies.'],
    ['whole-tone', 'Debussy\'s Voiles is built almost wholly on it.'],
    ['dim-hw', 'The octatonic scale of Rimsky-Korsakov and Stravinsky.'],
    ['enigmatic', 'Verdi set it as a puzzle in his Ave Maria of 1889.'],
    ['prometheus', 'Scriabin\'s "mystic" chord spread into a scale.'],
    ['messiaen-3', 'One of Messiaen\'s modes of limited transposition.'],
    ['chromatic', 'All twelve notes as equals: Schoenberg\'s twelve-tone method.'],
  ] },
  { id: 'chant', name: 'Chant · Early music', short: 'Chant', hue: 205, scales: [
    ['dorian', 'Mode 1 of Gregorian chant, ending on D.'],
    ['phrygian', 'Mode 3, ending on E.'],
    ['lydian', 'Mode 5, ending on F; singers often flattened its 4th.'],
    ['mixolydian', 'Mode 7, ending on G.'],
    ['aeolian', 'Added to the system by Glarean in 1547.'],
    ['ionian', 'Also added by Glarean in 1547; it became the major scale.'],
  ] },
  { id: 'film', name: 'Film scores', hue: 180, scales: [
    ['lydian', 'The ♯4 of wonder and flight.'],
    ['lydian-dominant', 'Quirky and bright: The Simpsons theme.'],
    ['dorian', 'Heroic but grounded: folk-coloured adventure themes.'],
    ['aeolian', 'Epic minor: three-chord trailer and fantasy themes.'],
    ['phrygian', 'Menace, from its ♭2.'],
    ['mixo-b6', 'Major below, minor above: bittersweet triumph.'],
    ['whole-tone', 'Dream sequences and things going strange.'],
    ['dim-hw', 'Suspense and chase music.'],
  ] },
  { id: 'filmi', name: 'Indian film music', short: 'Indian film', hue: 26, scales: [
    ['yaman', 'Among the most used ragas in Hindi film song: evening and romance.'],
    ['bhairavi', 'Loved by film composers for partings and devotion.'],
    ['bhimpalasi', 'One of the most popular ragas with listeners and composers alike.'],
    ['shivaranjani', 'Five notes for sadness, longing and separation.'],
    ['kirwani', 'Harmonic minor, so it sits easily on guitar and keyboard chords. Keeravani in the south.'],
    ['charukeshi', 'Major below, minor above; borrowed from Carnatic music.'],
    ['darbari', 'Slow and grave, for the weightiest scenes.'],
    ['malkauns', 'Pentatonic and meditative; Hindolam in the south.'],
    ['desh', 'Monsoon and patriotic songs.'],
    ['khamaj', 'Light-classical: thumri-style love songs.'],
    ['bhupali', 'The major pentatonic; Mohanam in the south.'],
    ['ahir-bhairav', 'A morning raga with a ♭2 and ♭7.'],
  ] },
  { id: 'arabicsong', name: 'Arabic song', hue: 172, scales: [
    ['bayati', 'One of the most widely used maqamat, for romantic and melancholy songs.'],
    ['rast', 'The basic maqam of folk and popular song.'],
    ['hijaz', 'The best-known colour, and often the maqam of the call to prayer.'],
    ['kurd', 'No quarter tones, so it suits keyboards and guitars in modern pop.'],
    ['nahawand', 'Close to Western minor: easy to harmonise with chords.'],
    ['ajam', 'The Arabic name for the major scale.'],
    ['saba', 'The maqam of grief.'],
  ] },
  { id: 'enka', name: 'Enka · Min\'yō', short: 'Enka', hue: 318, scales: [
    ['hirajoshi', 'The notes of yonanuki minor (no 4th or 7th of the minor scale), the main scale of enka.'],
    ['major-pent', 'Yonanuki major: major without its 4th and 7th, for calmer enka.'],
    ['yo', 'The min\'yō scale of folk songs.'],
    ['in', 'Miyako-bushi: the city scale of shamisen and koto songs.'],
    ['ryukyu', 'Okinawan folk and pop.'],
  ] },
  { id: 'ethiojazz', name: 'Ethio-jazz', hue: 74, scales: [
    ['tizita-major', 'Tizita, "memory": a song form of its own and a base of Mulatu Astatke\'s Ethio-jazz.'],
    ['tizita-minor', 'The minor form of Tizita.'],
    ['bati-major', 'Bati, one of the four qenet.'],
    ['bati-minor', 'The minor form of Bati.'],
    ['ambassel', 'Ambassel, one of the four qenet.'],
    ['anchihoye', 'Anchihoye, the fourth qenet, with a tritone inside it.'],
  ] },
  { id: 'griot', name: 'Griot · Desert blues', short: 'Desert blues', hue: 54, scales: [
    ['sauta', 'A kora tuning of the Mande griots.'],
    ['hardino', 'A kora tuning close to major.'],
    ['tomora', 'A kora tuning with a ♭7.'],
    ['minor-pent', 'Desert blues guitar from Mali and the Sahara.'],
    ['gnawa', 'Moroccan Gnawa trance on the bass guembri.'],
  ] },
];
GENRES.forEach(g => { g.scales = g.scales.map(([id, why]) => ({ s: byId[id], why })); });
export const genreOf = id => GENRES.find(g => g.id === id);

export const regionOf = id => REGIONS.find(r => r.id === id);

// Pitch-class shapes for "same notes" / "mode of" matching across cultures.
const isInt = s => s.steps.every(x => Number.isInteger(x));
const setKey = steps => steps.join(',');
function modeKey(steps) {
  const iv = steps.map((x, i) => (steps[i + 1] ?? 12) - x);
  let best = null;
  for (let i = 0; i < iv.length; i++) {
    const k = iv.slice(i).concat(iv.slice(0, i)).join(',');
    if (best === null || k < best) best = k;
  }
  return best;
}
const INDEX = SCALES.filter(isInt).map(s => ({ s, set: setKey(s.steps), mode: modeKey(s.steps) }));

export function matches(steps, selfId) {
  if (!steps.every(x => Number.isInteger(x))) return { same: [], modes: [] };
  const set = setKey(steps), mode = modeKey(steps);
  const same = INDEX.filter(e => e.set === set && e.s.id !== selfId).map(e => e.s);
  const modes = INDEX.filter(e => e.mode === mode && e.set !== set).map(e => e.s);
  return { same, modes };
}
