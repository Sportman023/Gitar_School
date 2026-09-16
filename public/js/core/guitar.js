// Drawing the player's guitar (SVG).
//
// The guitar stands upright: headstock at the top, body at the bottom.
// Coordinates: x 0..200 with the strings centred on x = 100, y 0..400.
// The viewBox has a margin around it so effects (sparkles, glow, fire)
// can spill outside the guitar itself.
//
// What can be drawn is listed in js/data/guitar.js:
//   renderGuitar(guitar) — the whole guitar { shape, color, stickers, effect };
//   renderSticker(id)    — a single sticker for workshop buttons;
//   renderSwatch(id)     — a paint sample for workshop buttons.

import { svgEl } from './ui.js';
import { MAX_STICKERS } from '../data/guitar.js';

// Every guitar needs its own gradient/clip ids: several can be on one page.
let uid = 0;

const NUT_Y = 58;

// ---------- Paints ----------
//
// `stops` go top-left → bottom-right (or top → bottom when vertical is set),
// `edge` outlines the body.

const PAINTS = {
  wood: { stops: ['#EFC795', '#D39A5B', '#B77A3D'], edge: '#7A4A22' },
  red: { stops: ['#FF7A73', '#E53935', '#B71C1C'], edge: '#7F1515' },
  orange: { stops: ['#FFB74D', '#FB8C00', '#D86A00'], edge: '#8A4500' },
  yellow: { stops: ['#FFF59D', '#FDD835', '#E0B200'], edge: '#8C6D00' },
  green: { stops: ['#81C784', '#43A047', '#2E7D32'], edge: '#1B4D1E' },
  lightblue: { stops: ['#81D4FA', '#29B6F6', '#0288D1'], edge: '#01579B' },
  blue: { stops: ['#7986CB', '#3949AB', '#283593'], edge: '#1A237E' },
  violet: { stops: ['#CE93D8', '#8E24AA', '#6A1B9A'], edge: '#4A148C' },
  pink: { stops: ['#F8BBD0', '#EC407A', '#C2185B'], edge: '#880E4F' },
  rainbow: {
    stops: ['#E53935', '#FB8C00', '#FDD835', '#43A047', '#29B6F6', '#3949AB', '#8E24AA'],
    edge: '#4A148C',
    vertical: true,
  },
  gold: { stops: ['#FFF8C4', '#FFD54F', '#FFB300', '#C68400'], edge: '#8A5B00' },
  galaxy: { stops: ['#6A3FC0', '#2A1466', '#0D0630'], edge: '#05021A', stars: true },
};

function paintGradient(id, paint) {
  const last = paint.stops.length - 1;
  return svgEl('linearGradient', {
    id,
    x1: 0, y1: 0,
    x2: paint.vertical ? 0 : 1,
    y2: 1,
  }, paint.stops.map((color, i) => svgEl('stop', { offset: last ? i / last : 0, 'stop-color': color })));
}

// ---------- Body shapes ----------
//
// For each shape: the body outline, where the fingerboard ends, where the
// bridge sits (strings end there), extra details, a highlight and the
// spots where stickers go (x, y, rotation, scale).

const STAR_BODY = (() => {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 ? 42 : 95;
    const angle = (-90 + i * 36) * (Math.PI / 180);
    points.push(`${(100 + radius * Math.cos(angle)).toFixed(1)} ${(300 + radius * Math.sin(angle)).toFixed(1)}`);
  }
  return `M${points.join(' L')} Z`;
})();

