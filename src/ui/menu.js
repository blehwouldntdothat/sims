import { state } from "../engine/state.js";
import { initEpisodeView } from "./episodeView.js";
import { campers } from "../data/campers.js";

export function initMenu() {
  const menuPage = document.getElementById("main-menu");
  const episodePage = document.getElementById("episode-view");

  const searchInput = document.getElementById("search-input");
  const campersList = document.getElementById("campers-list");
  const currentCastGrid = document.getElementById("current-cast"); // ✅ FIXED
  const currentCastCount = document.getElementById("current-cast-count");
  const simulateBtn = document.getElementById("simulate-btn");

  // -----------------------------
  // RENDER CAMPER LIST
  // -----------------------------
  function renderPlayerList(filter = "") {
    campersList.innerHTML = "";

    const filtered = campers.filter(p =>
      p.name.toLowerCase().includes(filter.toLowerCase())
    );

    filtered.forEach(player => {
      const item = document.createElement("div");
      item.className = "campers-list-item";

      const name = document.createElement("span");
      name.textContent = player.name;

      const addBtn = document.createElement("button");
      addBtn.textContent = "+";
      addBtn.className = "secondary";
      addBtn.onclick = () => addToCast(player);

      item.appendChild(name);
      item.appendChild(addBtn);
      campersList.appendChild(item);
    });
  }

  // -----------------------------
  // ADD CAMPER
  // -----------------------------
  function addToCast(player) {
    if (state.currentCast.find(c => c.id === player.id)) return;

    state.currentCast.push({ ...player });
    renderCurrentCast();
  }

  // -----------------------------
  // REMOVE CAMPER
  // -----------------------------
  function removeFromCast(id) {
    state.currentCast = state.currentCast.filter(c => c.id !== id);
    renderCurrentCast();
  }

  // -----------------------------
  // RENDER CURRENT CAST
  // -----------------------------
  function renderCurrentCast() {
    currentCastGrid.innerHTML = ""; // ✅ FIXED TARGET

    state.currentCast.forEach(player => {
      const card = document.createElement("div");
      card.className = "cast-card";

      const name = document.createElement("div");
      name.className = "cast-card-name";
      name.textContent = player.name;

      const remove = document.createElement("div");
      remove.className = "cast-card-remove";
      remove.textContent = "Remove";
      remove.onclick = () => removeFromCast(player.id);

      card.appendChild(name);
      card.appendChild(remove);
      currentCastGrid.appendChild(card);
    });

    currentCastCount.textContent = state.currentCast.length.toString();
  }

  // -----------------------------
  // RESET STATE
  // -----------------------------
  function resetSimulationState() {
    state.trackRecord = {};
    state.eliminated = [];
    state.episodeNumber = 1;
    state.phase = "intro";
    state.lastChallengeResult = null;
    state.lastEvents = [];
    state.lastElimination = null;
  }

  // -----------------------------
  // START SIMULATION
  // -----------------------------
  simulateBtn.addEventListener("click", () => {
    if (state.currentCast.length < 2) {
      alert("You need at least 2 contestants to start the simulation.");
      return;
    }

    resetSimulationState();

    menuPage.classList.remove("active");
    episodePage.classList.add("active");

    document.dispatchEvent(new Event("episode:start"));
  });

  // -----------------------------
  // SEARCH
  // -----------------------------
  searchInput.addEventListener("input", e => {
    renderPlayerList(e.target.value);
  });

  // INITIAL RENDER
  renderPlayerList();
  renderCurrentCast();

  initEpisodeView(state);
}
