// Drawing the guitar fretboard in first position (nut + four frets).
//
// As if looking down at your own guitar: headstock on the left,
// the 6th (thickest) string at the top, the 1st (thinnest) at the bottom.
//
// Two pictures live here:
//   renderFretboard — a single note on the fretboard (cards and quizzes);
//   renderFretMap   — a map with named strings and notes on the frets.

import { svgEl } from './ui.js';
import { STRING_BY_NUMBER, fretNote } from '../data/notes.js';

const NUT_X = 32;
const FRET_W = 36;
const FRETS = 4;
const STRING_TOP = 24;
const STRING_GAP = 13;
const STRINGS = 6;
const OPEN_X = 19;
const MARK_R = 8;

const stringY = (number) => STRING_TOP + (STRINGS - number) * STRING_GAP;
const fretX = (fret) => NUT_X + (fret - 0.5) * FRET_W;

/** String thickness: the 6th (bass) is thick, the 1st is thin. */
const stringWidth = (number) => 0.8 + (number - 1) * 0.34;

/**
 * A fretboard with one marked note.
 * stringNames — label strings with their names as well as numbers.
 * Quizzes keep names off: for open strings the label would give the answer away.
 */
export function renderFretboard(note, { colored = true, extraClass = '', stringNames = false } = {}) {
  const neckTop = stringY(6) - 7;
  const neckBottom = stringY(1) + 7;
  const neckRight = NUT_X + FRETS * FRET_W;
  const parts = [];

  parts.push(svgEl('rect', {
    x: NUT_X, y: neckTop, width: neckRight - NUT_X, height: neckBottom - neckTop,
    rx: 3, class: 'fb__neck',
  }));

  // position marker on the 3rd fret — real fretboards have this dot too
  parts.push(svgEl('circle', {
    cx: fretX(3), cy: (neckTop + neckBottom) / 2, r: 5, class: 'fb__inlay',
  }));

  for (let f = 1; f <= FRETS; f++) {
    const x = NUT_X + f * FRET_W;
    parts.push(svgEl('line', { x1: x, x2: x, y1: neckTop, y2: neckBottom, class: 'fb__fret' }));
    parts.push(svgEl('text', { x: fretX(f), y: neckBottom + 16, class: 'fb__fret-num' }, String(f)));
  }

  parts.push(svgEl('line', {
    x1: NUT_X, x2: NUT_X, y1: neckTop, y2: neckBottom, class: 'fb__nut',
  }));

  for (let s = 1; s <= STRINGS; s++) {
    const y = stringY(s);
    parts.push(svgEl('line', {
      x1: NUT_X, x2: neckRight, y1: y, y2: y,
      class: 'fb__string', style: `stroke-width:${stringWidth(s)}`,
    }));
  }

  if (note) {
    const y = stringY(note.string);
    const fill = colored ? note.color : '';
    if (note.fret === 0) {
      // open string — a ring before the nut, as in guitar chord charts
      parts.push(svgEl('circle', {
        cx: OPEN_X, cy: y, r: MARK_R - 1.5,
        class: 'fb__open', style: fill ? `stroke:${fill}` : '',
      }));
    } else {
      parts.push(svgEl('circle', {
        cx: fretX(note.fret), cy: y, r: MARK_R,
        class: 'fb__dot', style: fill ? `fill:${fill}` : '',
      }));
    }
  }

  // string labels sit left of the neck: longer names shift the whole picture
  const leftPad = stringNames ? 48 : 0;
  const body = leftPad ? [svgEl('g', { transform: `translate(${leftPad},0)` }, ...parts)] : parts;

  for (let s = 1; s <= STRINGS; s++) {
    const y = stringY(s) + 4;
    body.push(stringNames
      ? svgEl('text', { x: leftPad - 4, y, class: 'fb__string-name' }, `${s} ${STRING_BY_NUMBER[s].ru}`)
      : svgEl('text', { x: 7, y, class: 'fb__string-num' }, String(s)));
  }

  return svgEl('svg', {
    viewBox: `0 0 ${leftPad + NUT_X + FRETS * FRET_W + 14} ${stringY(1) + 30}`,
    class: `fretboard ${extraClass}`.trim(),
    role: 'img',
    'aria-label': note ? `Нота ${note.ru}: ${note.guitar}` : 'Гриф гитары',
  }, ...body);
}

// ---------- Fretboard map with note names ----------
//
// The notation used at school: string number and its name (the open string)
// on the left, then every fret labelled with its note. One fret is a
// semitone, so F sits right after E, while getting to G skips a fret.

const MAP_NUT = 62;
const MAP_FRET_W = 54;
const MAP_ROW = 28;
const MAP_PILL_W = 38;
const MAP_PILL_H = 22;
const MAP_OPEN_X = MAP_NUT - 26;
const MAP_STEPS_TOP = 30;

const mapFretX = (fret) => MAP_NUT + (fret - 0.5) * MAP_FRET_W;

