import { EpisodePhase } from "../engine/state.js";
import { advancePhase } from "../engine/episode.js";
import { clearElement, createEl } from "./components.js";
import { introLines } from "../data/intros.js";

export function initEpisodeView(state) {
  const menuPage = document.getElementById("main-menu");
  const episodePage = document.getElementById("episode-view");

  const episodeNumberEl = document.getElementById("episode-number");
  const phaseLabelEl = document.getElementById("episode-phase-label");
  const contentEl = document.getElementById("episode-content");
  const nextPhaseBtn = document.getElementById("next-phase-btn");
  const backToMenuBtn = document.getElementById("back-to-menu-btn");
  const trackRecordWrapper = document.getElementById("track-record-table-wrapper");

  function renderEpisode() {
    episodeNumberEl.textContent = state.episodeNumber.toString();
    clearElement(contentEl);

    if (state.phase === "intro") {
      phaseLabelEl.textContent = "Meet the Campers";
      renderIntro();
      return;
    }

    if (state.phase === EpisodePhase.CHALLENGE) {
      phaseLabelEl.textContent = "Challenge";
      renderChallenge();
    } else if (state.phase === EpisodePhase.POST_CHALLENGE) {
      phaseLabelEl.textContent = "Post-Challenge Events";
      renderPostChallenge();
    } else if (state.phase === EpisodePhase.ELIMINATION) {
      phaseLabelEl.textContent = "Elimination Ceremony";
      renderElimination();
    }

    renderTrackRecord();
  }

  function renderIntro() {
    const title = createEl("h2", null, "Welcome to the Island!");
    contentEl.appendChild(title);

    const ul = createEl("ul", null);

    state.currentCast.forEach(c => {
      const line = introLines[c.id] || `${c.name} introduces themselves.`;
      ul.appendChild(createEl("li", null, `${c.name}: "${line}"`));
    });

    contentEl.appendChild(ul);
  }

  function renderChallenge() {
    const result = state.lastChallengeResult;

    if (!result || !result.challenge) {
      contentEl.appendChild(createEl("p", null, "Challenge loading..."));
      return;
    }

    contentEl.appendChild(createEl("h2", null, result.challenge.name));

    const list = createEl("ol", null);
    result.ranking.forEach((entry, index) => {
      const li = createEl(
        "li",
        null,
        `${entry.name} (score: ${entry.score.toFixed(2)})`
      );
      list.appendChild(li);
    });

    contentEl.appendChild(list);
  }

  function renderPostChallenge() {
    const events = state.lastEvents || [];

    if (!events.length) {
      contentEl.appendChild(createEl("p", null, "No notable events this episode."));
      return;
    }

    const ul = createEl("ul", null);
    events.forEach(ev => ul.appendChild(createEl("li", null, ev.text)));
    contentEl.appendChild(ul);
  }

  function renderElimination() {
    const elim = state.lastElimination;

    if (!elim) {
      contentEl.appendChild(createEl("p", null, "Elimination loading..."));
      return;
    }

    if (elim.type === "finale") {
      contentEl.appendChild(createEl("h2", null, `WINNER: ${elim.winnerId}`));
      return;
    }

    contentEl.appendChild(
      createEl("h2", null, `Eliminated: ${elim.eliminatedName}`)
    );

    const ul = createEl("ul", null);
    Object.entries(elim.votes).forEach(([id, count]) => {
      ul.appendChild(createEl("li", null, `${id}: ${count} vote(s)`));
    });

    contentEl.appendChild(ul);
  }

  function renderTrackRecord() {
    clearElement(trackRecordWrapper);

    const table = createEl("table", "track-record-table");

    // HEADER
    const thead = createEl("thead", null);
    const headerRow = createEl("tr", "tr-header");

    headerRow.appendChild(createEl("th", "tr-grey", "Rank"));
    headerRow.appendChild(createEl("th", "tr-grey", "Contestant"));

    for (let ep = 1; ep <= state.episodeNumber; ep++) {
      headerRow.appendChild(createEl("th", "tr-grey", `E${ep}`));
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // BODY
    const tbody = createEl("tbody", null);

    const active = [...state.currentCast];
    const eliminated = [...state.eliminated];

    const sorted = [
      ...active, // active players at top
      ...eliminated // eliminated in chronological order
    ];

    sorted.forEach((camper, index) => {
      const row = createEl("tr", null);

      // Rank
      const rank = index + 1;
      const suffix =
        rank === 1 ? "1st" :
        rank === 2 ? "2nd" :
        rank === 3 ? "3rd" :
        `${rank}th`;

      row.appendChild(createEl("td", "tr-grey", suffix));

      // Name
      row.appendChild(createEl("td", "tr-grey", camper.name));

      // Episode cells
      for (let ep = 1; ep <= state.episodeNumber; ep++) {
        const cell = createEl("td", "tr-cell", "");
        const entries = state.trackRecord[camper.id] || [];
        const entry = entries.find(e => e.episode === ep);

        if (entry) {
          if (entry.result === "ELIM") {
            cell.textContent = "ELIM";
            cell.style.background = "#ff4b4b";
            cell.style.color = "white";
          } else if (entry.result === "WINNER") {
            cell.textContent = "WINNER";
            cell.style.background = "yellow";
            cell.style.fontWeight = "bold";
          } else if (entry.result === "RUNNER") {
            cell.textContent = "RUNNER UP";
            cell.style.background = "#d0d0d0";
          } else if (entry.result === "WIN") {
            cell.textContent = "WIN";
            cell.style.background = "#4a66d5";
            cell.style.color = "white";
          } else {
            cell.textContent = entry.result;
          }
        } else {
          cell.textContent = "SAFE";
          cell.style.background = "white";
        }

        row.appendChild(cell);
      }

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    trackRecordWrapper.appendChild(table);
  }

  nextPhaseBtn.addEventListener("click", () => {
    advancePhase(state);
    renderEpisode();
  });

  backToMenuBtn.addEventListener("click", () => {
    episodePage.classList.remove("active");
    menuPage.classList.add("active");
  });

  document.addEventListener("episode:start", () => {
    state.phase = "intro";
    renderEpisode();
  });
}
