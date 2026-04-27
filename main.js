import { initMenuUI } from "./src/ui/menu.js";
import { initEpisodeView } from "./src/ui/episodeView.js";
import { createInitialState } from "./src/engine/state.js";

const appState = createInitialState();

window.appState = appState; // handy for debugging in console

document.addEventListener("DOMContentLoaded", () => {
  initMenuUI(appState);
  initEpisodeView(appState);
});
