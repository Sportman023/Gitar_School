import { el, clear, noteStyle } from '../core/ui.js';
import { NOTES } from '../data/notes.js';
import { store } from '../core/store.js';
import { playNote, playScale } from '../core/audio.js';

export default {
  id: 'learn',
  title: 'Учим ноты',
  subtitle: 'Карточки: нота, цвет и звук',
  emoji: '🎨',
  accent: '#FF7043',
  group: 'Ноты и цвета',

  mount(root) {
    const screen = el('div', { class: 'screen learn' });
    root.append(screen);

    let openId = null;

    function render() {
      clear(screen);

      const cards = NOTES.map((note) => {
        const accuracy = store.noteAccuracy(note.id);
        const isOpen = openId === note.id;

        return el('button', {
          class: `note-card ${isOpen ? 'note-card--open' : ''}`,
          type: 'button',
          style: noteStyle(note),
          onclick: () => {
            playNote(note.freq);
            openId = isOpen ? null : note.id;
            render();
          },
        },
          el('div', { class: 'note-card__name' }, note.ru),
          el('div', { class: 'note-card__latin' }, note.en),
          el('div', { class: 'note-card__color' }, note.colorName),
          isOpen ? el('div', { class: 'note-card__details' },
            el('div', null, `🎸 ${note.guitar}`),
            accuracy !== null ? el('div', null, `✅ правильных ответов: ${accuracy}%`) : el('div', null, 'Ещё не проверяли'),
          ) : null,
          el('div', { class: 'note-card__hint' }, isOpen ? '' : '🔊 нажми'),
        );
      });

      screen.append(
        el('p', { class: 'lead' }, 'Нажми на карточку — услышишь ноту и увидишь подсказку.'),
        el('div', { class: 'note-grid' }, cards),
        el('div', { class: 'row row--center' },
          el('button', {
            class: 'btn btn--primary',
            type: 'button',
            onclick: () => playScale(NOTES),
          }, '▶ Сыграть всю гамму'),
        ),
        el('div', { class: 'memo' },
          el('div', { class: 'memo__title' }, 'Как запомнить порядок цветов'),
          el('div', { class: 'memo__phrase' }, 'Каждый Охотник Желает Знать Где Сидит Фазан'),
          el('div', { class: 'memo__map' },
            NOTES.map((note) => el('span', { class: 'memo__item', style: noteStyle(note) },
              el('b', null, note.colorName[0]), ' — ', note.ru))),
        ),
      );
    }

    render();
  },
};
