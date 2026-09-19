// "Second octave" section: cards for C5–G5 showing where each note is on
// the staff. How it continues the first octave is shown in the octave ladder.

import { el, clear } from "../core/ui.js";
import { renderStaff } from "../core/staff.js";
import { colorToggle } from "../core/controls.js";
import { store } from "../core/store.js";
import { loadPiano, playPiano, playPianoScale } from "../core/piano.js";
import { NOTES_2, octaveName } from "../data/notes.js";

export default {
  id: "octave2",
  title: "Вторая октава",
  subtitle: "До, Ре, Ми, Фа, Соль на нотном стане",
  emoji: "🎶",
  accent: "#AB47BC",
  group: "staff",
  kind: "learn",

  mount(root) {
    // start downloading the piano now, so the first tap isn't silent
    loadPiano();

    const screen = el("div", { class: "screen octave2" });
    root.append(screen);

    function render() {
      clear(screen);
      const colored = store.setting("coloredHeads", true);

      screen.append(
        el(
          "p",
          { class: "lead" },
          "После Си 1 октавы ноты начинаются заново — это вторая октава. Нажми на нотку, чтобы её услышать.",
        ),
        colorToggle(render),

        el("h3", { class: "block-title" }, "Где живёт каждая нота"),
        el(
          "div",
          { class: "staff-grid" },
          NOTES_2.map((note) =>
            el(
              "button",
              {
                class: "staff-card",
                type: "button",
                onclick: () => playPiano(note.freq),
              },
              renderStaff(note, { colored }),
              el(
                "div",
                { class: "staff-card__name" },
                `${note.ru} ${octaveName(note)}`,
              ),
              el("div", { class: "staff-card__place" }, note.staffPlace),
            ),
          ),
        ),
        el(
          "div",
          { class: "row row--center" },
          el(
            "button",
            {
              class: "btn btn--primary",
              type: "button",
              onclick: () => playPianoScale(NOTES_2),
            },
            "▶ Сыграть по порядку",
          ),
          el("a", { class: "btn", href: "#octaves" }, "🪜 Лесенка октав"),
        ),

        el(
          "div",
          { class: "memo" },
          el("div", { class: "memo__title" }, "Как запомнить"),
          el(
            "div",
            { class: "memo__phrase" },
            "Вторая октава живёт наверху стана",
          ),
          el(
            "ul",
            { class: "memo__list" },
            el(
              "li",
              null,
              "До — три линейки пропускаем – точку мы с тобою ставим",
            ),
            el(
              "li",
              null,
              "Ми — в верхнем промежутке, Фа — на 5-й, самой верхней линейке",
            ),
            el("li", null, "Соль сидит сверху на стане, над 5-й линейкой"),
            el("li", null, "Штиль у всех нот 2 октавы смотрит вниз, как у Си"),
          ),
        ),
      );
    }

    render();
  },
};
