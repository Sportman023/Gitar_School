// Registry of the app's sections.
// To add a topic, create a module with
// { id, title, subtitle, emoji, accent, group, mount(root) } and list it here.

import learn from './learn.js';
import rainbow from './rainbow.js';
import fingers from './fingers.js';
import staffLearn from './staff-learn.js';
import octaveLearn from './octave2.js';
import { colorToggle } from '../core/controls.js';
import { renderStaff } from '../core/staff.js';
import { store } from '../core/store.js';
import { createQuiz } from '../core/quiz.js';
import { el, noteBubble, colorBubble, noteStyle, sample } from '../core/ui.js';
import { playPiano } from '../core/piano.js';
import { NOTE_BY_ID, NOTES_2, TWO_OCTAVES, octaveName } from '../data/notes.js';

// Play a reference C first, then the hidden note: the child compares
// pitches instead of needing perfect pitch. Both are piano keys of the
// first octave, C4–B4, so the hidden note is always at or above the C.
function playWithReference(note) {
  playPiano(NOTE_BY_ID.do.freq, { duration: 0.8, volume: 1.1 });
  playPiano(note.freq, { delay: 1.1, duration: 1.6 });
}

const noteToColor = createQuiz({
  id: 'note-to-color',
  title: 'Нота → Цвет',
  subtitle: 'Показываем ноту, выбираешь цвет',
  emoji: '🖍️',
  accent: '#7E57C2',
  group: 'Ноты и цвета',
  optionsClass: 'options options--colors',
  renderPrompt: (note) => el('div', { class: 'prompt' },
    el('div', { class: 'prompt__label' }, 'Какого цвета нота'),
    el('div', { class: 'prompt__big' }, note.ru),
    el('div', { class: 'prompt__label' }, `(${note.en})`),
  ),
  renderOption: (note) => colorBubble(note),
});

const colorToNote = createQuiz({
  id: 'color-to-note',
  title: 'Цвет → Нота',
  subtitle: 'Показываем цвет, выбираешь ноту',
  emoji: '🎵',
  accent: '#EC407A',
  group: 'Ноты и цвета',
  optionsClass: 'options options--names',
  renderPrompt: (note) => el('div', { class: 'prompt' },
    el('div', { class: 'prompt__label' }, 'Какая нота этого цвета?'),
    el('div', { class: 'prompt__swatch', style: noteStyle(note) }),
  ),
  renderOption: (note) => el('span', { class: 'option__name' }, note.ru),
});

const listenAndGuess = createQuiz({
  id: 'sound-to-note',
  title: 'Угадай на слух',
  subtitle: 'Фортепиано, первая октава',
  emoji: '👂',
  accent: '#FFA726',
  group: 'Ноты и цвета',
  onAsk: playWithReference,
  optionsClass: 'options options--names',
  renderPrompt: (note) => el('div', { class: 'prompt' },
    el('div', { class: 'prompt__label' }, 'Послушай и выбери ноту 1 октавы'),
    el('button', {
      class: 'prompt__play',
      type: 'button',
      onclick: () => playWithReference(note),
    }, '🔊'),
    el('div', { class: 'prompt__label' }, 'сначала прозвучит До, потом загадка'),
  ),
  renderOption: (note) => noteBubble(note, { colored: true }),
});

/** The note name in large type with its octave underneath. */
function namePrompt(label, note) {
  return el('div', { class: 'prompt' },
    el('div', { class: 'prompt__label' }, label),
    el('div', { class: 'prompt__big' }, note.ru),
    el('div', { class: 'prompt__label' }, octaveName(note)),
  );
}

// Staff games are the same for both octaves, so these are factories:
// config adds the id, the group and the notes (first octave by default).

// Reading notes on the staff. Note heads follow the shared "coloured notes"
// setting: colour is a hint here (red head → C), and the answers are words,
// otherwise the child could match colour to colour without reading the staff.
const staffToNote = (config) => createQuiz({
  title: 'Читаем ноты',
  subtitle: 'Нота на стане → название',
  emoji: '👀',
  accent: '#5C6BC0',
  optionsClass: 'options options--names',
  renderControls: (refresh) => colorToggle(refresh),
  renderPrompt: (note) => el('div', { class: 'prompt' },
    el('div', { class: 'prompt__label' }, 'Какая это нота?'),
    el('div', { class: 'prompt__paper' },
      renderStaff(note, { colored: store.setting('coloredHeads', true) })),
  ),
  renderOption: (note) => el('span', { class: 'option__name' }, note.ru),
  ...config,
});

// The reverse task: given a name, find where the note sits.
// Heads are always black here, otherwise colour would give the answer away.
const noteToStaff = (config) => createQuiz({
  title: 'Ставим ноты',
  subtitle: 'Название → место на стане',
  emoji: '✍️',
  accent: '#00897B',
  optionsClass: 'options options--staves',
  renderPrompt: (note) => namePrompt('Где на стане живёт нота', note),
  renderOption: (note) => el('div', { class: 'prompt__paper prompt__paper--small' },
    renderStaff(note, { colored: false })),
  ...config,
});

const SECOND = { group: 'Вторая октава', notes: NOTES_2 };

// Both octaves mixed. Colour only hints the name: C4 and C5 share a colour.
// That's why the options always include the same note from the other octave —
// which of the two it is has to be read from the staff.
const whichOctave = staffToNote({
  id: 'which-octave',
  title: 'Первая или вторая?',
  subtitle: 'Читаем ноты двух октав вперемешку',
  emoji: '🪜',
  accent: '#F4511E',
  group: 'Вторая октава',
  notes: TWO_OCTAVES,
  renderOption: (note) => el('span', { class: 'option__stack' },
    el('span', { class: 'option__name' }, note.ru),
    el('span', { class: 'option__octave' }, octaveName(note))),
  pickOthers: (note, pool, count) => {
    const twin = pool.find((other) => other.pc === note.pc && other.id !== note.id);
    if (!twin) return sample(pool, count, [note]);
    return [twin, ...sample(pool, count - 1, [note, twin])];
  },
  explainAnswer: (note) => `Это ${note.ru} ${octaveName(note)}`,
});

export const MODULES = [
  learn,
  noteToColor,
  colorToNote,
  rainbow,
  listenAndGuess,

  fingers,

  staffLearn,
  staffToNote({ id: 'staff-to-note', group: 'Нотный стан' }),
  noteToStaff({ id: 'note-to-staff', group: 'Нотный стан' }),

  octaveLearn,
  staffToNote({ id: 'staff2-to-note', ...SECOND }),
  noteToStaff({ id: 'note-to-staff2', ...SECOND }),
  whichOctave,
];
