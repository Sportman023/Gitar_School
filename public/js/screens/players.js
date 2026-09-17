// "Who is playing?" screen: pick a player, add a new one or edit an existing one.
// Each player card shows that player's own guitar, so children recognise
// their profile even before they can read the name.

import { el, clear, mount } from '../core/ui.js';
import { store } from '../core/store.js';
import { renderGuitar } from '../core/guitar.js';

const AVATARS = ['🦊', '🐱', '🐶', '🐰', '🐼', '🦄', '🐸', '🐯', '🐨', '🦉', '🐬', '🐝', '🐞', '🐧', '🦁', '🐹'];
const MAX_NAME = 16;

/**
 * Shows the players screen inside root.
 * onPick() is called after a player has been selected (or created).
 */
export function mountPlayers(root, { onPick }) {
  const screen = el('div', { class: 'screen players' });
  root.append(screen);

  function pick(id) {
    store.selectPlayer(id);
    onPick();
  }

  function renderList() {
    const players = store.players;
    if (!players.length) return renderForm(null);

    clear(screen);
    mount(screen,
      el('p', { class: 'players__hello' }, 'Кто сегодня играет?'),
      el('div', { class: 'players__grid' },
        players.map((player) => el('div', { class: 'player-card' },
          el('button', {
            class: 'player-card__pick',
            type: 'button',
            onclick: () => pick(player.id),
          },
            el('div', { class: 'player-card__stage' },
              renderGuitar(player.guitar, { label: `Гитара игрока ${player.name}` })),
            el('div', { class: 'player-card__avatar' }, player.avatar),
            el('div', { class: 'player-card__name' }, player.name),
            el('div', { class: 'player-card__stars' }, `⭐ ${player.stars}`)),
          el('button', {
            class: 'player-card__edit',
            type: 'button',
            'aria-label': `Изменить игрока ${player.name}`,
            onclick: () => renderForm(player),
          }, '✏️'))),
        el('button', { class: 'player-card player-card--add', type: 'button', onclick: () => renderForm(null) },
          el('div', { class: 'player-card__plus' }, '+'),
          el('div', { class: 'player-card__name' }, 'Новый игрок'))),
    );
  }

  /** player === null — a new player; otherwise editing an existing one. */
  function renderForm(player) {
    const firstRun = !store.players.length;
    let name = player ? player.name : '';
    let avatar = player ? player.avatar : AVATARS[Math.floor(Math.random() * AVATARS.length)];

    clear(screen);

    const done = el('button', { class: 'btn btn--primary', type: 'button', onclick: save }, 'Готово');
    const input = el('input', {
      class: 'player-form__input',
      type: 'text',
      value: name,
      maxlength: MAX_NAME,
      placeholder: 'Имя',
      autocomplete: 'off',
      enterkeyhint: 'done',
      oninput: (event) => {
        name = event.target.value;
        refresh();
      },
      onkeydown: (event) => {
        if (event.key === 'Enter') save();
      },
    });

    const avatarButtons = AVATARS.map((emoji) => el('button', {
      class: 'avatar-btn',
      type: 'button',
      'aria-label': `Зверёк ${emoji}`,
      onclick: () => {
        avatar = emoji;
        refresh();
      },
    }, emoji));

    // toggle classes instead of re-rendering, so the text field keeps focus
    function refresh() {
      avatarButtons.forEach((button, i) => button.classList.toggle('avatar-btn--on', AVATARS[i] === avatar));
      done.disabled = !name.trim();
    }

    function save() {
      const clean = name.trim().slice(0, MAX_NAME);
      if (!clean) return;
      if (player) {
        store.updatePlayer(player.id, { name: clean, avatar });
        renderList();
      } else {
        const created = store.addPlayer({ name: clean, avatar });
        pick(created.id);
      }
    }

    mount(screen,
      el('div', { class: 'player-form' },
        el('h2', { class: 'player-form__title' },
          firstRun ? 'Давай познакомимся!' : player ? 'Изменить игрока' : 'Новый игрок'),
        el('label', { class: 'player-form__label' }, 'Как тебя зовут?', input),
        el('div', { class: 'player-form__label' }, 'Выбери зверька'),
        el('div', { class: 'avatar-grid' }, avatarButtons),
        el('div', { class: 'row row--center' },
          done,
          firstRun ? null : el('button', { class: 'btn', type: 'button', onclick: renderList }, 'Отмена')),
        // grown-up actions live here, away from the main screen
        player ? el('div', { class: 'form-links' },
          el('button', {
            class: 'link-btn',
            type: 'button',
            onclick: () => {
              if (confirm(`Обнулить звёзды, результаты и гитару игрока «${player.name}»? Сам игрок останется.`)) {
                store.resetPlayer(player.id);
                renderList();
              }
            },
          }, 'Сбросить прогресс'),
          el('button', {
            class: 'link-btn',
            type: 'button',
            onclick: () => {
              if (confirm(`Удалить игрока «${player.name}» вместе со всеми звёздами и гитарой?`)) {
                store.removePlayer(player.id);
                renderList();
              }
            },
          }, 'Удалить игрока')) : null,
      ),
    );

    refresh();
    // a new player starts with the name; when editing, a keyboard popping up would only cover the avatars
    if (!player) input.focus();
  }

  renderList();
}
