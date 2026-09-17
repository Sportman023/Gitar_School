import { el } from './ui.js';
import { store } from './store.js';

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
