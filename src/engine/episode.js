import { EpisodePhase } from "./state.js";
import { runChallenge } from "./challengeEngine.js";
import { relationshipEvents } from "../data/events.js";
import { applyEventToPair, modifyRelationship } from "./relationships.js";
import { addTrackRecordEntry } from "./trackRecord.js";
import { maybeFindAdvantages, applyAdvantagesToVotes } from "./advantagesEngine.js";

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function runChallengePhase(state) {
  const result = runChallenge(state, "normal");
  maybeFindAdvantages(state);

  state.lastEvents = [];
  state.lastElimination = null;
  return result;
}

export function runPostChallengePhase(state) {
  const cast = state.currentCast;
  const events = [];

  if (cast.length >= 2) {
    // generate a few random relationship events
    for (let i = 0; i < 3; i++) {
      const a = randomChoice(cast);
      let b = randomChoice(cast);
      if (a.id === b.id && cast.length > 1) {
        b = randomChoice(cast.filter((c) => c.id !== a.id));
      }
      const ev = randomChoice(relationshipEvents);
      applyEventToPair(state, ev, a.id, b.id);
      events.push({
        aId: a.id,
        bId: b.id,
        text: ev.description.replace("{a}", a.name).replace("{b}", b.name),
      });
    }
  }

  state.lastEvents = events;
  return events;
}

export function runEliminationPhase(state) {
  const cast = state.currentCast;
  if (cast.length <= 2) {
    // finale logic placeholder
    const winner = randomChoice(cast);
    state.lastElimination = {
      type: "finale",
      winnerId: winner.id,
      eliminatedId: null,
    };
    addTrackRecordEntry(state, winner.id, state.episodeNumber, "WINNER");
    return state.lastElimination;
  }

  // simple voting: everyone votes for someone they like least (low relationship)
  const votes = [];
  for (const voter of cast) {
    let worstTarget = null;
    let worstScore = Infinity;
    for (const target of cast) {
      if (target.id === voter.id) continue;
      const rel = 0; // you can plug getRelationship here if you want
      if (rel < worstScore) {
        worstScore = rel;
        worstTarget = target;
      }
    }
    if (worstTarget) {
      votes.push({ voterId: voter.id, targetId: worstTarget.id });
    }
  }

  const adjustedVotes = applyAdvantagesToVotes(state, votes);

  const counts = {};
  for (const v of adjustedVotes) {
    counts[v.targetId] = (counts[v.targetId] || 0) + 1;
  }

  let max = -1;
  let targets = [];
  for (const [id, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      targets = [id];
    } else if (count === max) {
      targets.push(id);
    }
  }

  let eliminatedId;
  if (targets.length === 1) {
    eliminatedId = targets[0];
  } else {
    // tiebreaker challenge placeholder: random among tied
    eliminatedId = randomChoice(targets);
  }

  const eliminatedIndex = state.currentCast.findIndex((c) => c.id === eliminatedId);
  const eliminated = state.currentCast[eliminatedIndex];

  state.currentCast.splice(eliminatedIndex, 1);
  state.eliminated.push(eliminated);

  addTrackRecordEntry(state, eliminated.id, state.episodeNumber, "ELIM");

  state.lastElimination = {
    type: "normal",
    eliminatedId: eliminated.id,
    eliminatedName: eliminated.name,
    votes: counts,
  };

  return state.lastElimination;
}

export function advancePhase(state) {
  if (state.phase === EpisodePhase.CHALLENGE) {
    runChallengePhase(state);
    state.phase = EpisodePhase.POST_CHALLENGE;
  } else if (state.phase === EpisodePhase.POST_CHALLENGE) {
    runPostChallengePhase(state);
    state.phase = EpisodePhase.ELIMINATION;
  } else if (state.phase === EpisodePhase.ELIMINATION) {
    runEliminationPhase(state);
    state.episodeNumber += 1;
    state.phase = EpisodePhase.CHALLENGE;
  }
}
