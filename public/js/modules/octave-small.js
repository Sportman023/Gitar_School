// "Small octave" section: the notes below the staff, E3-B3, on the ledger
// lines under it. A ladder of the five notes and a card for each one.
// How it runs into the first octave is shown in the octave ladder.

import { el, clear } from '../core/ui.js';
import { renderStaff, renderStaffRow, playableMap, staffBox } from '../core/staff.js';
import { colorToggle } from '../core/controls.js';
import { store } from '../core/store.js';
import { loadPiano, playPiano, playPianoScale } from '../core/piano.js';
import { NOTES_0, octaveName } from '../data/notes.js';

export default {
  id: 'octave-small',
  title: 'Малая октава',
  subtitle: 'Ми, Фа, Соль, Ля, Си под нотным станом',
  emoji: '⬇️',
  accent: '#26A69A',
  group: 'staff',
  kind: 'learn',

  mount(root) {
    // start downloading the piano now, so the first tap isn't silent
    loadPiano();

    const screen = el('div', { class: 'screen octave-small' });
    root.append(screen);

    // one box for every picture here, so the low notes fit under the staff
    const box = staffBox(NOTES_0);

    function render() {
      clear(screen);
      const colored = store.setting('coloredHeads', true);

      screen.append(
        el('p', { class: 'lead' },
          'Ниже До 1 октавы ноты не заканчиваются — там живёт малая октава. '
          + 'Места на стане ей не хватает, поэтому её ноты сидят на добавочных линеечках под станом. '
          + 'Нажми на нотку, чтобы её услышать.'),
        colorToggle(render),

        el('h3', { class: 'block-title' }, 'Лесенка из пяти нот'),
        el('div', { class: 'staff-row' },
          playableMap(renderStaffRow(NOTES_0, { colored }), (freq) => playPiano(freq, { duration: 1.4 }))),
        el('p', { class: 'caption' },
          'Ноты шагают по очереди: линеечка, промежуток, линеечка… '
          + 'Ми спустилось ниже всех, а сразу за Си малой октавы начинается До 1 октавы.'),

        el('h3', { class: 'block-title' }, 'Где живёт каждая нота'),
        // top down, Си first: the cards start at the note closest to the staff
        // and walk down the ledger lines, the way the child reads them
        el('div', { class: 'staff-grid' },
          [...NOTES_0].reverse().map((note) => el('button', {
            class: 'staff-card',
            type: 'button',
            onclick: () => playPiano(note.freq),
          },
            renderStaff(note, { colored, box }),
            el('div', { class: 'staff-card__name' }, `${note.ru} ${octaveName(note)}`),
            el('div', { class: 'staff-card__place' }, note.staffPlace),
          ))),
        el('div', { class: 'row row--center' },
          el('button', { class: 'btn btn--primary', type: 'button', onclick: () => playPianoScale(NOTES_0) },
            '▶ Сыграть по порядку'),
          el('a', { class: 'btn', href: '#octaves' }, '🪜 Лесенка октав')),

        el('div', { class: 'memo' },
          el('div', { class: 'memo__title' }, 'Как запомнить'),
          el('div', { class: 'memo__phrase' }, 'Малая октава живёт под станом, на добавочных линеечках'),
          el('ul', { class: 'memo__list' },
            el('li', null, 'Это октава особенна тем, что все нотики мы считаем ⬇️ спускаясь от нотки До на верхней линеечке.'),
            el('li', null, 'И как по лесенке идём вниз к нужной нам нотке, просчитывая их в обратном порядке: До, Си, Ля, Соль, Фа, Ми.'),
          )),
      );
    }

    render();
  },
};
