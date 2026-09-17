// Generic quiz engine: ask a question about a note and offer several
// answers. What the question and the answers look like is up to each
// module (see js/modules/index.js).

import { el, clear, shuffle, sample, delay, mount, topicHref } from './ui.js';
import { NOTES } from '../data/notes.js';
import { store } from './store.js';
import { playSuccess, playFail, playFanfare } from './audio.js';

const PRAISE = ['Молодец! 🎉', 'Точно! ✨', 'Верно! 👏', 'Здорово! 🌟', 'Супер! 🎸'];

function buildQueue(notes, count) {
  const queue = [];
  while (queue.length < count) queue.push(...shuffle(notes));
  return queue.slice(0, count);
}

export function createQuiz(config) {
  const {
    id,
    title,
    subtitle,
    emoji,
    accent,
    group,
    questions = 10,
    optionsCount = 4,
    optionsClass = 'options',
    renderPrompt,
    renderOption,
    onAsk = null,
    renderControls = null,
    // which notes to ask about: the first octave by default
    notes = NOTES,
    // wrong answer options; random notes from the same set by default
    pickOthers = (note, pool, count) => sample(pool, count, [note]),
    // what to say after a wrong answer
    explainAnswer = (note) => `Это ${note.ru} — ${note.colorName.toLowerCase()}`,
  } = config;

  return {
    id,
    title,
    subtitle,
    emoji,
    accent,
    group,

    mount(root) {
      let queue = buildQueue(notes, questions);
      let index = 0;
      let score = 0;
      let locked = false;
      let cancelled = false;
      // answers of the current question. They are kept, so that redrawing the
      // screen (the "coloured notes" toggle) neither reshuffles them nor
      // replays the sound — the question stays exactly the same one.
      let options = null;

      const screen = el('div', { class: 'screen quiz', style: `--accent:${accent}` });
      root.append(screen);

      function renderProgress() {
        return el('div', { class: 'progress' },
          el('div', { class: 'progress__dots' },
            queue.map((_, i) => el('span', {
              class: `dot ${i < index ? 'dot--done' : ''} ${i === index ? 'dot--now' : ''}`,
            }))),
          el('div', { class: 'progress__score' }, `⭐ ${score}`),
        );
      }

      function renderQuestion() {
        clear(screen);
        if (index >= queue.length) return renderResult();

        const note = queue[index];
        const fresh = !options;
        if (fresh) options = shuffle([note, ...pickOthers(note, notes, optionsCount - 1)]);
        const feedback = el('div', { class: 'feedback' }, ' ');

        const optionNodes = options.map((option) =>
          el('button', {
            class: 'option',
            type: 'button',
            onclick: () => answer(option, note, optionNodes, feedback),
          }, renderOption(option)));

        mount(screen,
          renderProgress(),
          renderControls ? renderControls(redraw) : null,
          el('div', { class: 'question' }, renderPrompt(note)),
          feedback,
          el('div', { class: optionsClass }, optionNodes),
        );

        if (fresh && onAsk) onAsk(note);
      }

      /** Redraws the current question — for controls such as the colour toggle. */
      function redraw() {
        if (!locked) renderQuestion();
      }

      async function answer(picked, correctNote, optionNodes, feedback) {
        if (locked) return;
        locked = true;

        const isCorrect = picked.id === correctNote.id;
        store.recordAnswer(correctNote.id, isCorrect);

        optionNodes.forEach((node, i) => {
          node.disabled = true;
          if (options[i].id === correctNote.id) node.classList.add('option--right');
          else if (options[i].id === picked.id) node.classList.add('option--wrong');
        });

        if (isCorrect) {
          score += 1;
          feedback.textContent = PRAISE[Math.floor(Math.random() * PRAISE.length)];
          feedback.className = 'feedback feedback--good';
          playSuccess();
        } else {
          feedback.textContent = explainAnswer(correctNote);
          feedback.className = 'feedback feedback--bad';
          playFail();
        }

        await delay(isCorrect ? 850 : 1600);
        if (cancelled) return;
        index += 1;
        options = null;
        locked = false;
        renderQuestion();
      }

      function renderResult() {
        const best = store.moduleBest(id);
        store.finishRound(id, { score, total: queue.length });
        const isPerfect = score === queue.length;
        if (isPerfect) playFanfare();
        else playSuccess();

        clear(screen);
        screen.append(
          el('div', { class: 'result' },
            el('div', { class: 'result__emoji' }, isPerfect ? '🏆' : score >= queue.length * 0.7 ? '🌟' : '🎸'),
            el('div', { class: 'result__score' }, `${score} из ${queue.length}`),
            el('div', { class: 'result__text' },
              isPerfect ? 'Идеально! Все ответы верные!'
                : score >= queue.length * 0.7 ? 'Отличная работа!'
                  : 'Хорошо, давай ещё разок!'),
            best && best.best > score ? el('div', { class: 'result__best' }, `Лучший результат: ${best.best}`) : null,
            el('div', { class: 'result__stars' }, '⭐'.repeat(Math.max(1, Math.round(score / 2)))),
            el('div', { class: 'row' },
              el('button', {
                class: 'btn btn--primary',
                type: 'button',
                onclick: () => {
                  queue = buildQueue(notes, questions);
                  index = 0;
                  score = 0;
                  options = null;
                  locked = false;
                  renderQuestion();
                },
              }, 'Ещё раз'),
              el('a', { class: 'btn', href: topicHref(group) }, 'В меню'),
            ),
          ),
        );
      }

      renderQuestion();
      return () => { cancelled = true; };
    },
  };
}
