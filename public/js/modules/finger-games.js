// Games of the "Fingers" topic: from a finger to its mark in the music, and
// back. The chips above the question pick the hands. With both hands the
// options always include the same finger of the other hand (1 next to i),
// so the child has to remember that the left hand is numbers and the right
// one is letters, not just which finger is which.

import { createQuiz, pickWithTwin } from '../core/quiz.js';
import { handChips, drilledFingers } from '../core/controls.js';
import { renderHand } from '../core/hand.js';
import { el } from '../core/ui.js';
import { HANDS, HAND_BY_SIDE, fingerTitle } from '../data/fingers.js';

const GROUP = 'hands';

const upper = (text) => text[0].toUpperCase() + text.slice(1);

// A finger lights up on the hand, the answer is its number or letter.
// The hand is named under the picture: the drawings of the two hands are
// mirror images, and telling them apart is not what this game is about.
export const fingerToMark = createQuiz({
  id: 'finger-to-mark',
  title: 'Какой это палец?',
  subtitle: 'Палец на руке → цифра или буква',
  emoji: '🤔',
  accent: '#0097A7',
  group: GROUP,
  notes: drilledFingers,
  pickOthers: pickWithTwin('finger'),
  optionsClass: 'options options--marks',
  renderControls: ({ restart }) => handChips(restart),
  renderPrompt: (item) => el('div', { class: 'prompt' },
    el('div', { class: 'prompt__label' }, 'Как в нотах обозначают этот палец?'),
    el('div', { class: 'prompt__paper prompt__paper--hand' },
      renderHand(item.side, { active: item.finger, label: `${HAND_BY_SIDE[item.side].name} рука` })),
    el('div', { class: 'prompt__hand' }, `${HAND_BY_SIDE[item.side].name} рука`),
  ),
  renderOption: (item) => el('span', { class: 'option__mark' }, item.mark),
  explainAnswer: (item) => `${upper(fingerTitle(item))} — ${item.mark}`,
});

// The reverse: given a mark, tap the finger on the picked hands. Nothing on
// the pictures says which hand the mark belongs to — that's the point. The
// left thumb and the right little finger can be tapped too, and are wrong
// for every mark.
export const markToFinger = createQuiz({
  id: 'mark-to-finger',
  title: 'Покажи палец',
  subtitle: 'Цифра или буква → палец на руке',
  emoji: '👆',
  accent: '#AB47BC',
  group: GROUP,
  notes: drilledFingers,
  renderControls: ({ restart }) => handChips(restart),
  renderPrompt: (item) => el('div', { class: 'prompt' },
    el('div', { class: 'prompt__label' }, 'Какой палец так обозначают?'),
    el('div', { class: 'prompt__big' }, item.mark),
    el('div', { class: 'prompt__label' }, 'Нажми на него на картинке'),
  ),
  renderBoard: (item, fingers, pick) => {
    const sides = new Set(fingers.map((finger) => finger.side));
    return el('div', { class: 'hands-board' },
      HANDS.filter((hand) => sides.has(hand.side)).map((hand) => el('div', { class: 'hands-board__hand' },
        renderHand(hand.side, { onPick: pick, label: `${hand.name} рука` }),
        el('div', { class: 'hands-board__name' }, hand.name))));
  },
  explainAnswer: (item) => `${item.mark} — ${fingerTitle(item)}`,
});
