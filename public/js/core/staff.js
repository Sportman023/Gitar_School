// Drawing a treble clef staff.
//
// Coordinates (one unit = half the distance between staff lines):
//   lines          y = 24, 34, 44, 54, 64  (top to bottom)
//   first (E)      y = 64
//   second (G)     y = 54  — the curl of the treble clef wraps around it
// A note's position comes from its `staff` field in js/data/notes.js.
//
// Two pictures live here:
//   renderStaff    — a staff with a single note (cards and quizzes);
//   renderStaffRow — a long staff with notes in a row, like a ladder.

import { svgEl } from './ui.js';
import { octaveName } from '../data/notes.js';

const TOP_LINE = 24;
const SPACING = 10;
const BOTTOM_LINE = TOP_LINE + SPACING * 4;   // 64 — first line, note E
const MIDDLE_STEP = 4;                        // middle line, note B
const HEIGHT = 94;
const NOTE_X = 88;
const HEAD_RX = 6.3;
const HEAD_RY = 4.7;

const ROW_FIRST_X = 64;
const ROW_STEP = 25;
const ROW_BRACKET_Y = 92;

// Treble clef as a single curve; its curl lands exactly on the G line (y = 54).
const CLEF_PATH = [
  'M 24,84',
  'C 28,88 35,85 34,77',
  'C 33,69 32,62 31,54',
  'C 30,44 29,34 29,24',
  'C 29,16 28,11 25,8',
  'C 21,4 16,8 16,16',
  'C 16,24 15,32 15,40',
  'C 14,50 15,60 18,67',
  'C 21,73 29,76 36,73',
  'C 43,70 47,62 45,54',
  'C 43,46 36,41 29,43',
  'C 23,45 19,51 21,57',
  'C 23,62 29,64 33,60',
  'C 36,57 35,53 32,52',
  'C 30,51 29,53 30,54',
].join(' ');

export function noteY(note) {
  return BOTTOM_LINE - note.staff * (SPACING / 2);
}

/** Five staff lines of the given length plus the treble clef. */
function staffBase(width) {
  const parts = [];
  for (let i = 0; i < 5; i++) {
    const y = TOP_LINE + i * SPACING;
    parts.push(svgEl('line', { x1: 8, x2: width - 8, y1: y, y2: y, class: 'staff__line' }));
  }
  parts.push(svgEl('path', { d: CLEF_PATH, class: 'staff__clef' }));
  return parts;
}

/** One note at x: ledger lines, stem and head. */
function noteParts(note, x, colored) {
  const y = noteY(note);
  const parts = [];
  const ledger = (ly) => svgEl('line', { x1: x - 11, x2: x + 11, y1: ly, y2: ly, class: 'staff__ledger' });

  // ledger lines: below the staff (middle C) and above it
  for (let ly = BOTTOM_LINE + SPACING; ly <= y; ly += SPACING) parts.push(ledger(ly));
  for (let ly = TOP_LINE - SPACING; ly >= y; ly -= SPACING) parts.push(ledger(ly));

  // stem: below the middle line it goes up on the right, from the middle line up it goes down on the left
  const stemUp = note.staff < MIDDLE_STEP;
  const stemX = stemUp ? x + HEAD_RX - 0.8 : x - HEAD_RX + 0.8;
  parts.push(svgEl('line', {
    x1: stemX,
    x2: stemX,
    y1: stemUp ? y - 1 : y + 1,
    y2: stemUp ? y - 32 : y + 32,
    class: 'staff__stem',
  }));

  parts.push(svgEl('ellipse', {
    cx: x, cy: y, rx: HEAD_RX, ry: HEAD_RY,
    transform: `rotate(-20 ${x} ${y})`,
    class: 'staff__head',
    style: colored ? `fill:${note.color}` : '',
  }));

  return parts;
}

/**
 * A staff with one note (or an empty staff when no note is given).
 * colored — paint the note head in its rainbow colour.
 */
export function renderStaff(note, { colored = true, extraClass = '' } = {}) {
  const width = 126;
  const parts = staffBase(width);
  if (note) parts.push(...noteParts(note, NOTE_X, colored));

  return svgEl('svg', {
    viewBox: `0 0 ${width} ${HEIGHT}`,
    class: `staff ${extraClass}`.trim(),
    role: 'img',
    'aria-label': note ? `Нота ${note.ru} на нотном стане` : 'Пустой нотный стан',
  }, ...parts);
}

/**
 * A long staff with notes in a row, left to right. Notes of the same octave
 * get a labelled bracket underneath. Every note carries data-freq so it can
 * be played on tap (see playableMap).
 */
export function renderStaffRow(notes, { colored = true, extraClass = '' } = {}) {
  const xAt = (i) => ROW_FIRST_X + i * ROW_STEP;
  const width = xAt(notes.length - 1) + 22;
  const height = ROW_BRACKET_Y + 16;
  const parts = staffBase(width);

  notes.forEach((note, i) => {
    parts.push(svgEl('g', {
      class: 'staff__note',
      'data-freq': note.freq,
      role: 'button',
      'aria-label': `Нота ${note.ru} ${octaveName(note)}`,
    },
      // a transparent full-height strip: a tiny note head is hard to hit with a finger
      svgEl('rect', { x: xAt(i) - ROW_STEP / 2, y: 0, width: ROW_STEP, height, class: 'staff__hit' }),
      ...noteParts(note, xAt(i), colored)));
  });

  for (const octave of new Set(notes.map((n) => n.octave))) {
    const indexes = notes.flatMap((n, i) => (n.octave === octave ? [i] : []));
    const x1 = xAt(indexes[0]) - 9;
    const x2 = xAt(indexes[indexes.length - 1]) + 9;
    parts.push(
      svgEl('path', { d: `M${x1} ${ROW_BRACKET_Y - 5} V${ROW_BRACKET_Y} H${x2} V${ROW_BRACKET_Y - 5}`, class: 'staff__bracket' }),
      svgEl('text', { x: (x1 + x2) / 2, y: ROW_BRACKET_Y + 13, class: 'staff__bracket-text' }, `${octave}-я октава`),
    );
  }

  return svgEl('svg', {
    viewBox: `0 0 ${width} ${height}`,
    class: `staff ${extraClass}`.trim(),
    role: 'img',
    'aria-label': 'Ноты подряд на нотном стане',
  }, ...parts);
}

/** Tap a note in the row to hear it. One listener for the whole picture. */
export function playableMap(svg, play) {
  svg.addEventListener('click', (event) => {
    const note = event.target.closest('[data-freq]');
    if (note) play(Number(note.dataset.freq));
  });
  return svg;
}