const SHAPES = {
  classic: {
    body: 'M100 175 C130 175 152 188 152 218 C152 240 138 250 138 265 C138 280 176 292 176 332 '
      + 'C176 372 144 392 100 392 C56 392 24 372 24 332 C24 292 62 280 62 265 '
      + 'C62 250 48 240 48 218 C48 188 70 175 100 175 Z',
    neckEnd: 240,
    acoustic: { cx: 100, cy: 264, r: 17 },
    bridge: { y: 330, w: 56 },
    glare: { cx: 66, cy: 212, rx: 11, ry: 22, rotate: 20 },
    stickers: [{ x: 52, y: 322, r: -15 }, { x: 150, y: 352, r: 12 }, { x: 128, y: 206, r: 10, s: 0.9 }],
  },
  heart: {
    body: 'M100 212 C88 186 60 176 42 190 C18 208 20 250 36 280 C52 312 84 344 100 390 '
      + 'C116 344 148 312 164 280 C180 250 182 208 158 190 C140 176 112 186 100 212 Z',
    neckEnd: 236,
    acoustic: { cx: 100, cy: 262, r: 15 },
    bridge: { y: 316, w: 44 },
    glare: { cx: 46, cy: 232, rx: 8, ry: 20, rotate: 10 },
    stickers: [{ x: 60, y: 220, r: -15 }, { x: 140, y: 222, r: 15 }, { x: 62, y: 280, r: -10, s: 0.9 }],
  },
  electric: {
    body: 'M88 222 C84 200 72 178 58 182 C44 186 46 214 44 236 C42 256 26 272 26 312 '
      + 'C26 362 60 392 100 392 C140 392 174 362 174 312 C174 276 158 262 156 246 '
      + 'C154 226 164 208 152 202 C140 196 120 206 112 222 Z',
    neckEnd: 250,
    electric: {
      guard: 'M80 242 C74 258 68 276 70 300 C72 324 86 340 104 340 C120 340 130 330 133 316 '
        + 'C137 296 134 270 120 242 Z',
      pickups: [262, 292],
      knobs: [[146, 328], [138, 346]],
    },
    bridge: { y: 318, w: 40, metal: true },
    glare: { cx: 44, cy: 300, rx: 8, ry: 26, rotate: 0 },
    stickers: [{ x: 50, y: 334, r: -12 }, { x: 150, y: 364, r: 10, s: 0.9 }, { x: 62, y: 220, r: -20, s: 0.9 }],
  },
  star: {
    body: STAR_BODY,
    neckEnd: 250,
    acoustic: { cx: 100, cy: 290, r: 14 },
    bridge: { y: 320, w: 36 },
    glare: { cx: 40, cy: 276, rx: 5, ry: 12, rotate: 70 },
    stickers: [{ x: 48, y: 284, r: -10, s: 0.8 }, { x: 152, y: 284, r: 10, s: 0.8 }, { x: 68, y: 345, r: -20, s: 0.72 }],
  },
  arrow: {
    body: 'M86 205 L18 382 Q24 398 42 392 L100 300 L158 392 Q176 398 182 382 L114 205 Z',
    neckEnd: 236,
    electric: {
      guard: null,
      pickups: [246, 268],
      knobs: [[130, 322], [142, 340]],
    },
    bridge: { y: 286, w: 36, metal: true },
    glare: { cx: 50, cy: 300, rx: 5, ry: 34, rotate: 21 },
    stickers: [{ x: 56, y: 342, r: -20, s: 0.9 }, { x: 36, y: 376, r: -20, s: 0.7 }, { x: 164, y: 376, r: 20, s: 0.7 }],
  },
};

// ---------- Parts ----------

function headstock(paintFill, edge) {
  const parts = [];
  // tuning keys stick out on both sides
  for (const y of [18, 32, 46]) {
    parts.push(svgEl('rect', { x: 74, y: y - 3, width: 12, height: 6, rx: 3, class: 'gt__key' }));
    parts.push(svgEl('rect', { x: 114, y: y - 3, width: 12, height: 6, rx: 3, class: 'gt__key' }));
  }
  parts.push(svgEl('path', {
    d: 'M84 8 Q100 0 116 8 L114 60 L86 60 Z',
    fill: paintFill, stroke: edge, 'stroke-width': 2, 'stroke-linejoin': 'round',
  }));
  for (const y of [18, 32, 46]) {
    parts.push(svgEl('circle', { cx: 91, cy: y, r: 2.2, class: 'gt__peg' }));
    parts.push(svgEl('circle', { cx: 109, cy: y, r: 2.2, class: 'gt__peg' }));
  }
  return parts;
}

