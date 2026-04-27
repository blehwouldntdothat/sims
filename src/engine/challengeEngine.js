import { challenges } from "../data/challenges.js";

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomFloat() {
  return Math.random();
}

export function pickChallengeForPhase(phase) {
  const pool = challenges.filter((c) => c.phase === phase);
  if (!pool.length) return null;
  return randomChoice(pool);
}

function computeBaseScore(camper, challenge) {
  const s = camper.stats;
  const w = challenge.weights;
  let score =
    (s.strength || 0) * (w.strength || 0) +
    (s.agility || 0) * (w.agility || 0) +
    (s.stamina || 0) * (w.stamina || 0) +
    (s.intelligence || 0) * (w.intelligence || 0) +
    (s.skill || 0) * (w.skill || 0) +
    (s.luck || 0) * (w.luck || 0);

  // small random noise
  score += randomFloat() * 2 - 1; // -1 to +1

  // trait boosts
  if (challenge.traitBoosts && camper.traits) {
    for (const trait of camper.traits) {
      if (challenge.traitBoosts[trait]) {
        score += challenge.traitBoosts[trait];
      }
    }
  }

  return score;
}

export function runChallenge(state, phase) {
  const challenge = pickChallengeForPhase(phase);
  if (!challenge) {
    return {
      challenge: null,
      ranking: [],
    };
  }

  const ranking = state.currentCast
    .map((camper) => ({
      camperId: camper.id,
      name: camper.name,
      score: computeBaseScore(camper, challenge),
    }))
    .sort((a, b) => b.score - a.score);

  state.lastChallengeResult = { challenge, ranking };
  return state.lastChallengeResult;
}
