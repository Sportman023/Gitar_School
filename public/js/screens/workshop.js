// Guitar workshop: the player decorates their guitar with what their stars
// have unlocked. Locked items stay visible with their price in stars, so there
// is always something to look forward to.

import { el, clear, mount } from '../core/ui.js';
import { store } from '../core/store.js';
import { renderGuitar, renderSticker, renderSwatch } from '../core/guitar.js';
import { playNote } from '../core/audio.js';
import { KINDS, ITEMS, MAX_STICKERS, itemsOfKind, isUnlocked } from '../data/guitar.js';

const EFFECT_ICONS = { none: '🚫', sparkles: '✨', glow: '🌟', fire: '🔥' };

// C major, strummed from the lowest string up
const CHORD = [130.81, 164.81, 196.0, 261.63, 329.63, 392.0];

export function strum() {
  CHORD.forEach((freq, i) => setTimeout(() => playNote(freq, { duration: 2.2, volume: 0.45 }), i * 55));
}

/** Small picture of an item for buttons: a guitar shape, a paint, a sticker or an effect. */
export function itemPreview(item, guitar) {
  switch (item.kind) {
    case 'shape':
      return renderGuitar({ ...guitar, shape: item.id, stickers: [], effect: 'none' }, { extraClass: 'guitar--mini' });
    case 'color':
      return renderSwatch(item.id);
    case 'sticker':
      return renderSticker(item.id);
    default:
      return el('span', { class: 'part__emoji' }, EFFECT_ICONS[item.id] || '✨');
  }
}

/** Item title with its kind, e.g. a sticker called "Flower". */
export function itemTitle(item) {
  const label = KINDS.find((kind) => kind.id === item.kind).label;
  return `${label[0].toUpperCase()}${label.slice(1)} «${item.name}»`;
}

const isNew = (item, state) => item.need > state.workshopSeen && isUnlocked(item, state.stars);

export default {
  id: 'guitar',
  title: 'Моя гитара',

  mount(root) {
    const screen = el('div', { class: 'screen workshop' });
    root.append(screen);

    // open the first tab that has something new, otherwise the first one
    let tab = (KINDS.find((kind) => itemsOfKind(kind.id).some((item) => isNew(item, store.state))) || KINDS[0]).id;
    let hint = '';

    const stage = el('div', { class: 'workshop__stage' });
    const tabs = el('div', { class: 'workshop__tabs', role: 'tablist' });
    const hintEl = el('p', { class: 'workshop__hint' });
    const grid = el('div', { class: 'workshop__grid' });

    function renderStage() {
      const { guitar, stars } = store.state;
      const open = ITEMS.filter((item) => isUnlocked(item, stars)).length;
      clear(stage);
      mount(stage,
        el('div', { class: 'workshop__guitar' }, renderGuitar(guitar, { label: 'Моя гитара' })),
        el('div', { class: 'workshop__stats' }, `⭐ ${stars} · открыто ${open} из ${ITEMS.length}`),
        el('button', { class: 'btn btn--primary', type: 'button', onclick: strum }, '🎵 Сыграть'),
      );
    }

    function renderTabs() {
      clear(tabs);
      mount(tabs, KINDS.map((kind) => el('button', {
        class: `workshop__tab ${kind.id === tab ? 'workshop__tab--on' : ''}`,
        type: 'button',
        role: 'tab',
        'aria-selected': String(kind.id === tab),
        onclick: () => {
          tab = kind.id;
          hint = '';
          renderAll();
        },
      },
        el('span', null, kind.emoji),
        el('span', null, kind.title),
        itemsOfKind(kind.id).some((item) => isNew(item, store.state)) ? el('span', { class: 'workshop__dot' }) : null,
      )));
    }

    function renderGrid() {
      const state = store.state;
      const { guitar, stars } = state;
      clear(grid);

      hintEl.textContent = hint || (tab === 'sticker' ? `Можно наклеить до ${MAX_STICKERS} наклеек сразу` : ' ');

      mount(grid, itemsOfKind(tab).map((item) => {
        const unlocked = isUnlocked(item, stars);
        const selected = item.kind === 'sticker' ? guitar.stickers.includes(item.id) : guitar[item.kind] === item.id;
        return el('button', {
          class: [
            'part',
            unlocked ? '' : 'part--locked',
            selected ? 'part--on' : '',
            isNew(item, state) ? 'part--new' : '',
          ].join(' ').trim(),
          type: 'button',
          'aria-pressed': String(selected),
          onclick: (event) => choose(item, event.currentTarget),
        },
          el('div', { class: 'part__preview' }, itemPreview(item, guitar)),
          el('div', { class: 'part__name' }, item.name),
          unlocked ? null : el('div', { class: 'part__lock' }, `🔒 ${item.need} ⭐`),
        );
      }));
    }

    function renderAll() {
      renderStage();
      renderTabs();
      renderGrid();
    }

    function choose(item, button) {
      const { guitar, stars } = store.state;

      if (!isUnlocked(item, stars)) {
        hint = `Ещё ${item.need - stars} ⭐ — и «${item.name}» откроется!`;
        hintEl.textContent = hint;
        button.classList.remove('part--shake');
        void button.offsetWidth; // restart the animation
        button.classList.add('part--shake');
        return;
      }

      hint = '';
      if (item.kind === 'sticker') {
        let stickers = guitar.stickers.includes(item.id)
          ? guitar.stickers.filter((id) => id !== item.id)
          : [...guitar.stickers, item.id];
        // too many: the oldest sticker makes room for the new one
        if (stickers.length > MAX_STICKERS) stickers = stickers.slice(-MAX_STICKERS);
        store.setGuitar({ stickers });
      } else {
        store.setGuitar({ [item.kind]: item.id });
      }
      renderStage();
      renderGrid();
    }

    mount(screen,
      stage,
      el('div', { class: 'workshop__panel' }, tabs, hintEl, grid),
    );
    renderAll();

    // "new" badges stay for the whole visit and disappear next time
    return () => store.markWorkshopSeen();
  },
};