function neck(end) {
  const parts = [
    svgEl('rect', { x: 91, y: NUT_Y, width: 18, height: end - NUT_Y, rx: 2, class: 'gt__board' }),
    svgEl('rect', { x: 89.5, y: NUT_Y - 1, width: 21, height: 4, rx: 1, class: 'gt__nut' }),
  ];
  // frets get closer together towards the body, like on a real guitar
  let y = NUT_Y + 3;
  let gap = 17;
  let fret = 0;
  while (y + gap < end - 2) {
    const next = y + gap;
    fret += 1;
    if ([3, 5, 7, 9].includes(fret)) {
      parts.push(svgEl('circle', { cx: 100, cy: next - gap / 2, r: 2, class: 'gt__inlay' }));
    }
    parts.push(svgEl('line', { x1: 91, x2: 109, y1: next, y2: next, class: 'gt__fret' }));
    y = next;
    gap *= 0.94;
  }
  return parts;
}

function acousticParts({ cx, cy, r }) {
  return [
    svgEl('circle', { cx, cy, r: r + 5, class: 'gt__rosette' }),
    svgEl('circle', { cx, cy, r: r + 2, class: 'gt__rosette gt__rosette--thin' }),
    svgEl('circle', { cx, cy, r, class: 'gt__hole' }),
  ];
}

function electricParts({ guard, pickups, knobs }) {
  const parts = [];
  if (guard) parts.push(svgEl('path', { d: guard, class: 'gt__guard' }));
  for (const y of pickups) {
    parts.push(svgEl('rect', { x: 83, y: y - 5, width: 34, height: 10, rx: 3, class: 'gt__pickup' }));
    for (let i = 0; i < 6; i++) {
      parts.push(svgEl('circle', { cx: 88 + i * 4.8, cy: y, r: 1.1, class: 'gt__pole' }));
    }
  }
  for (const [cx, cy] of knobs) {
    parts.push(svgEl('circle', { cx, cy, r: 5, class: 'gt__knob' }));
  }
  return parts;
}

function bridgeParts({ y, w, metal }) {
  return [
    svgEl('rect', { x: 100 - w / 2, y: y - 5, width: w, height: 10, rx: 3, class: metal ? 'gt__bridge gt__bridge--metal' : 'gt__bridge' }),
    svgEl('line', { x1: 100 - w / 2 + 8, x2: 100 + w / 2 - 8, y1: y - 1.5, y2: y - 1.5, class: 'gt__saddle' }),
  ];
}

function strings(bridgeY) {
  const parts = [];
  for (let i = 0; i < 6; i++) {
    parts.push(svgEl('line', {
      x1: 93.5 + i * 2.6, y1: NUT_Y + 1,
      x2: 91 + i * 3.6, y2: bridgeY - 1.5,
      class: 'gt__string', 'stroke-width': 1.3 - i * 0.14,
    }));
  }
  return parts;
}

// ---------- Stickers ----------
//
// Drawn around (0, 0), about 26 units wide, with a white "sticker" outline.

function starPath(outer, inner) {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 ? inner : outer;
    const angle = (-90 + i * 36) * (Math.PI / 180);
    points.push(`${(radius * Math.cos(angle)).toFixed(2)} ${(radius * Math.sin(angle)).toFixed(2)}`);
  }
  return `M${points.join(' L')} Z`;
}

const outlined = { stroke: '#fff', 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'paint-order': 'stroke' };

