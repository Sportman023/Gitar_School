// Seven notes = the seven colours of the rainbow, in order:
//   C — red        G — light blue
//   D — orange     A — blue
//   E — yellow     B — violet
//   F — green
// Russian children learn the colour order with a mnemonic rhyme whose words
// start with the same letters as the colours. The app shows solfège names
// (the `ru` field), because that's what the music school uses.
//
// string/fret — where the note is played on the guitar in first position.
// Mind that the guitar sounds an octave lower than written. So the written
// C4 (first octave in Russian terms) is the 5th string, 3rd fret (sounding C3), not the
// 2nd string, 1st fret (that one is the written C5).
//
// staff — the note's position on a treble clef staff, counted in half-steps
// from the first (bottom) line: 0 — on the first line, +1 — the space above
// it, -1 — below it. All seven notes here are the first octave (octave: 1);
// the second octave is described below in NOTES_2.
//
// pc (pitch class) — semitones above C within the octave: C 0, D 2, E 4, F 5,
// G 7, A 9, B 11. There is an unnamed fret (a semitone) between C and D,
// while E–F and B–C are adjacent — that's where tones and semitones come from.
//
// To change a colour, a hint or add information, edit this file —
// the rest of the app picks the changes up by itself.

export const NOTES = [
  { id: 'do',   ru: 'До',  en: 'C', pc: 0,  color: '#E53935', ink: '#ffffff', colorName: 'Красный', octave: 1, freq: 261.63, staff: -2, staffPlace: 'на добавочной линеечке под станом', string: 5, fret: 3, guitar: '5-я струна, 3-й лад' },
  { id: 're',   ru: 'Ре',  en: 'D', pc: 2,  color: '#FB8C00', ink: '#ffffff', colorName: 'Оранжевый', octave: 1, freq: 293.66, staff: -1, staffPlace: 'под первой линейкой', string: 4, fret: 0, guitar: '4-я струна, открытая' },
  { id: 'mi',   ru: 'Ми',  en: 'E', pc: 4,  color: '#FDD835', ink: '#5a4600', colorName: 'Жёлтый', octave: 1, freq: 329.63, staff: 0, staffPlace: 'на первой линейке', string: 4, fret: 2, guitar: '4-я струна, 2-й лад' },
  { id: 'fa',   ru: 'Фа',  en: 'F', pc: 5,  color: '#43A047', ink: '#ffffff', colorName: 'Зелёный', octave: 1, freq: 349.23, staff: 1, staffPlace: 'между 1-й и 2-й линейками', string: 4, fret: 3, guitar: '4-я струна, 3-й лад' },
  { id: 'sol',  ru: 'Соль',en: 'G', pc: 7,  color: '#29B6F6', ink: '#073b57', colorName: 'Голубой', octave: 1, freq: 392.00, staff: 2, staffPlace: 'на второй линейке', string: 3, fret: 0, guitar: '3-я струна, открытая' },
  { id: 'lya',  ru: 'Ля',  en: 'A', pc: 9,  color: '#3949AB', ink: '#ffffff', colorName: 'Синий', octave: 1, freq: 440.00, staff: 3, staffPlace: 'между 2-й и 3-й линейками', string: 3, fret: 2, guitar: '3-я струна, 2-й лад' },
  { id: 'si',   ru: 'Си',  en: 'B', pc: 11, color: '#8E24AA', ink: '#ffffff', colorName: 'Фиолетовый', octave: 1, freq: 493.88, staff: 4, staffPlace: 'на третьей линейке', string: 2, fret: 0, guitar: '2-я струна, открытая' },
];

export const NOTE_BY_ID = Object.fromEntries(NOTES.map((n) => [n.id, n]));

// ---------- Second octave ----------
//
// Name, colour and pc are the same as in the first octave, so they are taken
// from NOTES (the `base` field). Only the place differs: higher on the staff,
// and on the guitar the note moves to the thinnest strings. The frequency is
// doubled: the same note, an octave higher.
//
// Only C5–G5 are here — everything playable in first position. A5 and B5 are
// on the 5th and 7th frets of the 1st string and are taught later.
//
// Same guitar convention as above: the written C5 is the 2nd string, 1st fret.

const SECOND_OCTAVE = [
  { base: 'do',  staff: 5, staffPlace: 'между 3-й и 4-й линейками', string: 2, fret: 1, guitar: '2-я струна, 1-й лад' },
  { base: 're',  staff: 6, staffPlace: 'на четвёртой линейке',      string: 2, fret: 3, guitar: '2-я струна, 3-й лад' },
  { base: 'mi',  staff: 7, staffPlace: 'между 4-й и 5-й линейками', string: 1, fret: 0, guitar: '1-я струна, открытая' },
  { base: 'fa',  staff: 8, staffPlace: 'на пятой линейке',          string: 1, fret: 1, guitar: '1-я струна, 1-й лад' },
  { base: 'sol', staff: 9, staffPlace: 'над пятой линейкой',        string: 1, fret: 3, guitar: '1-я струна, 3-й лад' },
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

// ---------- Open strings ----------
//
// Numbered the way the music school does it: from the thinnest string,
// and every string has a name.
//
//   1 — E   2 — B   3 — G   4 — D   5 — A   6 — E
//
// Both outer strings are E: the 6th hums low, the 1st rings high.
//
// freq — the written pitch (same convention as NOTES): the app plays notes
// as they are written, i.e. an octave above a real guitar.

export const STRINGS = [
  { number: 1, noteId: 'mi',  ru: 'Ми',   en: 'E', freq: 659.25, thickness: 'самая тонкая' },
  { number: 2, noteId: 'si',  ru: 'Си',   en: 'B', freq: 493.88, thickness: 'тонкая' },
  { number: 3, noteId: 'sol', ru: 'Соль', en: 'G', freq: 392.00, thickness: 'средняя' },
  { number: 4, noteId: 're',  ru: 'Ре',   en: 'D', freq: 293.66, thickness: 'средняя' },
  { number: 5, noteId: 'lya', ru: 'Ля',   en: 'A', freq: 220.00, thickness: 'толстая' },
  { number: 6, noteId: 'mi',  ru: 'Ми',   en: 'E', freq: 164.81, thickness: 'самая толстая' },
];

export const STRING_BY_NUMBER = Object.fromEntries(STRINGS.map((s) => [s.number, s]));

const NOTE_BY_PC = Object.fromEntries(NOTES.map((n) => [n.pc, n]));

/**
 * What sounds on a string when a fret is pressed. One fret = one semitone.
 * Returns { note, freq }; note is null for sharps/flats
 * (those frets are not labelled yet).
 */
export function fretNote(stringNumber, fret) {
  const string = STRING_BY_NUMBER[stringNumber];
  if (!string) return null;
  const open = NOTE_BY_ID[string.noteId];
  return {
    note: NOTE_BY_PC[(open.pc + fret) % 12] || null,
    freq: string.freq * 2 ** (fret / 12),
  };
}

// Steps of the C major scale: how many frets from each note to the next.
// Follows from pc: two frets (a tone) everywhere, and only
// E → F and B → C are one fret (a semitone).
export const SCALE_STEPS = NOTES.map((note, i) => {
  const next = NOTES[(i + 1) % NOTES.length];
  const frets = (next.pc - note.pc + 12) % 12;
  return { from: note, to: next, frets, name: frets === 1 ? 'полутон' : 'тон' };
});
