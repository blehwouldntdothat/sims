import { EpisodePhase } from "../engine/state.js";
import {
  runChallengePhase,
  runPostChallengePhase,
  runEliminationPhase
} from "../engine/episode.js";
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

    // Finale → Next returns to menu
    if (state.lastElimination && state.lastElimination.type === "finale") {
      phaseLabelEl.textContent = "Final Results";
      renderElimination();
      renderTrackRecord();
      return;
    }

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

  // NEW CHALLENGE RENDERING (uses grouped performances + winner)
  function renderChallenge() {
    const result = state.lastChallengeResult;

    if (!result || !result.challenge) {
      contentEl.appendChild(createEl("p", null, "Challenge loading..."));
      return;
    }

    // Title + description
    contentEl.appendChild(createEl("h2", null, result.challenge.name));
    contentEl.appendChild(createEl("p", null, result.description));

    // Grouped performances
    Object.entries(result.grouped).forEach(([performance, names]) => {
      const line = `${names.join(" and ")} ${performance}!`;
      contentEl.appendChild(createEl("p", null, line));
    });

    // Winner + immunity
    contentEl.appendChild(
      createEl(
        "h3",
        null,
        `${result.winner.name} has won the challenge and immunity!`
      )
    );
  }

  function renderPostChallenge() {
    const events = state.lastEvents || [];

    if (!events.length) {
      contentEl.appendChild(createEl("p", null, "No notable events this episode."));
      return;
    }

    const ul = createEl("ul", null);
    events.forEach(ev => ul.appendChild(createEl("li", null, ev.text || ev)));
    contentEl.appendChild(ul);
  }

  function renderElimination() {
    const elim = state.lastElimination;

    if (!elim) {
      contentEl.appendChild(createEl("p", null, "Elimination loading..."));
      return;
    }

    if (elim.type === "finale") {
      const text = elim.runnerId
        ? `WINNER: ${elim.winnerId} • RUNNER-UP: ${elim.runnerId}`
        : `WINNER: ${elim.winnerId}`;
      contentEl.appendChild(createEl("h2", null, text));
      return;
    }

    contentEl.appendChild(
      createEl("h2", null, `Eliminated: ${elim.eliminatedName || elim.name}`)
    );

    if (elim.votes) {
      const ul = createEl("ul", null);
      Object.entries(elim.votes).forEach(([id, count]) => {
        ul.appendChild(createEl("li", null, `${id}: ${count} vote(s)`));
      });
      contentEl.appendChild(ul);
    }
  }

 function renderTrackRecord() {
  clearElement(trackRecordWrapper);

  const table = createEl("table", "track-record-table");

  const thead = createEl("thead", null);
  const headerRow = createEl("tr", "tr-header");

  headerRow.appendChild(createEl("th", "tr-grey", "Rank"));
  headerRow.appendChild(createEl("th", "tr-grey", "Contestant"));

  for (let ep = 1; ep <= state.episodeNumber; ep++) {
    headerRow.appendChild(createEl("th", "tr-grey", `E${ep}`));
  }

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = createEl("tbody", null);

  const active = [...state.currentCast];
  const eliminated = [...state.eliminated];

  const totalPlayers = active.length + eliminated.length;

  // Sort eliminated by their elimination order ascending (first eliminated first)
  const sortedEliminatedAsc = eliminated
    .slice()
    .sort((a, b) => (a._elimOrder || 0) - (b._elimOrder || 0));

  // We'll render active first, then eliminated in reverse (most recent first),
  // so the first eliminated ends up at the bottom.
  const sorted = [
    ...active.map(c => ({ camper: c, active: true })),
    ...sortedEliminatedAsc.map(c => ({ camper: c, active: false }))
  ];

  const finaleDone =
    state.lastElimination && state.lastElimination.type === "finale";

  // Build a map from camperId to index in sortedEliminatedAsc for fallback elimOrder
  const elimIndexMap = {};
  sortedEliminatedAsc.forEach((c, idx) => {
    elimIndexMap[c.id] = idx + 1; // 1-based order (1 = first eliminated)
  });

  // When rendering, we want eliminated rows to appear with most recent first,
  // so we'll iterate sorted but when encountering eliminated rows we compute rank using elimOrder.
  // To ensure visual order (active first, then most recent eliminated), we'll render active rows first,
  // then render eliminated rows in reverse of sortedEliminatedAsc.
  // Render active rows
  sorted.filter(s => s.active).forEach(entry => {
    const camper = entry.camper;
    const row = createEl("tr", null);

    // Rank for active contestants
    let rankText = "TBA";
    if (finaleDone) rankText = "1st";

    row.appendChild(createEl("td", "tr-grey", rankText));
    row.appendChild(createEl("td", "tr-grey", camper.name));

    const entries = state.trackRecord[camper.id] || [];
    const elimEntry = entries.find(e => e.result === "ELIM" || e.result === "OUT");
    const eliminatedAt = elimEntry ? elimEntry.episode : null;

    for (let ep = 1; ep <= state.episodeNumber; ep++) {
      const cell = createEl("td", "tr-cell", "");

      if (eliminatedAt && ep > eliminatedAt) {
        cell.style.background = "#cccccc";
        row.appendChild(cell);
        continue;
      }

      const epEntry = entries.find(e => e.episode === ep);

      if (epEntry) {
        const res = epEntry.result;
        if (res === "ELIM" || res === "OUT") {
          cell.textContent = "ELIM";
          cell.style.background = "#ff0000";
          cell.style.color = "black";
          cell.style.fontWeight = "bold";
        } else if (res === "WINNER") {
          cell.textContent = "WINNER";
          cell.style.background = "yellow";
          cell.style.fontWeight = "bold";
        } else if (res === "RUNNER") {
          cell.textContent = "RUNNER-UP";
          cell.style.background = "#d0d0d0";
          cell.style.fontWeight = "bold";
        } else if (res === "WIN") {
          cell.textContent = "WIN";
          cell.style.background = "#4a66d5";
          cell.style.color = "white";
          cell.style.fontWeight = "bold";
        } else {
          cell.textContent = res;
        }
      } else {
        cell.textContent = "SAFE";
        cell.style.background = "white";
      }

      row.appendChild(cell);
    }

    tbody.appendChild(row);
  });

  // Render eliminated rows in reverse order so most recently eliminated appears first
  const sortedEliminatedDesc = sortedEliminatedAsc.slice().reverse();
  sortedEliminatedDesc.forEach((camper, idx) => {
    const row = createEl("tr", null);

    // Determine elimOrder: prefer explicit _elimOrder, otherwise fallback to index in asc list
    const explicitOrder = camper._elimOrder;
    const fallbackOrder = elimIndexMap[camper.id] || (sortedEliminatedAsc.length - idx);
    const elimOrder = explicitOrder || fallbackOrder;

    // Rank calculation: 1st = winner, last eliminated = lowest rank
    const rank = totalPlayers - elimOrder + 1;
    const suffix =
      rank === 1 ? "1st" :
      rank === 2 ? "2nd" :
      rank === 3 ? "3rd" :
      `${rank}th`;

    row.appendChild(createEl("td", "tr-grey", suffix));
    row.appendChild(createEl("td", "tr-grey", camper.name));

    const entries = state.trackRecord[camper.id] || [];
    const elimEntry = entries.find(e => e.result === "ELIM" || e.result === "OUT");
    const eliminatedAt = elimEntry ? elimEntry.episode : null;

    for (let ep = 1; ep <= state.episodeNumber; ep++) {
      const cell = createEl("td", "tr-cell", "");

      if (eliminatedAt && ep > eliminatedAt) {
        cell.style.background = "#cccccc";
        row.appendChild(cell);
        continue;
      }

      const epEntry = entries.find(e => e.episode === ep);

      if (epEntry) {
        const res = epEntry.result;
        if (res === "ELIM" || res === "OUT") {
          cell.textContent = "ELIM";
          cell.style.background = "#ff0000";
          cell.style.color = "black";
          cell.style.fontWeight = "bold";
        } else if (res === "WINNER") {
          cell.textContent = "WINNER";
          cell.style.background = "yellow";
          cell.style.fontWeight = "bold";
        } else if (res === "RUNNER") {
          cell.textContent = "RUNNER-UP";
          cell.style.background = "#d0d0d0";
          cell.style.fontWeight = "bold";
        } else if (res === "WIN") {
          cell.textContent = "WIN";
          cell.style.background = "#4a66d5";
          cell.style.color = "white";
          cell.style.fontWeight = "bold";
        } else {
          cell.textContent = res;
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
  // PHASE FLOW (replaces advancePhase)
  nextPhaseBtn.addEventListener("click", () => {
    // Finale → Next returns to menu
    if (state.lastElimination && state.lastElimination.type === "finale") {
      episodePage.classList.remove("active");
      menuPage.classList.add("active");
      return;
    }

    if (state.phase === "intro") {
      state.phase = EpisodePhase.CHALLENGE;
      runChallengePhase(state);
    } else if (state.phase === EpisodePhase.CHALLENGE) {
      runPostChallengePhase(state);
      state.phase = EpisodePhase.POST_CHALLENGE;
    } else if (state.phase === EpisodePhase.POST_CHALLENGE) {
      runEliminationPhase(state);
      state.phase = EpisodePhase.ELIMINATION;
    } else if (state.phase === EpisodePhase.ELIMINATION) {
      state.episodeNumber++;
      state.phase = EpisodePhase.CHALLENGE;
      runChallengePhase(state);
    }

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
