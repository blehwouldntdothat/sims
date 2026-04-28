import { campers } from "../data/campers.js";

export const EpisodePhase = {
  CHALLENGE: "challenge",
  POST_CHALLENGE: "post-challenge",
  ELIMINATION: "elimination",
};

export function createInitialState() {
  return {
    allCampers: campers,
    currentCast: [],
    relationships: {}, // key: "idA|idB" -> score
    alliances: [], // { id, members: [ids] }
    episodeNumber: 1,
    phase: EpisodePhase.CHALLENGE,
    eliminated: [],
    jury: [],
    trackRecord: {}, // camperId -> [{ episode, result }]
    advantages: {
      found: [], // { camperId, advantageId, used: bool }
      remainingIdols: 2,
      remainingVoteSteals: 1,
    },
    config: {
      premiereFormat: "normal",
      returningFormat: "none",
      seasonFormat: "regular",
      finaleFormat: "top2",
    },
    lastChallengeResult: null,
    lastEvents: [],
    lastElimination: null,
  };
}

// ⭐ ADD THIS — the missing export
export const state = createInitialState();

