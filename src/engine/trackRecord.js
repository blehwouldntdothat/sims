export function addTrackRecordEntry(state, camperId, episode, result) {
  if (!state.trackRecord[camperId]) {
    state.trackRecord[camperId] = [];
  }
  state.trackRecord[camperId].push({ episode, result });
}
