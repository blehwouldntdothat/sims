import { state, EpisodePhase } from "../engine/state.js";
import {
  runChallengePhase,
  runPostChallengePhase,
  runEliminationPhase
} from "../engine/episode.js";

export function initEpisodeView() {
  const page = document.getElementById("episode-view");
  const contentEl = document.getElementById("episode-content");
  const episodeNumberEl = document.getElementById("episode-number");
  const phaseLabelEl = document.getElementById("episode-phase-label");

  const nextBtn = document.getElementById("next-phase-btn");
  const backBtn = document.getElementById("back-to-menu-btn");

  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  // -----------------------------
  // CHALLENGE RENDERING
  // -----------------------------
  function renderChallenge() {
    const result = state.lastChallengeResult;

    contentEl.innerHTML = "";

    contentEl.appendChild(createEl("h2", null, result.challenge.name));
    contentEl.appendChild(createEl("p", null, result.description));

    Object.entries(result.grouped).forEach(([performance, names]) => {
      const line = `${names.join(" and ")} ${performance}!`;
      contentEl.appendChild(createEl("p", null, line));
    });

    contentEl.appendChild(
      createEl(
        "h3",
        null,
        `${result.winner.name} has won the challenge and immunity!`
      )
    );
  }

  // -----------------------------
  // POST-CHALLENGE RENDERING
  // -----------------------------
  function renderPostChallenge() {
    contentEl.innerHTML = "";
    state.lastEvents.forEach(e => {
      contentEl.appendChild(createEl("p", null, e));
    });
  }

  // -----------------------------
  // ELIMINATION RENDERING
  // -----------------------------
  function renderElimination() {
    contentEl.innerHTML = "";
    const elim = state.lastElimination;

    contentEl.appendChild(
      createEl("h2", null, `${elim.name} has been eliminated.`)
    );
  }

  // -----------------------------
  // TRACK RECORD RENDERING (RESTORED)
  // -----------------------------
  function renderTrackRecord() {
    const wrapper = document.getElementById("track-record-table-wrapper");
    wrapper.innerHTML = "";

    const table = document.createElement("table");
    table.className = "track-record-table";

    // Header row
    const header = document.createElement("tr");
    header.appendChild(createEl("th", null, "Contestant"));

    const maxEpisode = state.episodeNumber;

    for (let ep = 1; ep <= maxEpisode; ep++) {
      header.appendChild(createEl("th", null, `Ep ${ep}`));
    }

    table.appendChild(header);

    // Rows for each camper (active + eliminated)
    const everyone = [...state.currentCast, ...state.eliminated];

    everyone.forEach(camper => {
      const row = document.createElement("tr");

      // Name cell
      row.appendChild(createEl("td", "tr-name", camper.name));

      // Episode cells
      for (let ep = 1; ep <= maxEpisode; ep++) {
        const entry = (state.trackRecord[camper.id] || []).find(
          e => e.episode === ep
        );

        const cell = document.createElement("td");

        if (!entry) {
          cell.textContent = "";
        } else {
          cell.textContent = entry.result;

          // Basic color coding
          if (entry.result === "WIN") cell.style.background = "#4a66d5";
          if (entry.result === "OUT") cell.style.background = "red";
          if (entry.result === "SAFE") cell.style.background = "white";
        }

        row.appendChild(cell);
      }

      table.appendChild(row);
    });

    wrapper.appendChild(table);
  }

  // -----------------------------
  // UPDATE VIEW
  // -----------------------------
  function updateView() {
    episodeNumberEl.textContent = state.episodeNumber;

    if (state.phase === EpisodePhase.CHALLENGE) {
      phaseLabelEl.textContent = "Challenge";
      renderChallenge();
    } else if (state.phase === EpisodePhase.POST_CHALLENGE) {
      phaseLabelEl.textContent = "Post-Challenge";
      renderPostChallenge();
    } else if (state.phase === EpisodePhase.ELIMINATION) {
      phaseLabelEl.textContent = "Elimination";
      renderElimination();
    }

    // ⭐ Track record ALWAYS updates
    renderTrackRecord();
  }

  // -----------------------------
  // BUTTONS
  // -----------------------------
  nextBtn.onclick = () => {
    if (state.phase === EpisodePhase.CHALLENGE) {
      runPostChallengePhase(state);
      state.phase = EpisodePhase.POST_CHALLENGE;
    } else if (state.phase === EpisodePhase.POST_CHALLENGE) {
      runEliminationPhase(state);
      state.phase = EpisodePhase.ELIMINATION;
    } else {
      state.episodeNumber++;
      state.phase = EpisodePhase.CHALLENGE;
      runChallengePhase(state);
    }

    updateView();
  };

  backBtn.onclick = () => {
    document.getElementById("main-menu").classList.add("active");
    document.getElementById("episode-view").classList.remove("active");
  };

  // -----------------------------
  // START EPISODE
  // -----------------------------
  document.addEventListener("episode:start", () => {
    runChallengePhase(state);
    updateView();
  });
}