const STICKERS = {
  star: () => [svgEl('path', { d: starPath(14, 6), fill: '#FFD54F', ...outlined })],
  heart: () => [svgEl('path', {
    d: 'M0 11 C-15 1 -13 -11 -6 -11 C-2 -11 0 -8 0 -5.5 C0 -8 2 -11 6 -11 C13 -11 15 1 0 11 Z',
    fill: '#FF4F7B', ...outlined,
  })],
  note: () => [
    svgEl('circle', { r: 12.5, fill: '#fff', stroke: '#29B6F6', 'stroke-width': 2.2 }),
    svgEl('ellipse', { cx: -3, cy: 5, rx: 4.2, ry: 3.2, transform: 'rotate(-20 -3 5)', fill: '#1b1636' }),
    svgEl('path', { d: 'M0.8 4.5 V-8 C4 -6 7.5 -4 6 1.5', fill: 'none', stroke: '#1b1636', 'stroke-width': 1.8, 'stroke-linecap': 'round' }),
  ],
  bolt: () => [svgEl('path', { d: 'M4 -14 L-9 2 L-1.5 2 L-5 14 L9 -3.5 L1.5 -3.5 Z', fill: '#FFC400', ...outlined })],
  flower: () => {
    const petals = (radius, fill) => [0, 1, 2, 3, 4].map((i) => {
      const angle = (-90 + i * 72) * (Math.PI / 180);
      return svgEl('circle', { cx: 6.5 * Math.cos(angle), cy: 6.5 * Math.sin(angle), r: radius, fill });
    });
    return [...petals(7.2, '#fff'), ...petals(5.2, '#F48FB1'), svgEl('circle', { r: 4, fill: '#FFD54F' })];
  },
  smile: () => [
    svgEl('circle', { r: 12, fill: '#FFD54F', stroke: '#fff', 'stroke-width': 2.6 }),
    svgEl('circle', { cx: -4, cy: -3, r: 1.8, fill: '#5a4600' }),
    svgEl('circle', { cx: 4, cy: -3, r: 1.8, fill: '#5a4600' }),
    svgEl('path', { d: 'M-6 3 Q0 9.5 6 3', fill: 'none', stroke: '#5a4600', 'stroke-width': 2, 'stroke-linecap': 'round' }),
  ],
  rainbow: () => {
    const arc = (r, color, width) => svgEl('path', {
      d: `M${-r} 6 A${r} ${r} 0 0 1 ${r} 6`, fill: 'none', stroke: color, 'stroke-width': width, 'stroke-linecap': 'round',
    });
    return [arc(8, '#fff', 14), arc(11, '#E53935', 3.4), arc(7.6, '#FDD835', 3.4), arc(4.2, '#29B6F6', 3.4)];
  },
  crown: () => [
    svgEl('path', { d: 'M-12 8 L-13 -7 L-6 -1 L0 -11 L6 -1 L13 -7 L12 8 Z', fill: '#FFC928', ...outlined }),
    svgEl('circle', { cx: 0, cy: 3, r: 2.2, fill: '#E53935' }),
    svgEl('circle', { cx: -7, cy: 4, r: 1.6, fill: '#29B6F6' }),
    svgEl('circle', { cx: 7, cy: 4, r: 1.6, fill: '#43A047' }),
  ],
};

// ---------- Effects ----------

const SPARKLE = 'M0 -10 C1 -2 2 -1 10 0 C2 1 1 2 0 10 C-1 2 -2 1 -10 0 C-2 -1 -1 -2 0 -10 Z';
const SPARKLES = [[-6, 120, 1], [196, 84, 0.8], [178, 196, 1.1], [14, 244, 0.9], [206, 300, 0.75], [-8, 356, 0.8], [150, 24, 0.65], [44, 34, 0.7], [196, 396, 0.6]];

function sparkles() {
  return SPARKLES.map(([x, y, scale], i) => svgEl('g', { transform: `translate(${x} ${y}) scale(${scale})` },
    svgEl('path', { d: SPARKLE, class: 'gt__sparkle', style: `animation-delay:${(i * 0.37).toFixed(2)}s` })));
}

function glow(id) {
  return [
    svgEl('radialGradient', { id: `${id}-glow` },
      svgEl('stop', { offset: 0, 'stop-color': '#FFF7C2', 'stop-opacity': 0.85 }),
      svgEl('stop', { offset: 0.55, 'stop-color': '#FFD54F', 'stop-opacity': 0.35 }),
      svgEl('stop', { offset: 1, 'stop-color': '#FFD54F', 'stop-opacity': 0 })),
    svgEl('ellipse', { cx: 100, cy: 250, rx: 128, ry: 200, fill: `url(#${id}-glow)`, class: 'gt__glow' }),
  ];
}

const FLAMES = [[8, 90], [34, 120], [62, 104], [100, 132], [138, 104], [166, 120], [192, 90]];

function fire() {
  return FLAMES.map(([x, height], i) => {
    const w = 22;
    const outer = `M${-w} 0 C${-w - 4} ${-height * 0.4} ${-4} ${-height * 0.55} 0 ${-height} C4 ${-height * 0.55} ${w + 4} ${-height * 0.4} ${w} 0 Z`;
    return svgEl('g', { transform: `translate(${x} 402)` },
      svgEl('g', { class: 'gt__flame', style: `animation-delay:${(i * 0.21).toFixed(2)}s` },
        svgEl('path', { d: outer, fill: '#FF5722' }),
        svgEl('path', { d: outer, fill: '#FFC107', transform: 'scale(0.55 0.6)' })));
  });
}

