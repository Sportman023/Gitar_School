import { el, clear } from '../core/ui.js';
import { renderFretboard } from '../core/fretboard.js';
import { colorToggle } from '../core/controls.js';
import { NOTES } from '../data/notes.js';
import { store } from '../core/store.js';
import { playNote, playScale } from '../core/audio.js';

export default {
  id: 'fretboard',
  title: 'Ноты на грифе',
  subtitle: 'Первая октава: где нажимать на гитаре',
  emoji: '🎸',
  accent: '#8D6E63',
  group: 'Гриф гитары',

  mount(root) {
    const screen = el('div', { class: 'screen fret-learn' });
    root.append(screen);

    function render() {
      clear(screen);
      const colored = store.setting('coloredHeads', true);

      screen.append(
        el('p', { class: 'lead' }, 'Головка грифа слева, у струн подписаны имена. Кружок показывает, где прижать струну.'),
        colorToggle(render),
        el('div', { class: 'fret-grid' },
          NOTES.map((note) => el('button', {
            class: 'fret-card',
            type: 'button',
            onclick: () => playNote(note.freq),
          },
            renderFretboard(note, { colored, stringNames: true }),
            el('div', { class: 'fret-card__name' }, `${note.ru} первой октавы`),
            el('div', { class: 'fret-card__place' }, note.guitar),
          ))),
        el('div', { class: 'row row--center' },
          el('button', { class: 'btn btn--primary', type: 'button', onclick: () => playScale(NOTES) },
            '▶ Сыграть по порядку')),
        el('div', { class: 'memo' },
          el('div', { class: 'memo__title' }, 'Как читать гриф'),
          el('div', { class: 'memo__phrase' }, 'Струны считают от тонкой к толстой'),
          el('ul', { class: 'memo__list' },
            el('li', null, '1-я струна — самая тонкая (внизу рисунка), 6-я — самая толстая (вверху)'),
            el('li', null, 'Слева от грифа подписано имя открытой струны: 1 Ми, 2 Си, 3 Соль, 4 Ре, 5 Ля, 6 Ми'),
            el('li', null, 'Лады считают от головки грифа: 1-й, 2-й, 3-й…'),
            el('li', null, 'Кружок слева от порожка значит «играем открытую струну», ничего прижимать не надо'),
            el('li', null, 'Точка на грифе — ориентир, она стоит на 3-м ладу'),
            el('li', null, 'Все семь нот первой октавы живут рядышком: на 5-й, 4-й, 3-й и 2-й струнах в первой позиции'),
          )),
        el('div', { class: 'memo memo--note' },
          el('div', { class: 'memo__title' }, 'Для взрослых'),
          el('p', { class: 'memo__text' },
            'Гитара — транспонирующий инструмент: звучит на октаву ниже, чем записана. '
            + 'Поэтому записанная «До первой октавы» берётся на 5-й струне (3-й лад), а не на 2-й. '
            + 'Позиции на 1-й и 2-й струнах — это уже вторая октава.'),
        ),
      );
    }

    render();
  },
};