/** A pill with the note name. data-freq lets it be played on tap. */
function notePill(cx, cy, note, freq, colored) {
  return svgEl('g', {
    class: 'fb__pill',
    'data-freq': freq.toFixed(2),
    'data-note': note.ru,
    role: 'button',
    'aria-label': `Нота ${note.ru}`,
  },
    svgEl('rect', {
      x: cx - MAP_PILL_W / 2, y: cy - MAP_PILL_H / 2,
      width: MAP_PILL_W, height: MAP_PILL_H, rx: MAP_PILL_H / 2,
      class: 'fb__pill-bg',
      style: colored ? `fill:${note.color}` : '',
    }),
    svgEl('text', {
      x: cx, y: cy + 4, class: 'fb__pill-text',
      style: colored ? `fill:${note.ink}` : '',
    }, note.ru));
}

/** A "tone"/"semitone" bracket above the string between two notes. */
function stepBracket(x1, x2, cy, frets) {
  const half = frets === 1;
  const top = cy - 21;
  return [
    svgEl('path', {
      d: `M${x1} ${cy - 15} V${top} H${x2} V${cy - 15}`,
      class: `fb__step-line ${half ? 'fb__step-line--half' : ''}`,
    }),
    svgEl('text', {
      x: (x1 + x2) / 2, y: top - 5,
      class: `fb__step-text ${half ? 'fb__step-text--half' : ''}`,
    }, half ? 'полутон' : 'тон'),
  ];
}

/**
 * Fretboard map: named strings and notes on the frets.
 * strings — which strings to draw (top to bottom), all six by default.
 * steps   — label the distance between notes above them (tone/semitone).
 *           Meant for a single string: above six strings the brackets
 *           would not fit.
 */
export function renderFretMap({
  strings = [6, 5, 4, 3, 2, 1],
  frets = 4,
  colored = true,
  steps = false,
  extraClass = '',
} = {}) {
  const top = (steps ? MAP_STEPS_TOP : 0) + MAP_PILL_H / 2 + 4;
  const rowY = (i) => top + i * MAP_ROW;
  const neckTop = rowY(0) - 14;
  const neckBottom = rowY(strings.length - 1) + 14;
  const neckRight = MAP_NUT + frets * MAP_FRET_W;
  const parts = [];

  parts.push(svgEl('rect', {
    x: MAP_NUT, y: neckTop, width: neckRight - MAP_NUT, height: neckBottom - neckTop,
    rx: 3, class: 'fb__neck',
  }));

  for (let f = 1; f <= frets; f++) {
    const x = MAP_NUT + f * MAP_FRET_W;
    parts.push(svgEl('line', { x1: x, x2: x, y1: neckTop, y2: neckBottom, class: 'fb__fret' }));
    parts.push(svgEl('text', { x: mapFretX(f), y: neckBottom + 16, class: 'fb__fret-num' }, `${f}-й лад`));
  }

  parts.push(svgEl('line', { x1: MAP_NUT, x2: MAP_NUT, y1: neckTop, y2: neckBottom, class: 'fb__nut' }));
  parts.push(svgEl('text', { x: MAP_OPEN_X, y: neckBottom + 16, class: 'fb__fret-num' }, 'откр.'));

  strings.forEach((number, i) => {
    const cy = rowY(i);
    const named = [];

    parts.push(svgEl('line', {
      x1: MAP_NUT, x2: neckRight, y1: cy, y2: cy,
      class: 'fb__string', style: `stroke-width:${stringWidth(number)}`,
    }));
    parts.push(svgEl('text', { x: 12, y: cy + 4, class: 'fb__string-num' }, String(number)));

    for (let f = 0; f <= frets; f++) {
      const { note, freq } = fretNote(number, f);
      const cx = f === 0 ? MAP_OPEN_X : mapFretX(f);
      if (note) {
        named.push({ cx, f });
        parts.push(notePill(cx, cy, note, freq, colored));
      } else {
        // a fret without a natural note name: a sharp/flat, taught later
        parts.push(svgEl('circle', { cx, cy, r: 3, class: 'fb__half' }));
      }
    }

    if (steps) {
      for (let k = 1; k < named.length; k++) {
        parts.push(...stepBracket(named[k - 1].cx, named[k].cx, cy, named[k].f - named[k - 1].f));
      }
    }
  });

  const label = strings.length === 1
    ? `Ноты на ${strings[0]}-й струне`
    : 'Ноты на грифе: шесть струн и первые лады';

  return svgEl('svg', {
    viewBox: `0 0 ${neckRight + 14} ${neckBottom + 22}`,
    class: `fretboard fretboard--map ${extraClass}`.trim(),
    role: 'img',
    'aria-label': label,
  }, ...parts);
}

/** Tap a labelled note to hear it. One listener for the whole picture. */
export function playableMap(svg, play) {
  svg.addEventListener('click', (event) => {
    const pill = event.target.closest('[data-freq]');
    if (pill) play(Number(pill.dataset.freq));
  });
  return svg;
}
