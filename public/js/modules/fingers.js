// "Fingers" section: numbers 1-4 for the left hand, the letters p, i, m, a
// for the right one. A reference screen — cards and hints, no game.

import { el } from '../core/ui.js';
import { renderHand } from '../core/hand.js';
import { FINGERS, fingerTitle } from '../data/fingers.js';

const ACCENT = '#00ACC1';

const LEFT = FINGERS.filter((finger) => finger.side === 'left');
const RIGHT = FINGERS.filter((finger) => finger.side === 'right');

const allLabels = (fingers) => Object.fromEntries(fingers.map((finger) => [finger.finger, finger.mark]));

/** One card per finger: the hand with that finger lit up, plus its mark and name. */
function fingerCards(fingers) {
  return el('div', { class: 'finger-grid' },
    fingers.map((finger) => el('div', { class: 'finger-card' },
      renderHand(finger.side, { active: finger.finger, label: fingerTitle(finger) }),
      el('div', { class: 'finger-card__mark' }, finger.mark),
      el('div', { class: 'finger-card__name' }, finger.name),
      finger.from ? el('div', { class: 'finger-card__from' }, `от испанского ${finger.from}`) : null,
    )));
}

export default {
  id: 'fingers',
  title: 'Пальцы 1–4 и pima',
  subtitle: 'Левая рука — цифры, правая — буквы p, i, m, a',
  emoji: '🖐️',
  accent: ACCENT,
  group: 'hands',
  kind: 'learn',

  mount(root) {
    root.append(el('div', { class: 'screen fingers', style: `--accent:${ACCENT}` },
      el('p', { class: 'lead' }, 'У каждого пальца своё имя. Левой рукой прижимаем струны, правой — играем.'),

      el('h3', { class: 'block-title' }, 'Левая рука — цифры'),
      el('div', { class: 'hand-stage' },
        renderHand('left', { labels: allLabels(LEFT), label: 'Левая рука: пальцы 1, 2, 3, 4' })),
      el('p', { class: 'caption' },
        'Считаем от указательного: 1, 2, 3, 4. У большого пальца номера нет — '
        + 'он держит шейку гитары сзади.'),
      fingerCards(LEFT),

      el('h3', { class: 'block-title' }, 'Правая рука — буквы'),
      el('div', { class: 'hand-stage' },
        renderHand('right', { labels: allLabels(RIGHT), label: 'Правая рука: пальцы p, i, m, a' })),
      el('p', { class: 'caption' },
        'p, i, m, a — первые буквы испанских названий пальцев. '
        + 'У мизинца обозначение e, но он обычно не играет.'),
      fingerCards(RIGHT),

      el('div', { class: 'memo' },
        el('div', { class: 'memo__title' }, 'Как запомнить'),
        el('div', { class: 'memo__phrase' }, 'Левая — цифры, правая — буквы'),
        el('ul', { class: 'memo__list' },
          el('li', null, 'Левая рука: 1 — указательный, 2 — средний, 3 — безымянный, 4 — мизинец'),
          el('li', null, 'Правая рука: p — большой, i — указательный, m — средний, a — безымянный, e — мизинец'),
          el('li', null, 'Большой палец правой руки играет толстые струны, а i, m, a — три тонкие'),
          el('li', null, 'В нотах цифра рядом с нотой — это палец левой руки, а буква — правой'),
        )),
    ));
  },
};
