import { MODULES } from './modules/index.js';
import { store } from './core/store.js';
import { el, clear, noteStyle, mount } from './core/ui.js';
import { NOTES } from './data/notes.js';
import { ITEMS, nextUnlock, isUnlocked } from './data/guitar.js';
import { ensureAudio, playFanfare } from './core/audio.js';
import { renderGuitar } from './core/guitar.js';
import { mountPlayers } from './screens/players.js';
import workshop, { itemPreview, itemTitle } from './screens/workshop.js';

const appEl = document.getElementById('app');
const titleEl = document.getElementById('title');
const backBtn = document.getElementById('backBtn');
const starEl = document.getElementById('starCounter');
const playerBtn = document.getElementById('playerBtn');

// Screens that are reachable by address but are not menu sections.
const SCREENS = [workshop];

let cleanup = null;

store.subscribe((state) => {
  const player = store.player;
  starEl.hidden = !player;
  playerBtn.hidden = !player;
  starEl.textContent = `⭐ ${state.stars || 0}`;
  if (player) {
    clear(playerBtn);
    mount(playerBtn,
      el('span', { class: 'topbar__avatar' }, player.avatar),
      el('span', { class: 'topbar__name' }, player.name));
  }
});

function renderRainbowStrip() {
  return el('div', { class: 'rainbow-strip' },
    NOTES.map((note) => el('div', { class: 'rainbow-strip__item', style: noteStyle(note) }, note.ru)));
}

function bestLabel(module) {
  const best = store.moduleBest(module.id);
  if (!best || !best.rounds) return 'Ещё не играли';
  return `Лучший результат: ${best.best}${best.total ? ` из ${best.total}` : ''}`;
}

/** "My guitar" card on the home screen: the guitar and how far the next unlock is. */
function renderGuitarCard() {
  const { guitar, stars, workshopSeen } = store.state;
  const next = nextUnlock(stars);
  const hasNew = ITEMS.some((item) => item.need > workshopSeen && isUnlocked(item, stars));

  let progress;
  if (next) {
    const prev = Math.max(0, ...ITEMS.filter((item) => item.need <= stars).map((item) => item.need));
    const share = Math.round(((stars - prev) / (next.need - prev)) * 100);
    progress = el('div', { class: 'guitar-card__next' },
      el('div', { class: 'guitar-card__next-row' },
        el('div', { class: 'guitar-card__next-icon' }, itemPreview(next, guitar)),
        el('div', null,
          el('div', { class: 'guitar-card__next-text' }, `Ещё ${next.need - stars} ⭐ — и откроется`),
          el('div', { class: 'guitar-card__next-name' }, itemTitle(next)))),
      el('div', { class: 'bar' }, el('div', { class: 'bar__fill', style: `width:${share}%` })));
  } else {
    progress = el('div', { class: 'guitar-card__next-text' }, 'Открыто всё! Ты — рок-звезда 🤘');
  }

  return el('a', { class: 'guitar-card', href: '#guitar' },
    el('div', { class: 'guitar-card__stage' }, renderGuitar(guitar, { label: 'Моя гитара' })),
    el('div', { class: 'guitar-card__body' },
      el('div', { class: 'guitar-card__title' },
        'Моя гитара',
        hasNew ? el('span', { class: 'badge' }, 'Новое!') : null),
      progress,
      el('div', { class: 'guitar-card__cta' }, 'Украсить гитару →')));
}

function renderHome() {
  titleEl.textContent = 'Гитарная школа';
  backBtn.hidden = true;

  // sections are grouped by topic — there are many of them already
  const groups = [];
  for (const module of MODULES) {
    const name = module.group || 'Разное';
    let group = groups.find((g) => g.name === name);
    if (!group) groups.push((group = { name, items: [] }));
    group.items.push(module);
  }

  const player = store.player;

  mount(appEl,
    el('p', { class: 'hello' }, `Привет, ${player.name}! Выбери, чем сегодня займёмся 🎸`),
    renderGuitarCard(),
    renderRainbowStrip(),
    groups.map((group) => el('section', { class: 'group' },
      el('h2', { class: 'group__title' }, group.name),
      el('div', { class: 'menu' },
        group.items.map((module) => el('a', {
          class: 'menu-card',
          href: `#${module.id}`,
          style: `--accent:${module.accent}`,
        },
          el('div', { class: 'menu-card__emoji' }, module.emoji),
          el('div', { class: 'menu-card__text' },
            el('div', { class: 'menu-card__title' }, module.title),
            el('div', { class: 'menu-card__sub' }, module.subtitle),
            el('div', { class: 'menu-card__best' }, bestLabel(module))),
        ))))),
    el('button', {
      class: 'link-btn',
      type: 'button',
      onclick: () => {
        if (confirm(`Обнулить звёзды, результаты и гитару игрока «${player.name}»?`)) {
          store.reset();
          navigate();
        }
      },
    }, 'Сбросить прогресс'),
  );
}

function renderPlayers() {
  titleEl.textContent = 'Гитарная школа';
  backBtn.hidden = true;
  mountPlayers(appEl, { onPick: goHome });
}

function goHome() {
  if (location.hash) location.hash = '';
  else navigate();
}

function navigate() {
  if (cleanup) {
    cleanup();
    cleanup = null;
  }
  clear(appEl);
  window.scrollTo(0, 0);

  if (!store.player) return renderPlayers();

  const id = location.hash.replace(/^#/, '');
  const screen = MODULES.find((m) => m.id === id) || SCREENS.find((s) => s.id === id);

  if (!screen) return renderHome();

  titleEl.textContent = screen.title;
  backBtn.hidden = false;
  cleanup = screen.mount(appEl) || null;
}

// ---------- Celebrating unlocks ----------

function showUnlock(items) {
  const { guitar } = store.state;

  function close() {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
  }
  function onKey(event) {
    if (event.key === 'Escape') close();
  }

  const overlay = el('div', {
    class: 'overlay',
    onclick: (event) => {
      if (event.target === overlay) close();
    },
  },
    el('div', { class: 'unlock', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Открылось новое для гитары' },
      el('div', { class: 'unlock__emoji' }, '🎁'),
      el('div', { class: 'unlock__title' }, 'Открылось новое для гитары!'),
      el('div', { class: 'unlock__items' },
        items.map((item) => el('div', { class: 'unlock__item' },
          el('div', { class: 'unlock__preview' }, itemPreview(item, guitar)),
          el('div', { class: 'unlock__name' }, itemTitle(item))))),
      el('div', { class: 'row row--center' },
        el('button', {
          class: 'btn btn--primary',
          type: 'button',
          onclick: () => {
            close();
            location.hash = 'guitar';
          },
        }, 'Украсить гитару'),
        el('button', { class: 'btn', type: 'button', onclick: close }, 'Потом'))));

  document.addEventListener('keydown', onKey);
  document.body.append(overlay);
  playFanfare();
}

// let the round result and its sound play first, then celebrate
store.onUnlock((items) => setTimeout(() => showUnlock(items), 1100));

// ---------- Start ----------

backBtn.addEventListener('click', () => {
  location.hash = '';
});

playerBtn.addEventListener('click', () => {
  store.signOut();
  goHome();
});

window.addEventListener('hashchange', navigate);

// Browsers only allow sound after the first touch of the screen.
document.addEventListener('pointerdown', () => ensureAudio(), { once: true });

navigate();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* not critical */ });
}
