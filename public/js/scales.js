// Scale library. Steps are semitones above the root; fractions are microtones
// (1.5 = 150 cents). `o` is where the scale comes from, `scene` overrides the
// region's landscape for scales rooted somewhere specific.

export const NOTE_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

export const REGIONS = [
  { id: 'western',   name: 'Western',        tag: 'European mode',  hue: 265, scene: 'alps',      voice: 'keys' },
  { id: 'blues',     name: 'Blues',          tag: 'Blues',          hue: 222, scene: 'bayou',     voice: 'reed' },
  { id: 'jazz',      name: 'Jazz',           tag: 'Jazz',           hue: 196, scene: 'rain',      voice: 'keys' },
  { id: 'arabic',    name: 'Arabic & Persian', tag: 'Maqam',        hue: 172, scene: 'desert',    voice: 'pluck' },
  { id: 'europe',    name: 'Folk Europe',    tag: 'Folk',           hue: 340, scene: 'steppe',    voice: 'reed' },
  { id: 'hindustani', name: 'Hindustani',    tag: 'Raga · North India', hue: 26, scene: 'ganges', voice: 'reed', drone: true },
  { id: 'carnatic',  name: 'Carnatic',       tag: 'Melakarta · South India', hue: 100, scene: 'palms', voice: 'pluck', drone: true },
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
  ['arabic', 'rast', 'Maqam Rast', [0, 2, 3.5, 5, 7, 9, 10.5], { sub: 'Arabic · quarter-tone', o: 'Arab world · Turkey', d: 'The "head" maqam. Its 3rd and 7th sit a quarter tone flat, between major and minor.' }],
  ['arabic', 'bayati', 'Maqam Bayati', [0, 1.5, 3, 5, 7, 8, 10], { sub: 'Arabic · quarter-tone', o: 'Iraq · Egypt · Levant', d: 'The most common maqam in Arabic song, with a three-quarter-tone 2nd.' }],
  ['arabic', 'saba', 'Maqam Saba', [0, 1.5, 3, 4, 7, 8, 10], { sub: 'Arabic · quarter-tone', o: 'Levant · Iraq', d: 'Saba sounds like weeping. A flat 4th makes it ache.' }],
  ['arabic', 'sikah', 'Maqam Sikah', [0, 1.5, 3.5, 5.5, 7, 8.5, 10.5], { sub: 'Arabic · quarter-tone', o: 'Egypt · Arab world', d: 'Sikah starts on a half-flat note, so the whole scale floats between the keys.' }],
  ['arabic', 'hijaz', 'Maqam Hijaz', [0, 1, 4, 5, 7, 8, 10], { sub: 'Arabic ≈ 12-tone', o: 'Hejaz, Arabian Peninsula', scene: 'desert', d: 'Named after the Hejaz region. The wide 1½-step gap from ♭2 to 3 is its signature.' }],
  ['arabic', 'hijaz-kar', 'Maqam Hijaz Kar', [0, 1, 4, 5, 7, 8, 11], { sub: 'Arabic ≈ 12-tone', o: 'Egypt · Turkey', d: 'Two Hijaz tetrachords stacked. Also called Double harmonic.' }],
  ['arabic', 'nahawand', 'Maqam Nahawand', [0, 2, 3, 5, 7, 8, 11], { sub: 'Arabic ≈ 12-tone', o: 'Nahavand, Iran', d: 'Named after the Persian town. Close to harmonic minor.' }],
  ['arabic', 'kurd', 'Maqam Kurd', [0, 1, 3, 5, 7, 8, 10], { sub: 'Arabic ≈ 12-tone', o: 'Kurdistan', d: 'Named after the Kurds. The same notes as Western Phrygian.' }],
  ['arabic', 'ajam', 'Maqam Ajam', [0, 2, 4, 5, 7, 9, 11], { sub: 'Arabic ≈ 12-tone', o: 'Persia ("Ajam")', d: 'Ajam is the Arabic word for "Persian". It matches the Western major scale.' }],
  ['arabic', 'nikriz', 'Maqam Nikriz', [0, 2, 3, 6, 7, 9, 10], { sub: 'Arabic ≈ 12-tone', o: 'Levant · Turkey', d: 'Minor with a raised 4th.' }],
  ['arabic', 'persian', 'Persian', [0, 1, 4, 5, 6, 8, 11], { o: 'Iran', d: 'A 12-tone stand-in for Persian colour, with a ♭5 and a major 7th.' }],
  ['arabic', 'shur', 'Dastgah Shur', [0, 1.5, 3, 5, 7, 8, 10], { sub: 'Persian · koron', o: 'Iran', d: 'The mother of Persian dastgahs. Its 2nd is lowered by a koron, about a quarter tone.' }],
  ['arabic', 'homayoun', 'Dastgah Homayoun', [0, 1.5, 4, 5, 7, 8, 10], { sub: 'Persian · koron', o: 'Iran', d: 'Regal and grave, with a koron 2nd and a major 3rd.' }],

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

  // Hindustani: ten thaats plus well-loved pentatonic ragas
  ['hindustani', 'bilawal', 'Bilawal', [0, 2, 4, 5, 7, 9, 11], { sub: 'Thaat', o: 'North India', d: 'All natural swaras. The morning thaat, equal to the major scale.' }],
  ['hindustani', 'khamaj', 'Khamaj', [0, 2, 4, 5, 7, 9, 10], { sub: 'Thaat', o: 'North India', d: 'Komal Ni. Light and romantic, often used for thumri.' }],
  ['hindustani', 'kafi', 'Kafi', [0, 2, 3, 5, 7, 9, 10], { sub: 'Thaat', o: 'North India', d: 'Komal Ga and Ni. Folk-like, sung at Holi.' }],
  ['hindustani', 'asavari', 'Asavari', [0, 2, 3, 5, 7, 8, 10], { sub: 'Thaat', o: 'North India', d: 'Komal Ga, Dha and Ni. Serious late-morning mood.' }],
  ['hindustani', 'bhairavi', 'Bhairavi', [0, 1, 3, 5, 7, 8, 10], { sub: 'Thaat', o: 'North India', d: 'All komal swaras. Concerts traditionally close in Bhairavi.' }],
  ['hindustani', 'bhairav', 'Bhairav', [0, 1, 4, 5, 7, 8, 11], { sub: 'Thaat', o: 'North India', d: 'Komal Re and Dha. A dawn raga of devotion.' }],
  ['hindustani', 'kalyan', 'Kalyan', [0, 2, 4, 6, 7, 9, 11], { sub: 'Thaat · Yaman', o: 'North India', d: 'Tivra Ma. Raga Yaman, an evening favourite.' }],
  ['hindustani', 'marwa', 'Marwa', [0, 1, 4, 6, 7, 9, 11], { sub: 'Thaat', o: 'Marwar, Rajasthan', d: 'Komal Re and tivra Ma. Restless and sung at sunset.' }],
  ['hindustani', 'poorvi', 'Poorvi', [0, 1, 4, 6, 7, 8, 11], { sub: 'Thaat', o: 'Eastern India', d: '"Eastern". Komal Re and Dha with tivra Ma, for dusk.' }],
  ['hindustani', 'todi', 'Todi', [0, 1, 3, 6, 7, 8, 11], { sub: 'Thaat', o: 'North India', d: 'Komal Re, Ga and Dha with tivra Ma. Intense morning raga.' }],
  ['hindustani', 'bhupali', 'Bhupali', [0, 2, 4, 7, 9], { sub: 'Raga · Mohanam', o: 'India', d: 'Pentatonic evening raga. Called Mohanam in the south.' }],
  ['hindustani', 'malkauns', 'Malkauns', [0, 3, 5, 8, 10], { sub: 'Raga · Hindolam', o: 'India', d: 'A midnight raga, deep and meditative. Called Hindolam in the south.' }],
  ['hindustani', 'durga', 'Durga', [0, 2, 5, 7, 9], { sub: 'Raga', o: 'India', d: 'Pentatonic without Ga and Ni. Bright and devotional.' }],
  ['hindustani', 'shivaranjani', 'Shivaranjani', [0, 2, 3, 7, 9], { sub: 'Raga', o: 'India', d: 'Pentatonic with komal Ga. Plaintive, much loved in film songs.' }],
  ['hindustani', 'megh', 'Megh', [0, 2, 5, 7, 10], { sub: 'Raga · Madhyamavati', o: 'India', d: 'The monsoon raga, said to summon rain clouds.' }],
  ['hindustani', 'hamsadhwani', 'Hamsadhwani', [0, 2, 4, 7, 11], { sub: 'Raga', o: 'South India', scene: 'palms', d: '"Cry of the swan". Carnatic in origin, now sung in both traditions.' }],

  // China & Korea
  ['china', 'gong', 'Gong mode', [0, 2, 4, 7, 9], { sub: 'Chinese pentatonic', o: 'China', d: 'Gong, the "palace" note, as home. The bright Chinese pentatonic.' }],
  ['china', 'shang', 'Shang mode', [0, 2, 5, 7, 10], { sub: 'Chinese pentatonic', o: 'China', d: 'Starts on Shang, the "merchant" note.' }],
  ['china', 'jue', 'Jue mode', [0, 3, 5, 8, 10], { sub: 'Chinese pentatonic', o: 'China', d: 'Starts on Jue, the "horn" note.' }],
  ['china', 'zhi', 'Zhi mode', [0, 2, 5, 7, 9], { sub: 'Chinese pentatonic', o: 'China', d: 'Starts on Zhi. Open and folk-like.' }],
  ['china', 'yu', 'Yu mode', [0, 3, 5, 7, 10], { sub: 'Chinese pentatonic', o: 'China', d: 'Starts on Yu, the "feather" note. Wistful and minor.' }],
  ['china', 'pyeongjo', 'Pyeongjo', [0, 2, 5, 7, 9], { sub: 'Korean', o: 'Korea', scene: 'pines', d: 'The calm, "even" mode of Korean court and folk music.' }],
  ['china', 'gyemyeonjo', 'Gyemyeonjo', [0, 3, 5, 7, 10], { sub: 'Korean', o: 'Korea', scene: 'pines', d: 'The sorrowful Korean mode heard in Arirang laments.' }],

  // Japan
  ['japan', 'in', 'In scale', [0, 1, 5, 7, 8], { sub: 'Japanese Miyako-bushi', o: 'Kyoto, Japan', d: 'The "city" scale of koto and shamisen. Dark half steps.' }],
  ['japan', 'yo', 'Yo scale', [0, 2, 5, 7, 9], { sub: 'Japanese folk', o: 'Rural Japan', d: 'The bright folk scale of min\'yō songs, with no half steps.' }],
  ['japan', 'hirajoshi', 'Hirajoshi', [0, 2, 3, 7, 8], { sub: 'Koto tuning', o: 'Japan', d: 'A standard koto tuning, from 17th-century Edo.' }],
  ['japan', 'iwato', 'Iwato', [0, 1, 5, 6, 10], { o: 'Japan', d: 'Named after the cave of the sun goddess Amaterasu. Stark and stony.' }],
  ['japan', 'kumoi', 'Kumoi', [0, 2, 3, 7, 9], { sub: 'Koto tuning', o: 'Japan', d: '"Among the clouds". A koto tuning.' }],
  ['japan', 'insen', 'Insen', [0, 1, 5, 7, 10], { o: 'Japan', d: 'In scale with a ♭7. Haunting.' }],
  ['japan', 'ryukyu', 'Ryūkyū', [0, 4, 5, 7, 11], { sub: 'Okinawan', o: 'Okinawa, Japan', scene: 'island', d: 'The island scale of the sanshin, with no 2nd or 6th. Sunny and lilting.' }],

  // Southeast Asia
  ['seasia', 'pelog', 'Pelog', [0, 1.2, 2.7, 5.4, 6.7, 7.85, 9.5], { sub: 'Javanese · gamelan tuning', o: 'Java, Indonesia', d: 'Seven unequal steps, and every gamelan has its own. These are the cents of one Javanese set.' }],
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

export const SCALES = RAW.map(([region, id, name, steps, x]) => ({ region, id, name, steps, ...x }));
for (let n = 1; n <= 72; n++) {
  SCALES.push({
    region: 'carnatic', id: `mela-${n}`, name: MELA_NAMES[n - 1], steps: melakarta(n), mela: n,
    sub: `Melakarta ${n} · ${CHAKRAS[Math.floor((n - 1) / 6)]} chakra`,
    o: 'South India',
    d: `Melakarta ${n} of 72. Every Carnatic raga descends from one of these parent scales. ${n <= 36 ? 'Shuddha' : 'Prati'} Madhyamam.`,
  });
}

export const byId = Object.fromEntries(SCALES.map(s => [s.id, s]));
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
