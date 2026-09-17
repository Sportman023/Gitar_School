// "Second octave notes" section: a two-octave ladder on one staff and cards
// for C5–G5 showing where each note is on the staff.

import { el, clear } from '../core/ui.js';
import { renderStaff, renderStaffRow, playableMap } from '../core/staff.js';
import { colorToggle } from '../core/controls.js';
import { store } from '../core/store.js';
import { playNote, playScale } from '../core/audio.js';
import { NOTES_2, TWO_OCTAVES, octaveName } from '../data/notes.js';

export default {
  id: 'octave2',
  title: 'Ноты второй октавы',
  subtitle: 'До, Ре, Ми, Фа, Соль на нотном стане',
  emoji: '🎶',
  accent: '#AB47BC',
  group: 'Вторая октава',

  mount(root) {
    const screen = el('div', { class: 'screen octave2' });
    root.append(screen);

    function render() {
      clear(screen);
      const colored = store.setting('coloredHeads', true);

      screen.append(
        el('p', { class: 'lead' }, 'После Си 1 октавы ноты начинаются заново — это вторая октава. Нажми на нотку, чтобы её услышать.'),
        colorToggle(render),

        el('h3', { class: 'block-title' }, 'Лесенка из двух октав'),
        el('div', { class: 'staff-row' },
          playableMap(renderStaffRow(TWO_OCTAVES, { colored }), (freq) => playNote(freq, { duration: 1.4 }))),
        el('p', { class: 'caption' },
          'Ноты шагают по очереди: линейка, промежуток, линейка, промежуток… '
          + 'До 2 октавы стоит сразу после Си — и звучит как До, только выше.'),
        el('div', { class: 'row row--center' },
          el('button', { class: 'btn btn--primary', type: 'button', onclick: () => playScale(TWO_OCTAVES, { step: 340 }) },
            '▶ Сыграть лесенку')),

        el('h3', { class: 'block-title' }, 'Где живёт каждая нота'),
        el('div', { class: 'staff-grid' },
          NOTES_2.map((note) => el('button', {
            class: 'staff-card',
            type: 'button',
            onclick: () => playNote(note.freq),
          },
            renderStaff(note, { colored }),
            el('div', { class: 'staff-card__name' }, `${note.ru} ${octaveName(note)}`),
            el('div', { class: 'staff-card__place' }, note.staffPlace),
          ))),
        el('div', { class: 'row row--center' },
          el('button', { class: 'btn btn--primary', type: 'button', onclick: () => playScale(NOTES_2) },
            '▶ Сыграть по порядку')),

        el('div', { class: 'memo' },
          el('div', { class: 'memo__title' }, 'Как запомнить'),
          el('div', { class: 'memo__phrase' }, 'Вторая октава живёт наверху стана'),
          el('ul', { class: 'memo__list' },
            el('li', null, 'До — в промежутке между 3-й и 4-й линейками, Ре — на 4-й линейке'),
            el('li', null, 'Ми — в верхнем промежутке, Фа — на 5-й, самой верхней линейке'),
            el('li', null, 'Соль сидит сверху на стане, над 5-й линейкой'),
            el('li', null, 'Штиль у всех нот 2 октавы смотрит вниз, как у Си'),
          )),
      );
    }

    render();
  },
};
