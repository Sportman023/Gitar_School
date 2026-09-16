// Guitar workshop catalog: everything a player can put on their guitar.
//
// Stars are never spent. Each item has a `need` threshold: once the player's
// total stars reach it, the item is unlocked for good. Early thresholds are
// close together so the first rewards come quickly; later ones stretch out.
//
// Kinds:
//   shape   — body shape (one at a time)
//   color   — body paint (one at a time)
//   sticker — decorations on the body (up to MAX_STICKERS at a time)
//   effect  — something around the guitar (one at a time)
//
// To add an item: append it here and teach js/core/guitar.js how to draw it.

export const MAX_STICKERS = 3;

export const KINDS = [
  { id: 'shape', title: 'Форма', emoji: '🎸', label: 'форма' },
  { id: 'color', title: 'Цвет', emoji: '🎨', label: 'цвет' },
  { id: 'sticker', title: 'Наклейки', emoji: '⭐', label: 'наклейка' },
  { id: 'effect', title: 'Эффекты', emoji: '✨', label: 'эффект' },
];

export const ITEMS = [
  { kind: 'shape', id: 'classic', name: 'Классическая', need: 0 },
  { kind: 'shape', id: 'heart', name: 'Сердечко', need: 70 },
  { kind: 'shape', id: 'electric', name: 'Электрогитара', need: 250 },
  { kind: 'shape', id: 'star', name: 'Звезда', need: 500 },
  { kind: 'shape', id: 'arrow', name: 'Стрела', need: 850 },

  { kind: 'color', id: 'wood', name: 'Дерево', need: 0 },
  { kind: 'color', id: 'red', name: 'Красный', need: 0 },
  { kind: 'color', id: 'orange', name: 'Оранжевый', need: 20 },
  { kind: 'color', id: 'yellow', name: 'Жёлтый', need: 50 },
  { kind: 'color', id: 'green', name: 'Зелёный', need: 90 },
  { kind: 'color', id: 'lightblue', name: 'Голубой', need: 135 },
  { kind: 'color', id: 'blue', name: 'Синий', need: 190 },
  { kind: 'color', id: 'violet', name: 'Фиолетовый', need: 290 },
  { kind: 'color', id: 'pink', name: 'Розовый', need: 380 },
  { kind: 'color', id: 'rainbow', name: 'Радуга', need: 650 },
  { kind: 'color', id: 'gold', name: 'Золото', need: 1000 },
  { kind: 'color', id: 'galaxy', name: 'Космос', need: 1500 },

  { kind: 'sticker', id: 'star', name: 'Звёздочка', need: 0 },
  { kind: 'sticker', id: 'heart', name: 'Сердечко', need: 10 },
  { kind: 'sticker', id: 'note', name: 'Нотка', need: 35 },
  { kind: 'sticker', id: 'bolt', name: 'Молния', need: 110 },
  { kind: 'sticker', id: 'flower', name: 'Цветок', need: 220 },
  { kind: 'sticker', id: 'smile', name: 'Смайлик', need: 330 },
  { kind: 'sticker', id: 'rainbow', name: 'Радуга', need: 570 },
  { kind: 'sticker', id: 'crown', name: 'Корона', need: 750 },

  { kind: 'effect', id: 'none', name: 'Без эффекта', need: 0 },
  { kind: 'effect', id: 'sparkles', name: 'Блёстки', need: 160 },
  { kind: 'effect', id: 'glow', name: 'Сияние', need: 430 },
  { kind: 'effect', id: 'fire', name: 'Огонь', need: 1200 },
];

export const DEFAULT_GUITAR = { shape: 'classic', color: 'wood', stickers: [], effect: 'none' };

export const itemsOfKind = (kind) => ITEMS.filter((item) => item.kind === kind);

export const findItem = (kind, id) => ITEMS.find((item) => item.kind === kind && item.id === id);

export const isUnlocked = (item, stars) => stars >= item.need;

/** Items that became available when the star count went from `before` to `after`. */
export const unlockedBetween = (before, after) =>
  ITEMS.filter((item) => item.need > before && item.need <= after);

/** The closest item that is still locked, or null when everything is open. */
export const nextUnlock = (stars) =>
  ITEMS.filter((item) => item.need > stars).sort((a, b) => a.need - b.need)[0] || null;

/**
 * A guitar the player can actually have right now: anything unknown or still
 * locked (e.g. after a progress reset) falls back to the default look.
 */
export function sanitizeGuitar(guitar, stars) {
  const pick = (kind, id) => {
    const item = findItem(kind, id);
    return item && isUnlocked(item, stars) ? id : DEFAULT_GUITAR[kind];
  };
  const stickers = Array.isArray(guitar?.stickers) ? guitar.stickers : [];
  return {
    shape: pick('shape', guitar?.shape),
    color: pick('color', guitar?.color),
    effect: pick('effect', guitar?.effect),
    stickers: stickers
      .filter((id) => {
        const item = findItem('sticker', id);
        return item && isUnlocked(item, stars);
      })
      .slice(0, MAX_STICKERS),
  };
}
