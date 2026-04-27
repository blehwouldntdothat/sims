import { EpisodePhase } from "../engine/state.js";
import { advancePhase } from "../engine/episode.js";
import { clearElement, createEl } from "./components.js";

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

  function renderChallenge() {
    const result = state.lastChallengeResult;
    if (!result || !result.challenge) {
      const p = createEl("p", null, "Challenge will be generated when you click Next.");
      contentEl.appendChild(p);
      return;
    }

    const title = createEl("h2", null, result.challenge.name);
    contentEl.appendChild(title);

    const list = createEl("ol", null);
    result.ranking.forEach((entry) => {
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
      const p = createEl("p", null, "No notable events this episode.");
      contentEl.appendChild(p);
      return;
    }

    const ul = createEl("ul", null);
    events.forEach((ev) => {
      const li = createEl("li", null, ev.text);
      ul.appendChild(li);
    });
    contentEl.appendChild(ul);
  }

  function renderElimination() {
    const elim = state.lastElimination;
    if (!elim) {
      const p = createEl("p", null, "Elimination will be determined when you click Next.");
      contentEl.appendChild(p);
      return;
    }

    if (elim.type === "finale") {
      const p = createEl("p", null, `The winner is ${elim.winnerId}!`);
      contentEl.appendChild(p);
      return;
    }

    const title = createEl(
      "h2",
      null,
      `Eliminated: ${elim.eliminatedName} (${elim.eliminatedId})`
    );
    contentEl.appendChild(title);

    if (elim.votes) {
      const votesTitle = createEl("h3", null, "Vote Count");
      contentEl.appendChild(votesTitle);

      const ul = createEl("ul", null);
      Object.entries(elim.votes).forEach(([id, count]) => {
        const li = createEl("li", null, `${id}: ${count} vote(s)`);
        ul.appendChild(li);
      });
      contentEl.appendChild(ul);
    }
  }

  function renderTrackRecord() {
    clearElement(trackRecordWrapper);

    const table = createEl("table", "track-record-table");
    const thead = createEl("thead", null);
    const headerRow = createEl("tr", null);

    headerRow.appendChild(createEl("th", null, "Camper"));

    // episodes up to current
    for (let ep = 1; ep <= state.episodeNumber; ep++) {
      headerRow.appendChild(createEl("th", null, `E${ep}`));
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = createEl("tbody", null);

    const all = [...state.currentCast, ...state.eliminated];

    all.forEach((camper) => {
      const row = createEl("tr", null);
      row.appendChild(createEl("td", null, camper.name));

      for (let ep = 1; ep <= state.episodeNumber; ep++) {
        const cell = createEl("td", null, "");
        const entries = state.trackRecord[camper.id] || [];
        const entry = entries.find((e) => e.episode === ep);
        if (entry) {
          cell.textContent = entry.result;
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
    // reset episode state for a new run if you want
    renderEpisode();
  });
}
