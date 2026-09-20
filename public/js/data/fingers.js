// How fingers are named in guitar music. The left hand presses the strings and
// counts its fingers 1–4 from the index finger (the thumb has no number: it
// holds the neck from behind). The right hand plays and names its fingers
// with the first letters of their Spanish names; its little finger is "e",
// but it hardly ever plays, so it is left out here like the left thumb.
//
// `finger` is the finger on the hand drawing (js/core/hand.js), and `id` is
// always `<side>-<finger>`: that's what a tapped finger of the drawing reports.

export const HANDS = [
  { side: 'left', name: 'Левая', of: 'левой' },
  { side: 'right', name: 'Правая', of: 'правой' },
];

export const HAND_BY_SIDE = Object.fromEntries(HANDS.map((hand) => [hand.side, hand]));

const finger = (side, id, mark, name, from = null) => ({ id: `${side}-${id}`, side, finger: id, mark, name, from });

export const FINGERS = [
  finger('left', 'index', '1', 'указательный'),
  finger('left', 'middle', '2', 'средний'),
  finger('left', 'ring', '3', 'безымянный'),
  finger('left', 'pinky', '4', 'мизинец'),

  finger('right', 'thumb', 'p', 'большой', 'pulgar'),
  finger('right', 'index', 'i', 'указательный', 'índice'),
  finger('right', 'middle', 'm', 'средний', 'medio'),
  finger('right', 'ring', 'a', 'безымянный', 'anular'),
];

/** "безымянный палец левой руки", but "мизинец левой руки": that name is a noun already. */
export function fingerTitle(item) {
  const name = item.finger === 'pinky' ? item.name : `${item.name} палец`;
  return `${name} ${HAND_BY_SIDE[item.side].of} руки`;
}
