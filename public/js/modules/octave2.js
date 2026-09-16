// "Second octave notes" section: a two-octave ladder on one staff and cards
// for C5–G5 showing where each note is on the staff and on the guitar.

import { el, clear } from '../core/ui.js';
import { renderStaff, renderStaffRow } from '../core/staff.js';
import { renderFretboard, playableMap } from '../core/fretboard.js';
import { colorToggle } from '../core/controls.js';
import { store } from '../core/store.js';
import { playNote, playScale } from '../core/audio.js';
import { NOTES_2, TWO_OCTAVES, octaveName } from '../data/notes.js';

export default {
  id: 'octave2',
  title: 'Ноты второй октавы',
  subtitle: 'До, Ре, Ми, Фа, Соль на стане и на грифе',
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
        el('p', { class: 'lead' }, 'После Си первой октавы ноты начинаются заново — это вторая октава. Нажми на нотку, чтобы её услышать.'),
        colorToggle(render),

        el('h3', { class: 'block-title' }, 'Лесенка из двух октав'),
        el('div', { class: 'staff-row' },
          playableMap(renderStaffRow(TWO_OCTAVES, { colored }), (freq) => playNote(freq, { duration: 1.4 }))),
        el('p', { class: 'caption' },
          'Ноты шагают по очереди: линейка, промежуток, линейка, промежуток… '
          + 'До второй октавы стоит сразу после Си — и звучит как До, только выше.'),
        el('div', { class: 'row row--center' },
          el('button', { class: 'btn btn--primary', type: 'button', onclick: () => playScale(TWO_OCTAVES, { step: 340 }) },
            '▶ Сыграть лесенку')),

        el('h3', { class: 'block-title' }, 'Где живёт каждая нота'),
        el('div', { class: 'octave-grid' },
          NOTES_2.map((note) => el('button', {
            class: 'octave-card',
            type: 'button',
            onclick: () => playNote(note.freq),
          },
            el('div', { class: 'octave-card__name' }, `${note.ru} ${octaveName(note)}`),
            el('div', { class: 'octave-card__pics' },
              el('div', null,
                renderStaff(note, { colored }),
                el('div', { class: 'octave-card__place' }, note.staffPlace)),
              el('div', null,
                renderFretboard(note, { colored, stringNames: true }),
                el('div', { class: 'octave-card__place' }, note.guitar))),
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
            el('li', null, 'Штиль у всех нот второй октавы смотрит вниз, как у Си'),
          )),

        el('div', { class: 'memo' },
          el('div', { class: 'memo__title' }, 'На гитаре'),
          el('div', { class: 'memo__phrase' }, 'Открытая — 1-й лад — 3-й лад'),
          el('ul', { class: 'memo__list' },
            el('li', null, 'Вторая октава живёт на самых тонких струнах: До и Ре — на 2-й, Ми, Фа и Соль — на 1-й'),
            el('li', null, 'На обеих струнах пальцы одинаковые: 2-я струна — Си, До, Ре; 1-я струна — Ми, Фа, Соль'),
            el('li', null, 'Не перепутай две Ми: Ми первой октавы — 4-я струна, 2-й лад, а Ми второй октавы — открытая 1-я струна'),
            el('li', null, 'И две До: До первой октавы — 5-я струна, 3-й лад, До второй — 2-я струна, 1-й лад'),
          )),

        el('div', { class: 'memo memo--note' },
          el('div', { class: 'memo__title' }, 'Для взрослых'),
          el('p', { class: 'memo__text' },
            'Гитара звучит на октаву ниже записанного, поэтому записанные До–Соль второй октавы '
            + 'берутся в первой позиции на 2-й и 1-й струнах. Ля и Си второй октавы — это 1-я струна, '
            + '5-й и 7-й лад, за пределами первой позиции; здесь их пока нет. '
            + 'Приложение играет ноты так, как они записаны.'),
        ),
      );
    }

    render();
  },
};
