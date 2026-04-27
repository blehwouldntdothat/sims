function pairKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function getRelationship(state, aId, bId) {
  const key = pairKey(aId, bId);
  return state.relationships[key] ?? 0;
}

export function modifyRelationship(state, aId, bId, delta) {
  const key = pairKey(aId, bId);
  const current = state.relationships[key] ?? 0;
  state.relationships[key] = current + delta;
}

export function applyEventToPair(state, event, aId, bId) {
  modifyRelationship(state, aId, bId, event.effect);
}
