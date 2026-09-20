// "First octave" section: the staff itself (lines, clef) and where each note
// of C4–B4 lives on it. The other octave sections build on this one.

import { el, clear } from '../core/ui.js';
import { renderStaff, renderStaffRow, playableMap } from '../core/staff.js';
import { NOTES, octaveName } from '../data/notes.js';
import { store } from '../core/store.js';
import { colorToggle } from '../core/controls.js';
import { loadPiano, playPiano, playPianoScale } from '../core/piano.js';

export default {
  id: 'octave1',
  title: 'Первая октава',
  subtitle: 'Нотный стан и ноты от До до Си',
  emoji: '🎼',
  accent: '#5C6BC0',
  group: 'staff',
  kind: 'learn',

  mount(root) {
    // start downloading the piano now, so the first tap isn't silent
    loadPiano();

    const screen = el('div', { class: 'screen staff-learn' });
    root.append(screen);

    function render() {
      clear(screen);
      const colored = store.setting('coloredHeads', true);

      screen.append(
        el('p', { class: 'lead' }, 'Пять линеек — это нотный стан. Нажми на нотку, чтобы её услышать.'),
        colorToggle(render),

        el('h3', { class: 'block-title' }, 'Лесенка из семи нот'),
        el('div', { class: 'staff-row' },
          playableMap(renderStaffRow(NOTES, { colored }), (freq) => playPiano(freq, { duration: 1.4 }))),
        el('p', { class: 'caption' },
          'Ноты шагают по очереди: линейка, промежуток, линейка, промежуток… '
          + 'До живёт под станом на своей добавочной линеечке, а Си добралась до третьей линейки.'),

        el('h3', { class: 'block-title' }, 'Где живёт каждая нота'),
        el('div', { class: 'staff-grid' },
          NOTES.map((note) => el('button', {
            class: 'staff-card',
            type: 'button',
            onclick: () => playPiano(note.freq),
          },
            renderStaff(note, { colored }),
            el('div', { class: 'staff-card__name' }, `${note.ru} ${octaveName(note)}`),
            el('div', { class: 'staff-card__place' }, note.staffPlace),
          ))),
        el('div', { class: 'row row--center' },
          el('button', { class: 'btn btn--primary', type: 'button', onclick: () => playPianoScale(NOTES) },
            '▶ Сыграть по порядку')),
        el('div', { class: 'memo' },
          el('div', { class: 'memo__title' }, 'Как запомнить'),
          el('div', { class: 'memo__phrase' }, 'Линейки считают снизу вверх'),
          el('ul', { class: 'memo__list' },
            el('li', null, 'На линейках сидят: Ми (1-я), Соль (2-я), Си (3-я)'),
            el('li', null, 'Между линейками прячутся: Фа и Ля'),
            el('li', null, 'Ре — под первой линейкой, а До — на первой добавочной линеечке под станом'),
            el('li', null, 'Завиток скрипичного ключа закручивается вокруг линейки ноты Соль — поэтому его и зовут «ключ Соль»'),
          )),
      );
    }

    render();
  },
};
