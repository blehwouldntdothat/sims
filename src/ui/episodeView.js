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
    result.ranking.forEach(entry => {
      list.appendChild(
        createEl("li", null, `${entry.name} (score: ${entry.score.toFixed(2)})`)
      );
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
      contentEl.appendChild(createEl("p", null, `The winner is ${elim.winnerId}!`));
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
    const thead = createEl("thead", null);
    const headerRow = createEl("tr", null);

    headerRow.appendChild(createEl("th", null, "Camper"));

    for (let ep = 1; ep <= state.episodeNumber; ep++) {
      headerRow.appendChild(createEl("th", null, `E${ep}`));
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = createEl("tbody", null);
    const all = [...state.currentCast, ...state.eliminated];

    all.forEach(camper => {
      const row = createEl("tr", null);
      row.appendChild(createEl("td", null, camper.name));

      for (let ep = 1; ep <= state.episodeNumber; ep++) {
        const cell = createEl("td", null, "");
        const entries = state.trackRecord[camper.id] || [];
        const entry = entries.find(e => e.episode === ep);
        if (entry) cell.textContent = entry.result;
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
