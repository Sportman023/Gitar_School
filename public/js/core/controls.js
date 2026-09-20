import { el } from './ui.js';
import { store } from './store.js';
import { OCTAVES } from '../data/notes.js';
import { HANDS, FINGERS } from '../data/fingers.js';

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

/** What the player picked under `setting` out of `all`; everything until they pick. */
function picked(setting, all) {
  const chosen = store.setting(setting, all).filter((value) => all.includes(value));
  return chosen.length ? chosen : all;
}

/**
 * Chips that pick what a game asks about. The choice is shared by the games
 * that use the same `setting` and kept per player; the last chip that is on
 * can't be switched off.
 */
function choiceChips({ label, title, setting, choices, onChange }) {
  const on = picked(setting, choices.map((choice) => choice.value));
  return el('div', { class: 'chips', role: 'group', 'aria-label': title },
    el('span', { class: 'chips__label' }, label),
    choices.map(({ value, text }) => {
      const isOn = on.includes(value);
      return el('button', {
        class: `chip ${isOn ? 'chip--on' : ''}`,
        type: 'button',
        'aria-pressed': isOn ? 'true' : 'false',
        onclick: () => {
          const next = isOn ? on.filter((item) => item !== value) : [...on, value];
          if (!next.length) return;
          store.setSetting(setting, next);
          onChange();
        },
      }, text);
    }));
}

/** Octaves picked for the staff games; all of them until the player picks. */
export function drilledOctaves() {
  return picked('staffOctaves', OCTAVES.map((item) => item.octave));
}

/** Notes of the picked octaves, low to high. */
export function drilledNotes() {
  const picked = drilledOctaves();
  return OCTAVES.filter((item) => picked.includes(item.octave)).flatMap((item) => item.notes);
}

/** Chips that pick which octaves the staff games ask about. */
export function octaveChips(onChange) {
  return choiceChips({
    label: 'Октавы:',
    title: 'Какие октавы тренируем',
    setting: 'staffOctaves',
    choices: OCTAVES.map(({ octave, short }) => ({ value: octave, text: short })),
    onChange,
  });
}

/** Hands picked for the finger games, 'left' and/or 'right'. */
export function drilledHands() {
  return picked('fingerHands', HANDS.map((hand) => hand.side));
}

/** Fingers of the picked hands. */
export function drilledFingers() {
  const sides = drilledHands();
  return FINGERS.filter((finger) => sides.includes(finger.side));
}

/** Chips that pick which hands the finger games ask about. */
export function handChips(onChange) {
  return choiceChips({
    label: 'Руки:',
    title: 'Какие руки тренируем',
    setting: 'fingerHands',
    choices: HANDS.map(({ side, name }) => ({ value: side, text: name })),
    onChange,
  });
}
