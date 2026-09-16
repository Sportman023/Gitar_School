// "Strings and semitones" section, using the notation from the school notebook:
// string number and name on the left, then labelled notes on the frets.
// One fret is a semitone, two frets are a tone — which shows why F comes
// right after E, while getting to G skips a fret.

import { el, clear, noteStyle } from '../core/ui.js';
import { renderFretMap, playableMap } from '../core/fretboard.js';
import { colorToggle } from '../core/controls.js';
import { store } from '../core/store.js';
import { playNote, playScale } from '../core/audio.js';
import { STRINGS, SCALE_STEPS, NOTE_BY_ID } from '../data/notes.js';

const listen = (freq) => playNote(freq, { duration: 1.4 });

/** A fretboard on a wooden board; tap notes to hear them. */
function board(options) {
  return el('div', { class: 'board' }, playableMap(renderFretMap(options), listen));
}

/** A round note for the tone ladder. */
function ladderNote(note, colored, extra = '') {
  return el('div', {
    class: `ladder__note ${colored ? 'ladder__note--color' : ''} ${extra}`.trim(),
    style: noteStyle(note),
  }, note.ru);
}

// C D E F G A B C with the number of frets between neighbours.
function ladder(colored) {
  const items = [];
  for (const step of SCALE_STEPS) {
    items.push(ladderNote(step.from, colored));
    items.push(el('div', { class: `step ${step.frets === 1 ? 'step--half' : ''}` },
      el('span', { class: 'step__name' }, step.name),
      el('span', { class: 'step__frets' }, step.frets === 1 ? '1 лад' : '2 лада')));
  }
  items.push(ladderNote(SCALE_STEPS[0].from, colored, 'ladder__note--octave'));
  return el('div', { class: 'ladder' }, items);
}

export default {
  id: 'strings',
  title: 'Струны и полутона',
  subtitle: 'Ми-Си-Соль-Ре-Ля-Ми и шаги по ладам',
  emoji: '🪕',
  accent: '#00897B',
  group: 'Гриф гитары',

  mount(root) {
    const screen = el('div', { class: 'screen strings' });
    root.append(screen);

    function render() {
      clear(screen);
      const colored = store.setting('coloredHeads', true);

      screen.append(
        el('p', { class: 'lead' }, 'Шесть струн, у каждой своё имя. Нажимай на любую нотку — она прозвучит.'),
        colorToggle(render),

        el('div', { class: 'string-strip' },
          STRINGS.map((string) => el('button', {
            class: `string-btn ${colored ? 'string-btn--color' : ''}`,
            type: 'button',
            style: noteStyle(NOTE_BY_ID[string.noteId]),
            onclick: () => listen(string.freq),
          },
            el('span', { class: 'string-btn__num' }, `${string.number}-я`),
            el('span', { class: 'string-btn__name' }, string.ru),
            el('span', { class: 'string-btn__thin' }, string.thickness),
          ))),

        el('div', { class: 'row row--center' },
          el('button', {
            class: 'btn btn--primary',
            type: 'button',
            onclick: () => playScale([...STRINGS].reverse(), { step: 700 }),
          }, '▶ Сыграть все струны')),

        el('h3', { class: 'block-title' }, 'Ноты на первых ладах'),
        board({ colored }),
        el('p', { class: 'caption' },
          'Слева номер струны и её открытая нота. Маленькая точка — лад, '
          + 'где живёт полутон без белого имени: эти ноты пройдёте позже.'),

        el('h3', { class: 'block-title' }, 'Тон и полутон'),
        el('p', { class: 'caption caption--lead' },
          'Один лад — это полутон. Два лада — тон. Смотри, как шагает гамма До мажор:'),
        ladder(colored),
        el('p', { class: 'caption' },
          'Все ноты шагают через лад, и только Ми → Фа и Си → До стоят на соседних ладах. '
          + 'Вот эти два места — полутоны.'),

        el('div', { class: 'board-pair' },
          el('div', null,
            el('div', { class: 'board-pair__title' }, '4-я струна: Ре — Ми — Фа'),
            board({ colored, strings: [4], steps: true })),
          el('div', null,
            el('div', { class: 'board-pair__title' }, '5-я струна: Ля — Си — До'),
            board({ colored, strings: [5], steps: true }))),

        el('div', { class: 'memo' },
          el('div', { class: 'memo__title' }, 'Как запомнить струны'),
          el('div', { class: 'memo__phrase' }, 'Ми — Си — Соль — Ре — Ля — Ми'),
          el('ul', { class: 'memo__list' },
            el('li', null, 'Считаем от самой тонкой: 1-я — тоненькая и звонкая, 6-я — толстая и гудящая'),
            el('li', null, 'Крайние струны обе Ми: 1-я и 6-я — одно имя, только в разных концах'),
            el('li', null, '«Открытая струна» — это когда ничего не прижимаешь'),
            el('li', null, 'Прижал на один лад ближе к себе — нота поднялась на полутон'),
            el('li', null, 'Чтобы шагнуть на тон, надо перескочить через лад'),
          )),

        el('div', { class: 'memo memo--note' },
          el('div', { class: 'memo__title' }, 'Для взрослых'),
          el('p', { class: 'memo__text' },
            'Стандартный строй: E B G D A E от тонкой к толстой (Ми Си Соль Ре Ля Ми). '
            + 'Лады между белыми нотами — диезы и бемоли, здесь они намеренно не подписаны: '
            + 'пока задача — увидеть, что полутон это один лад, а тон — два. '
            + 'Звучит приложение так, как нота записана, то есть на октаву выше живой гитары.'),
        ),
      );
    }

    render();
  },
};
