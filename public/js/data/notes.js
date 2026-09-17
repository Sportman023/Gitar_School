// Seven notes = the seven colours of the rainbow, in order:
//   C — red        G — light blue
//   D — orange     A — blue
//   E — yellow     B — violet
//   F — green
// Russian children learn the colour order with a mnemonic rhyme whose words
// start with the same letters as the colours. The app shows solfège names
// (the `ru` field), because that's what the music school uses.
//
// staff — the note's position on a treble clef staff, counted in half-steps
// from the first (bottom) line: 0 — on the first line, +1 — the space above
// it, -1 — below it. All seven notes here are the first octave (octave: 1);
// the second octave is described below in NOTES_2.
//
// pc (pitch class) — semitones above C within the octave: C 0, D 2, E 4, F 5,
// G 7, A 9, B 11. The same note name in another octave has the same pc.
//
// To change a colour, a hint or add information, edit this file —
// the rest of the app picks the changes up by itself.

export const NOTES = [
  { id: 'do',   ru: 'До',  en: 'C', pc: 0,  color: '#E53935', ink: '#ffffff', colorName: 'Красный', octave: 1, freq: 261.63, staff: -2, staffPlace: 'на добавочной линеечке под станом' },
  { id: 're',   ru: 'Ре',  en: 'D', pc: 2,  color: '#FB8C00', ink: '#ffffff', colorName: 'Оранжевый', octave: 1, freq: 293.66, staff: -1, staffPlace: 'под первой линейкой' },
  { id: 'mi',   ru: 'Ми',  en: 'E', pc: 4,  color: '#FDD835', ink: '#5a4600', colorName: 'Жёлтый', octave: 1, freq: 329.63, staff: 0, staffPlace: 'на первой линейке' },
  { id: 'fa',   ru: 'Фа',  en: 'F', pc: 5,  color: '#43A047', ink: '#ffffff', colorName: 'Зелёный', octave: 1, freq: 349.23, staff: 1, staffPlace: 'между 1-й и 2-й линейками' },
  { id: 'sol',  ru: 'Соль',en: 'G', pc: 7,  color: '#29B6F6', ink: '#073b57', colorName: 'Голубой', octave: 1, freq: 392.00, staff: 2, staffPlace: 'на второй линейке' },
  { id: 'lya',  ru: 'Ля',  en: 'A', pc: 9,  color: '#3949AB', ink: '#ffffff', colorName: 'Синий', octave: 1, freq: 440.00, staff: 3, staffPlace: 'между 2-й и 3-й линейками' },
  { id: 'si',   ru: 'Си',  en: 'B', pc: 11, color: '#8E24AA', ink: '#ffffff', colorName: 'Фиолетовый', octave: 1, freq: 493.88, staff: 4, staffPlace: 'на третьей линейке' },
];

export const NOTE_BY_ID = Object.fromEntries(NOTES.map((n) => [n.id, n]));

// ---------- Second octave ----------
//
// Name, colour and pc are the same as in the first octave, so they are taken
// from NOTES (the `base` field). Only the place on the staff differs, and the
// frequency is doubled: the same note, an octave higher.
//
// Only C5–G5 for now; A5 and B5 are taught later.

const SECOND_OCTAVE = [
  { base: 'do',  staff: 5, staffPlace: 'между 3-й и 4-й линейками' },
  { base: 're',  staff: 6, staffPlace: 'на четвёртой линейке' },
  { base: 'mi',  staff: 7, staffPlace: 'между 4-й и 5-й линейками' },
  { base: 'fa',  staff: 8, staffPlace: 'на пятой линейке' },
  { base: 'sol', staff: 9, staffPlace: 'над пятой линейкой' },
];

export const NOTES_2 = SECOND_OCTAVE.map(({ base, ...place }) => {
  const first = NOTE_BY_ID[base];
  return { ...first, ...place, id: `${base}2`, octave: 2, freq: Math.round(first.freq * 200) / 100 };
});

// Both octaves in a row, low to high: C4 … B4, C5 … G5.
export const TWO_OCTAVES = [...NOTES, ...NOTES_2];

const OCTAVE_NAMES = { 1: 'первой октавы', 2: 'второй октавы' };

/** Octave name as used after a note name in class, e.g. "C of the second octave". */
export const octaveName = (note) => OCTAVE_NAMES[note.octave];
