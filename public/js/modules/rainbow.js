import { el, clear, shuffle, noteStyle } from '../core/ui.js';
import { NOTES } from '../data/notes.js';
import { store } from '../core/store.js';
import { playFail, playFanfare } from '../core/audio.js';
import { loadPiano, playPiano } from '../core/piano.js';

export default {
  id: 'rainbow',
  title: 'Собери радугу',
  subtitle: 'Расставь ноты по порядку',
  emoji: '🌈',
  accent: '#26A69A',
  group: 'Ноты и цвета',

  mount(root) {
    // start downloading the piano now, so the first tap isn't silent
    loadPiano();

    const screen = el('div', { class: 'screen rainbow', style: '--accent:#26A69A' });
    root.append(screen);

    let placed = [];
    let pool = shuffle(NOTES);
    let mistakes = 0;

    function render() {
      clear(screen);

      const slots = NOTES.map((note, i) => {
        const done = i < placed.length;
        const filled = done ? placed[i] : null;
        return el('div', {
          class: `slot ${done ? 'slot--filled' : ''} ${i === placed.length ? 'slot--next' : ''}`,
          style: filled ? noteStyle(filled) : '',
        }, filled ? filled.ru : String(i + 1));
      });

      const chips = pool.map((note) => el('button', {
        class: 'chip',
        type: 'button',
        style: noteStyle(note),
        onclick: (event) => pick(note, event.currentTarget),
      }, note.ru));

      screen.append(
        el('p', { class: 'lead' }, `Нажимай ноты по порядку — от До до Си. Ошибок: ${mistakes}`),
        el('div', { class: 'slots' }, slots),
        placed.length === NOTES.length
          ? el('div', { class: 'result' },
            el('div', { class: 'result__emoji' }, mistakes === 0 ? '🏆' : '🌈'),
            el('div', { class: 'result__score' }, mistakes === 0 ? 'Без единой ошибки!' : `Готово! Ошибок: ${mistakes}`),
            el('div', { class: 'row' },
              el('button', { class: 'btn btn--primary', type: 'button', onclick: restart }, 'Ещё раз'),
              el('a', { class: 'btn', href: '#' }, 'В меню'),
            ))
          : el('div', { class: 'chips' }, chips),
      );
    }

    function pick(note, button) {
      const expected = NOTES[placed.length];
      if (note.id !== expected.id) {
        mistakes += 1;
        playFail();
        button.classList.add('chip--shake');
        setTimeout(() => button.classList.remove('chip--shake'), 400);
        store.recordAnswer(expected.id, false);
        return;
      }

      playPiano(note.freq);
      store.recordAnswer(note.id, true);
      placed = [...placed, note];
      pool = pool.filter((item) => item.id !== note.id);

      if (placed.length === NOTES.length) {
        playFanfare();
        store.finishRound('rainbow', { score: Math.max(1, NOTES.length - mistakes), total: NOTES.length });
      }
      render();
    }

    function restart() {
      placed = [];
      pool = shuffle(NOTES);
      mistakes = 0;
      render();
    }

    render();
  },
};