// Tiny stars inside the "galaxy" paint.
const GALAXY_DOTS = [[46, 212, 1.4], [130, 196, 1], [72, 250, 1.8], [150, 240, 1.2], [36, 300, 1], [160, 290, 1.6],
  [54, 346, 1.2], [140, 350, 1], [100, 372, 1.5], [120, 318, 0.9], [30, 360, 1.3], [170, 334, 1.1], [84, 214, 0.9],
  [22, 280, 1], [180, 270, 1], [64, 380, 1], [146, 378, 1.3]];

// ---------- Public ----------

/** The whole guitar: { shape, color, stickers, effect } (see js/data/guitar.js). */
export function renderGuitar(guitar, { extraClass = '', label = 'Гитара' } = {}) {
  const id = `gt${++uid}`;
  const shape = SHAPES[guitar.shape] || SHAPES.classic;
  const paint = PAINTS[guitar.color] || PAINTS.wood;
  const paintFill = `url(#${id}-paint)`;

  const defs = [
    paintGradient(`${id}-paint`, paint),
    svgEl('clipPath', { id: `${id}-clip` }, svgEl('path', { d: shape.body })),
  ];
  const parts = [];

  if (guitar.effect === 'glow') parts.push(...glow(id));
  if (guitar.effect === 'fire') parts.push(...fire());

  parts.push(...headstock(paintFill, paint.edge));
  parts.push(svgEl('path', {
    d: shape.body, fill: paintFill, stroke: paint.edge, 'stroke-width': 3, 'stroke-linejoin': 'round',
  }));

  const clipped = [];
  if (paint.stars) {
    for (const [cx, cy, r] of GALAXY_DOTS) clipped.push(svgEl('circle', { cx, cy, r, class: 'gt__galaxy-dot' }));
  }
  const { cx, cy, rx, ry, rotate } = shape.glare;
  clipped.push(svgEl('ellipse', { cx, cy, rx, ry, transform: `rotate(${rotate} ${cx} ${cy})`, class: 'gt__glare' }));
  parts.push(svgEl('g', { 'clip-path': `url(#${id}-clip)` }, clipped));

  if (shape.electric) parts.push(...electricParts(shape.electric));
  parts.push(...neck(shape.neckEnd));
  if (shape.acoustic) parts.push(...acousticParts(shape.acoustic));
  parts.push(...bridgeParts(shape.bridge));

  (guitar.stickers || []).slice(0, MAX_STICKERS).forEach((sticker, i) => {
    const slot = shape.stickers[i];
    const draw = STICKERS[sticker];
    if (!slot || !draw) return;
    parts.push(svgEl('g', { transform: `translate(${slot.x} ${slot.y}) rotate(${slot.r}) scale(${slot.s || 1})` }, draw()));
  });

  parts.push(...strings(shape.bridge.y));
  if (guitar.effect === 'sparkles') parts.push(...sparkles());

  return svgEl('svg', {
    viewBox: '-24 -8 248 416',
    class: `guitar ${extraClass}`.trim(),
    role: 'img',
    'aria-label': label,
  }, svgEl('defs', null, defs), ...parts);
}

/** One sticker on its own, for workshop buttons. */
export function renderSticker(id) {
  const draw = STICKERS[id];
  return svgEl('svg', { viewBox: '-16 -16 32 32', class: 'gt-icon', 'aria-hidden': 'true' }, draw ? draw() : []);
}

/** A round paint sample, for workshop buttons. */
export function renderSwatch(colorId) {
  const id = `gt${++uid}`;
  const paint = PAINTS[colorId] || PAINTS.wood;
  const parts = [svgEl('defs', null, paintGradient(`${id}-paint`, paint)),
    svgEl('circle', { cx: 16, cy: 16, r: 13, fill: `url(#${id}-paint)`, stroke: paint.edge, 'stroke-width': 2 })];
  if (paint.stars) {
    for (const [x, y] of [[11, 10], [20, 14], [14, 21], [22, 22]]) {
      parts.push(svgEl('circle', { cx: x, cy: y, r: 1, class: 'gt__galaxy-dot' }));
    }
  }
  return svgEl('svg', { viewBox: '0 0 32 32', class: 'gt-icon', 'aria-hidden': 'true' }, parts);
}
