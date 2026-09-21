// "Second octave" section: a ladder of C5–B5 and cards showing where each
// note is on the staff. How it continues the first octave is shown in the
// octave ladder.

import { el, clear } from "../core/ui.js";
import {
  renderStaff,
  renderStaffRow,
  playableMap,
  staffBox,
} from "../core/staff.js";
import { colorToggle } from "../core/controls.js";
import { store } from "../core/store.js";
import { loadPiano, playPiano, playPianoScale } from "../core/piano.js";
import { NOTES_2, octaveName } from "../data/notes.js";

export default {
  id: "octave2",
  title: "Вторая октава",
  subtitle: "Семь нот от До до Си над первой октавой",
  emoji: "🎶",
  accent: "#AB47BC",
  group: "staff",
  kind: "learn",

  mount(root) {
    // start downloading the piano now, so the first tap isn't silent
    loadPiano();

    const screen = el("div", { class: "screen octave2" });
    root.append(screen);

    // one box for every picture here, so Ля and Си fit above the staff
    const box = staffBox(NOTES_2);

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

        el("h3", { class: "block-title" }, "Лесенка из семи нот"),
        el(
          "div",
          { class: "staff-row" },
          playableMap(renderStaffRow(NOTES_2, { colored }), (freq) =>
            playPiano(freq, { duration: 1.4 }),
          ),
        ),
        el(
          "p",
          { class: "caption" },
          "Ноты шагают по очереди: линейка, промежуток, линейка, промежуток… " +
            "До 2 октавы живёт между 3-й и 4-й линейками, а Ля и Си забрались так высоко, " +
            "что им понадобилась своя добавочная линеечка над станом.",
        ),

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
              renderStaff(note, { colored, box }),
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
            "Ноты шагают по очереди: линейка, промежуток, линейка, промежуток…",
          ),
          el(
            "ul",
            { class: "memo__list" },
            el(
              "li",
              null,
              "Чтобы найти нотку До второй октавы можно запомнит так: Три линейки пропускаем – точку мы с тобою ставим. Эта точка – нотка До! Поэтому нотка До и пишется ПОСЛЕ трёх напечатанных линеечек.",
            ),
            el(
              "li",
              null,
              "Ля — на добавочной линеечке над станом, а Си — прямо над ней",
            ),
            el("li", null, "Штиль у всех нот 2 октавы смотрит вниз, как у Си"),
          ),
        ),
      );
    }

    render();
  },
};
