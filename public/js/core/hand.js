// Drawing a hand: the back of it, with the nails in view — that's the side you
// see while playing. Palm creases are deliberately absent: they belong to the
// other side of the hand.
//
// The drawing below is a RIGHT hand seen from the back, so the thumb is on the
// left — the way both hands look lying on a table, thumbs towards each other.
// The left hand is the same drawing mirrored; the labels are placed afterwards,
// so they never end up mirrored themselves.
//
// Proportions follow a real hand: the palm is as long as it is wide, the middle
// finger is a bit shorter than the palm, and the four fingers together are
// narrower than the palm.
//
// Shapes are filled without outlines, so a finger and the palm merge into one
// silhouette wherever they overlap. Nails and knuckles are drawn on top.

import { svgEl } from './ui.js';

const WIDTH = 116;
const HEIGHT = 158;

const KNUCKLES = 82;   // the line the four fingers grow from

// Every finger grows upwards from (x, base), then leans by `turn` degrees
// around that same point — that's the natural splay of a hand.
const FINGERS = [
  { id: 'thumb', x: 46, base: 130, length: 46, width: 15.5, tip: 13, turn: -40 },
  { id: 'index', x: 52, base: KNUCKLES, length: 52, width: 13.5, tip: 11.5, turn: -6 },
  { id: 'middle', x: 65, base: KNUCKLES, length: 58, width: 14, tip: 11.5, turn: 0 },
  { id: 'ring', x: 78, base: KNUCKLES, length: 54, width: 13, tip: 11, turn: 6 },
  { id: 'pinky', x: 90.5, base: KNUCKLES, length: 42, width: 11.5, tip: 9.5, turn: 13 },
];

// Back of the hand: wide at the knuckles, a bulge at the base of the thumb,
// rounded at the bottom. The gap between that bulge and the index finger is the
// web of the thumb, so the thumb starts low and leans well away from the index.
const BACK = [
  'M 44,82',
  'C 41,93 37,101 35,112',
  'C 33,127 37,144 54,150',
  'C 68,154 84,150 91,140',
  'C 97,132 98,120 98,110',
  'C 98,98 98,90 97,82',
  'Z',
].join(' ');

const LABEL_GAP = 13;
const LABEL_R = 9.5;

const radians = (deg) => (deg * Math.PI) / 180;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/** A finger: a capsule that narrows towards the rounded tip. */
function fingerPath({ x, base, length, width, tip }) {
  const top = base - length;
  const half = width / 2;
  const halfTip = tip / 2;
  return [
    `M ${x - half},${base}`,
    `L ${x - halfTip},${top + halfTip}`,
    `A ${halfTip},${halfTip} 0 0 1 ${x + halfTip},${top + halfTip}`,
    `L ${x + half},${base}`,
    'Z',
  ].join(' ');
}

/** The nail: a small rounded rectangle just under the tip. */
function nailRect({ x, base, length, tip }) {
  const width = tip * 0.62;
  const height = tip * 0.78;
  return { x: x - width / 2, y: base - length + tip * 0.2, width, height, rx: width * 0.42 };
}

/** Where the label sits: beyond the tip, along the way the finger leans. */
function labelPoint({ x, base, length, turn }) {
  const angle = radians(turn);
  const reach = length + LABEL_GAP;
  return {
    x: clamp(x + reach * Math.sin(angle), LABEL_R + 1.5, WIDTH - LABEL_R - 1.5),
    y: Math.max(base - reach * Math.cos(angle), LABEL_R + 1),
  };
}

/** A crease over the base of a finger, hinting at the knuckle. */
function knucklePath({ x, base, width }) {
  const half = width / 2 - 1.5;
  return `M ${x - half},${base + 1} Q ${x},${base + 4.5} ${x + half},${base + 1}`;
}

const leaning = (finger) => `rotate(${finger.turn} ${finger.x} ${finger.base})`;

/**
 * One hand. side — 'left' or 'right'; labels — what to write on the fingers,
 * e.g. { index: '1' }; active — the finger to paint in the accent colour.
 *
 * onPick makes the fingers tappable: it is called with '<side>-<finger>',
 * e.g. 'left-index', and every finger carries that id in data-answer, so a
 * quiz can mark the right and the wrong one (js/core/quiz.js).
 */
export function renderHand(side, { labels = {}, active = null, label = '', onPick = null } = {}) {
  const mirror = side === 'left';
  const answerOf = (finger) => `${side}-${finger.id}`;
  const tappable = (node, finger) => {
    if (onPick) node.addEventListener('click', () => onPick(answerOf(finger)));
    return node;
  };

  // Fingers are narrow for a child's tap, so each one also gets a wider
  // invisible outline. These lie under all the fingers: a tap on a finger
  // itself always goes to that finger, the outline only catches near misses.
  const hits = onPick
    ? FINGERS.map((finger) => tappable(svgEl('path', {
      d: fingerPath(finger),
      class: 'hand__hit',
      transform: leaning(finger),
    }), finger))
    : null;

  const hand = svgEl('g', { transform: mirror ? `translate(${WIDTH} 0) scale(-1 1)` : null },
    svgEl('path', { d: BACK, class: 'hand__part' }),
    hits,
    FINGERS.map((finger) => tappable(svgEl('g', {
      class: `hand__finger ${active === finger.id ? 'hand__finger--active' : ''}`.trim(),
      transform: leaning(finger),
      'data-answer': onPick ? answerOf(finger) : null,
    },
      svgEl('path', { d: fingerPath(finger), class: 'hand__part' }),
      svgEl('rect', { ...nailRect(finger), class: 'hand__nail' }),
    ), finger)),
    FINGERS.filter((finger) => finger.id !== 'thumb')
      .map((finger) => svgEl('path', { d: knucklePath(finger), class: 'hand__crease' })),
  );

  const marks = FINGERS.filter((finger) => labels[finger.id]).map((finger) => {
    const point = labelPoint(finger);
    const cx = mirror ? WIDTH - point.x : point.x;
    return svgEl('g', null,
      svgEl('circle', { cx, cy: point.y, r: LABEL_R, class: 'hand__label-bg' }),
      svgEl('text', { x: cx, y: point.y + 4, class: 'hand__label-text' }, labels[finger.id]),
    );
  });

  return svgEl('svg', {
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    class: `hand ${onPick ? 'hand--pickable' : ''}`.trim(),
    role: 'img',
    'aria-label': label,
  }, hand, ...marks);
}
