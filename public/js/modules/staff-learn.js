import { el, clear } from '../core/ui.js';
import { renderStaff } from '../core/staff.js';
import { NOTES, octaveName } from '../data/notes.js';
import { store } from '../core/store.js';
import { colorToggle } from '../core/controls.js';
import { playNote, playScale } from '../core/audio.js';

export default {
  id: 'staff',
  title: 'Ноты на стане',
  subtitle: 'Первая октава: где живёт каждая нота',
  emoji: '🎼',
  accent: '#5C6BC0',
  group: 'Нотный стан',

  mount(root) {
    const screen = el('div', { class: 'screen staff-learn' });
    root.append(screen);

    function render() {
      clear(screen);
      const colored = store.setting('coloredHeads', true);

      screen.append(
        el('p', { class: 'lead' }, 'Пять линеек — это нотный стан. Нажми на нотку, чтобы её услышать.'),
        colorToggle(render),
        el('div', { class: 'staff-grid' },
          NOTES.map((note) => el('button', {
            class: 'staff-card',
            type: 'button',
            onclick: () => playNote(note.freq),
          },
            renderStaff(note, { colored }),
            el('div', { class: 'staff-card__name' }, `${note.ru} ${octaveName(note)}`),
            el('div', { class: 'staff-card__place' }, note.staffPlace),
          ))),
        el('div', { class: 'row row--center' },
          el('button', { class: 'btn btn--primary', type: 'button', onclick: () => playScale(NOTES) },
            '▶ Сыграть по порядку')),
        el('div', { class: 'memo' },
          el('div', { class: 'memo__title' }, 'Как запомнить'),
          el('div', { class: 'memo__phrase' }, 'Линейки считают снизу вверх'),
          el('ul', { class: 'memo__list' },
            el('li', null, 'На линейках сидят: Ми (1-я), Соль (2-я), Си (3-я)'),
            el('li', null, 'Между линейками прячутся: Фа и Ля'),
            el('li', null, 'Ре — под первой линейкой, а До — на своей отдельной добавочной линеечке'),
            el('li', null, 'Завиток скрипичного ключа закручивается вокруг линейки ноты Соль — поэтому его и зовут «ключ Соль»'),
          )),
      );
    }

    render();
  },
};
