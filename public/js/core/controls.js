import { el } from './ui.js';
import { store } from './store.js';
import { OCTAVES } from '../data/notes.js';

/**
 * The "coloured notes" toggle shared by the staff sections.
 * Colour is scaffolding: first lean on the rainbow colours the child already
 * knows, then switch it off and read plain black notes.
 */
export function colorToggle(onChange) {
  const colored = store.setting('coloredHeads', true);
  return el('div', { class: 'toggle-row' },
    el('button', {
      class: `toggle ${colored ? 'toggle--on' : ''}`,
      type: 'button',
      onclick: () => {
        store.setSetting('coloredHeads', !colored);
        onChange();
      },
    },
      el('span', { class: 'toggle__dot' }),
      el('span', null, colored ? 'Цветные нотки' : 'Чёрные нотки, как в настоящих нотах'),
    ));
}

/** Octaves picked for the staff games; all of them until the player picks. */
export function drilledOctaves() {
  const all = OCTAVES.map((item) => item.octave);
  const picked = store.setting('staffOctaves', all).filter((octave) => all.includes(octave));
  return picked.length ? picked : all;
}

/** Notes of the picked octaves, low to high. */
export function drilledNotes() {
  const picked = drilledOctaves();
  return OCTAVES.filter((item) => picked.includes(item.octave)).flatMap((item) => item.notes);
}

/**
 * Chips that pick which octaves the staff games ask about. The choice is
 * shared by the games and kept per player; the last octave that is on
 * can't be switched off.
 */
export function octaveChips(onChange) {
  const picked = drilledOctaves();
  return el('div', { class: 'chips', role: 'group', 'aria-label': 'Какие октавы тренируем' },
    el('span', { class: 'chips__label' }, 'Октавы:'),
    OCTAVES.map(({ octave, short }) => {
      const on = picked.includes(octave);
      return el('button', {
        class: `chip ${on ? 'chip--on' : ''}`,
        type: 'button',
        'aria-pressed': on ? 'true' : 'false',
        onclick: () => {
          const next = on ? picked.filter((item) => item !== octave) : [...picked, octave];
          if (!next.length) return;
          store.setSetting('staffOctaves', next);
          onChange();
        },
      }, short);
    }));
}
