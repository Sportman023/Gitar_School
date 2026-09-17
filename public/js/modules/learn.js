import { el, noteStyle } from '../core/ui.js';
import { NOTES } from '../data/notes.js';
import { loadPiano, playPiano, playPianoScale } from '../core/piano.js';

export default {
  id: 'learn',
  title: 'Учим ноты',
  subtitle: 'Карточки: нота, цвет и звук',
  emoji: '🎨',
  accent: '#FF7043',
  group: 'Ноты и цвета',

  mount(root) {
    // start downloading the piano now, so the first tap isn't silent
    loadPiano();

    const cards = NOTES.map((note) => el('button', {
      class: 'note-card',
      type: 'button',
      style: noteStyle(note),
      onclick: () => playPiano(note.freq),
    },
      el('div', { class: 'note-card__name' }, note.ru),
      el('div', { class: 'note-card__latin' }, note.en),
      el('div', { class: 'note-card__color' }, note.colorName),
      el('div', { class: 'note-card__hint' }, '🔊 нажми'),
    ));

    root.append(el('div', { class: 'screen learn' },
      el('p', { class: 'lead' }, 'Нажми на карточку — услышишь, как нота звучит на фортепиано.'),
      el('div', { class: 'note-grid' }, cards),
      el('div', { class: 'row row--center' },
        el('button', {
          class: 'btn btn--primary',
          type: 'button',
          onclick: () => playPianoScale(NOTES),
        }, '▶ Сыграть всю гамму'),
      ),
      el('div', { class: 'memo' },
        el('div', { class: 'memo__title' }, 'Как запомнить порядок цветов'),
        el('div', { class: 'memo__phrase' }, 'Каждый Охотник Желает Знать Где Сидит Фазан'),
        el('div', { class: 'memo__map' },
          NOTES.map((note) => el('span', { class: 'memo__item', style: noteStyle(note) },
            el('b', null, note.colorName[0]), ' — ', note.ru))),
      ),
    ));
  },
};
