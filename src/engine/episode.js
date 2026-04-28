import { EpisodePhase } from "./state.js";
import { state } from "./state.js";
import { challenges } from "../data/challenges.js";

// Utility: add track record entry
export function addTrackRecordEntry(state, camperId, episode, result) {
  if (!state.trackRecord[camperId]) {
    state.trackRecord[camperId] = [];
  }
  state.trackRecord[camperId].push({ episode, result });
}

// Pick a random challenge
function pickChallenge() {
  return challenges[Math.floor(Math.random() * challenges.length)];
}

// MAIN: Run challenge phase
export function runChallengePhase(state) {
  const challenge = pickChallenge();

  state.lastEvents = [];
  state.lastElimination = null;

  // You will write your own descriptions in challenges.js
  const challengeDescription =
    challenge.description || "The campers face a difficult challenge.";

  // Weighted performance tiers
  const performanceTiers = [
    { label: "slayed the challenge", weight: 5 },
    { label: "had a great performance", weight: 4 },
    { label: "had a good performance", weight: 3 },
    { label: "had a bad performance", weight: 2 },
    { label: "flopped the challenge", weight: 1 }
  ];

  function weightedRandom() {
    const total = performanceTiers.reduce((sum, t) => sum + t.weight, 0);
    let r = Math.random() * total;
    for (const tier of performanceTiers) {
      if (r < tier.weight) return tier.label;
      r -= tier.weight;
    }
    return performanceTiers[2].label;
  }

  // Assign performances
  const performances = state.currentCast.map(camper => ({
    camperId: camper.id,
    name: camper.name,
    performance: weightedRandom()
  }));

  // Group by performance
  const grouped = {};
  performances.forEach(p => {
    if (!grouped[p.performance]) grouped[p.performance] = [];
    grouped[p.performance].push(p.name);
  });

  // Determine winner (best tier wins)
  const sortedByTier = performances.sort((a, b) => {
    const tierA = performanceTiers.findIndex(t => t.label === a.performance);
    const tierB = performanceTiers.findIndex(t => t.label === b.performance);
    return tierA - tierB;
  });

  const winner = sortedByTier[0];

  // Track record
  addTrackRecordEntry(state, winner.camperId, state.episodeNumber, "WIN");

  // Save result
  state.lastChallengeResult = {
    challenge,
    description: challengeDescription,
    performances,
    grouped,
    winner
  };

  return state.lastChallengeResult;
}

// POST-CHALLENGE PHASE (unchanged)
export function runPostChallengePhase(state) {
  state.lastEvents = [
    "Campers discuss the challenge and form new bonds."
  ];
}

// ELIMINATION PHASE (unchanged placeholder)
export function runEliminationPhase(state) {
  const remaining = state.currentCast.filter(
    c => c.id !== state.lastChallengeResult.winner.camperId
  );

  const eliminated =
    remaining[Math.floor(Math.random() * remaining.length)];

  state.eliminated.push(eliminated);
  state.currentCast = state.currentCast.filter(c => c.id !== eliminated.id);

  addTrackRecordEntry(state, eliminated.id, state.episodeNumber, "OUT");

  state.lastElimination = eliminated;

  return eliminated;
}
