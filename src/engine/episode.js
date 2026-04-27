import { EpisodePhase } from "./state.js";
import { runChallenge } from "./challengeEngine.js";
import { relationshipEvents } from "../data/events.js";
import { applyEventToPair } from "./relationships.js";
import { addTrackRecordEntry } from "./trackRecord.js";
import { maybeFindAdvantages, applyAdvantagesToVotes } from "./advantagesEngine.js";

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function runIntroPhase(state) {
  state.lastEvents = [];
  state.lastChallengeResult = null;
  state.lastElimination = null;
}

export function runChallengePhase(state) {
  const result = runChallenge(state, "normal");
  maybeFindAdvantages(state);

  // Mark challenge winner in track record
  if (result && result.ranking && result.ranking.length > 0) {
    const top = result.ranking[0];
    addTrackRecordEntry(state, top.camperId, state.episodeNumber, "WIN");
  }

  state.lastEvents = [];
  state.lastElimination = null;
  return result;
}

export function runPostChallengePhase(state) {
  const cast = state.currentCast;
  const events = [];

  if (cast.length >= 2) {
    for (let i = 0; i < 3; i++) {
      const a = randomChoice(cast);
      let b = randomChoice(cast);

      if (a.id === b.id && cast.length > 1) {
        b = cast.find(c => c.id !== a.id);
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

  // FINALE: 2 or fewer left
  if (cast.length <= 2) {
    if (cast.length === 1) {
      const winner = cast[0];
      addTrackRecordEntry(state, winner.id, state.episodeNumber, "WINNER");
      state.lastElimination = {
        type: "finale",
        winnerId: winner.id,
        runnerId: null,
      };
      return state.lastElimination;
    }

    const [a, b] = cast;
    const winner = randomChoice([a, b]);
    const runner = winner.id === a.id ? b : a;

    addTrackRecordEntry(state, winner.id, state.episodeNumber, "WINNER");
    addTrackRecordEntry(state, runner.id, state.episodeNumber, "RUNNER");

    // Winner stays in currentCast, runner joins eliminated
    state.currentCast = [winner];
    state.eliminated.push({
      ...runner,
      _elimOrder: state.eliminated.length + 1,
    });

    state.lastElimination = {
      type: "finale",
      winnerId: winner.id,
      runnerId: runner.id,
    };

    return state.lastElimination;
  }

  // NORMAL ELIMINATION
  const votes = [];
  for (const voter of cast) {
    const target = randomChoice(cast.filter(c => c.id !== voter.id));
    votes.push({ voterId: voter.id, targetId: target.id });
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

  const eliminatedId =
    targets.length === 1 ? targets[0] : randomChoice(targets);

  const eliminatedIndex = state.currentCast.findIndex(c => c.id === eliminatedId);
  const eliminated = state.currentCast[eliminatedIndex];

  state.currentCast.splice(eliminatedIndex, 1);
  state.eliminated.push({
    ...eliminated,
    _elimOrder: state.eliminated.length + 1,
  });

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
    state.episodeNumber += 1;
    state.phase = EpisodePhase.CHALLENGE;
    runChallengePhase(state);
  }
}
