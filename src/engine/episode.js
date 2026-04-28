import { EpisodePhase } from "./state.js";
import { state } from "./state.js";
import { challenges } from "../data/challenges.js";
import { relationshipEvents } from "../data/events.js";

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

// Pick a random event
function pickRandomEvent() {
  return relationshipEvents[Math.floor(Math.random() * relationshipEvents.length)];
}

// Get random camper from a list
function getRandomCamper(campers) {
  return campers[Math.floor(Math.random() * campers.length)];
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
    winner,
    isFinale: false
  };

  return state.lastChallengeResult;
}

// POST-CHALLENGE PHASE: Random events from events.js
export function runPostChallengePhase(state) {
  state.lastEvents = [];

  // Generate 1-2 random events
  const eventCount = Math.random() > 0.5 ? 2 : 1;

  for (let i = 0; i < eventCount; i++) {
    const event = pickRandomEvent();
    
    // Pick two random different campers
    let camper1 = getRandomCamper(state.currentCast);
    let camper2 = getRandomCamper(state.currentCast);
    
    while (camper2.id === camper1.id) {
      camper2 = getRandomCamper(state.currentCast);
    }

    // Fill in the event description with camper names
    const description = event.description
      .replace("{a}", camper1.name)
      .replace("{b}", camper2.name);

    state.lastEvents.push({
      text: description,
      camper1: camper1.id,
      camper2: camper2.id,
      effect: event.effect
    });
  }
}

// ELIMINATION PHASE
export function runEliminationPhase(state) {
  const remaining = state.currentCast.filter(
    c => c.id !== state.lastChallengeResult.winner.camperId
  );

  const eliminated =
    remaining[Math.floor(Math.random() * remaining.length)];

  eliminated._elimOrder = state.eliminated.length + 1;
  state.eliminated.push(eliminated);
  state.currentCast = state.currentCast.filter(c => c.id !== eliminated.id);

  addTrackRecordEntry(state, eliminated.id, state.episodeNumber, "OUT");

  state.lastElimination = eliminated;

  return eliminated;
}

// NEW: FINALE PHASE
export function runFinalePhase(state) {
  const challenge = pickChallenge();
  const finaleDescription = challenge.description || "The final challenge begins!";

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

  // Determine winner and runner-up
  const sortedByTier = performances.sort((a, b) => {
    const tierA = performanceTiers.findIndex(t => t.label === a.performance);
    const tierB = performanceTiers.findIndex(t => t.label === b.performance);
    return tierA - tierB;
  });

  const winner = sortedByTier[0];
  const runnerUp = sortedByTier.length > 1 ? sortedByTier[1] : null;

  // Track record
  addTrackRecordEntry(state, winner.camperId, state.episodeNumber, "WINNER");
  if (runnerUp) {
    addTrackRecordEntry(state, runnerUp.camperId, state.episodeNumber, "RUNNER");
  }

  // Mark all as eliminated except winner (they stay in currentCast)
  state.currentCast.forEach(camper => {
    if (camper.id !== winner.camperId) {
      camper._elimOrder = state.eliminated.length + 1;
      state.eliminated.push(camper);
    }
  });

  // Keep only winner in currentCast
  state.currentCast = state.currentCast.filter(c => c.id === winner.camperId);

  // Save result
  state.lastChallengeResult = {
    challenge,
    description: finaleDescription,
    performances,
    grouped,
    winner,
    isFinale: true
  };

  // Create finale elimination marker
  state.lastElimination = {
    type: "finale",
    winnerId: winner.name,
    runnerId: runnerUp ? runnerUp.name : null
  };

  return state.lastElimination;
}
