import { clearElement, createEl } from "./components.js";
import { campers } from "../data/campers.js";

export function initMenuUI(state) {
  const menuPage = document.getElementById("main-menu");
  const episodePage = document.getElementById("episode-view");

  const searchInput = document.getElementById("search-input");
  const campersListEl = document.getElementById("campers-list");
  const currentCastEl = document.getElementById("current-cast");
  const currentCastCountEl = document.getElementById("current-cast-count");
  const simulateBtn = document.getElementById("simulate-btn");

  const premiereSelect = document.getElementById("premiere-format");
  const returningSelect = document.getElementById("returning-format");
  const seasonSelect = document.getElementById("season-format");
  const finaleSelect = document.getElementById("finale-format");

  function updateConfigFromUI() {
    state.config.premiereFormat = premiereSelect.value;
    state.config.returningFormat = returningSelect.value;
    state.config.seasonFormat = seasonSelect.value;
    state.config.finaleFormat = finaleSelect.value;
  }

  function renderCampersList() {
    const query = searchInput.value.toLowerCase();
    clearElement(campersListEl);

    campers
      .filter((c) => c.name.toLowerCase().includes(query))
      .forEach((camper) => {
        const row = createEl("div", "campers-list-item");
        const nameSpan = createEl("span", null, camper.name);
        const addBtn = createEl("button", "secondary", "+");

        addBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          addToCast(camper);
        });

        row.appendChild(nameSpan);
        row.appendChild(addBtn);
        campersListEl.appendChild(row);
      });
  }

  function addToCast(camper) {
    if (state.currentCast.find((c) => c.id === camper.id)) return;
    state.currentCast.push({ ...camper });
    renderCurrentCast();
  }

  function removeFromCast(camperId) {
    const idx = state.currentCast.findIndex((c) => c.id === camperId);
    if (idx >= 0) {
      state.currentCast.splice(idx, 1);
      renderCurrentCast();
    }
  }

  function renderCurrentCast() {
    clearElement(currentCastEl);
    currentCastCountEl.textContent = state.currentCast.length.toString();

    state.currentCast.forEach((camper) => {
      const card = createEl("div", "cast-card");
      const name = createEl("div", "cast-card-name", camper.name);
      const remove = createEl("div", "cast-card-remove", "Remove");

      remove.addEventListener("click", () => removeFromCast(camper.id));

      card.appendChild(name);
      card.appendChild(remove);
      currentCastEl.appendChild(card);
    });
  }

  searchInput.addEventListener("input", renderCampersList);

  simulateBtn.addEventListener("click", () => {
    updateConfigFromUI();
    if (state.currentCast.length < 2) {
      alert("Add at least 2 campers to start a season.");
      return;
    }
    menuPage.classList.remove("active");
    episodePage.classList.add("active");
    // episode view will render based on state
    document.dispatchEvent(new CustomEvent("episode:start"));
  });

  // initial render
  renderCampersList();
  renderCurrentCast();
}
