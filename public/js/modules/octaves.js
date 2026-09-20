// "Octave ladder" section: every octave the app teaches on one long staff,
// so the child sees the seven notes go round and start again higher up.
// A new octave in js/data/notes.js shows up here by itself.

import { el, clear } from '../core/ui.js';
import { renderStaffRow, playableMap } from '../core/staff.js';
import { colorToggle } from '../core/controls.js';
import { store } from '../core/store.js';
import { loadPiano, playPiano, playPianoScale } from '../core/piano.js';
import { ALL_NOTES } from '../data/notes.js';

export default {
  id: 'octaves',
  title: 'Лесенка октав',
  subtitle: 'Все октавы на одном стане',
  emoji: '🪜',
  accent: '#F4511E',
  group: 'staff',
  kind: 'learn',

  mount(root) {
    // start downloading the piano now, so the first tap isn't silent
    loadPiano();

    const screen = el('div', { class: 'screen octaves' });
    root.append(screen);

    function render() {
      clear(screen);
      const colored = store.setting('coloredHeads', true);

      screen.append(
        el('p', { class: 'lead' },
          'Семь нот идут по кругу: До, Ре, Ми, Фа, Соль, Ля, Си — и снова До, только выше. '
          + 'Каждый такой круг — октава. Вниз ноты идут так же: перед До 1 октавы стоит Си малой.'),
        colorToggle(render),

        el('div', { class: 'staff-row' },
          playableMap(renderStaffRow(ALL_NOTES, { colored }), (freq) => playPiano(freq, { duration: 1.4 }))),
        el('p', { class: 'caption' },
          'Нажми на нотку, чтобы её услышать. Ноты шагают по очереди: линейка, промежуток, линейка… '
          + 'Си малой октавы стоит прямо перед До 1 октавы, а До 2 октавы — сразу после Си 1 октавы.'),
        el('div', { class: 'row row--center' },
          el('button', {
            class: 'btn btn--primary',
            type: 'button',
            onclick: () => playPianoScale(ALL_NOTES, { step: 0.34 }),
          }, '▶ Сыграть лесенку')),

        el('div', { class: 'memo' },
          el('div', { class: 'memo__title' }, 'Как запомнить'),
          el('div', { class: 'memo__phrase' }, 'Чем выше нота на стане, тем выше она звучит'),
          el('ul', { class: 'memo__list' },
            el('li', null, 'Малая октава живёт под станом: её ноты висят на добавочных линеечках'),
            el('li', null, '1 октава — внизу стана: от До на первой добавочной линеечке до Си на 3-й линейке'),
            el('li', null, '2 октава — наверху: её До стоит ПОСЛЕ третьей линейки между 3-й и 4-й линейками, а Ля и Си поднимаются над станом'),
            el('li', null, 'У одинаковых нот разных октав один цвет: До всегда красная. '
              + 'Какая это октава, видно только по месту на стане'),
          )),
      );
    }

    render();
  },
};
