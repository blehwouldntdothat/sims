export const challengePhases = {
  NORMAL: "normal",
  TIEBREAKER: "tiebreaker",
  REJOIN: "rejoin",
  FINALE: "finale",
  SUDDEN_DEATH: "sudden-death",
};

export const challenges = [
  {
    id: "obstacle-course",
    name: "Camp Obstacle Course",
    type: "physical",
    phase: challengePhases.NORMAL,
    weights: {
      strength: 0.3,
      agility: 0.4,
      stamina: 0.3,
    },
    traitBoosts: {
      Athletic: 2,
      "Parkour Expert": 3,
    },
  },
  {
    id: "puzzle-tower",
    name: "Puzzle Tower",
    type: "mental",
    phase: challengePhases.NORMAL,
    weights: {
      intelligence: 0.6,
      stamina: 0.2,
      luck: 0.2,
    },
    traitBoosts: {
      Smart: 2,
      "Puzzle Master": 3,
    },
  },
  {
    id: "musical-showdown",
    name: "Musical Showdown",
    type: "musical",
    phase: challengePhases.NORMAL,
    weights: {
      skill: 0.4,
      intelligence: 0.2,
      luck: 0.2,
      stamina: 0.2,
    },
    traitBoosts: {
      "Good Singer": 4,
      Performer: 2,
    },
  },
  {
    id: "fire-making-tiebreaker",
    name: "Fire-Making Tiebreaker",
    type: "tiebreaker",
    phase: challengePhases.TIEBREAKER,
    weights: {
      skill: 0.4,
      stamina: 0.3,
      luck: 0.3,
    },
    traitBoosts: {
      "Outdoor Expert": 3,
    },
  },
  {
    id: "rejoin-gauntlet",
    name: "Rejoin Gauntlet",
    type: "rejoin",
    phase: challengePhases.REJOIN,
    weights: {
      stamina: 0.4,
      agility: 0.3,
      luck: 0.3,
    },
    traitBoosts: {
      Determined: 3,
    },
  },
  {
    id: "finale-showdown",
    name: "Finale Showdown",
    type: "finale",
    phase: challengePhases.FINALE,
    weights: {
      strength: 0.2,
      agility: 0.2,
      stamina: 0.2,
      intelligence: 0.2,
      skill: 0.2,
    },
    traitBoosts: {
      "Fan Favorite": 2,
      "Challenge Beast": 3,
    },
  },
  {
    id: "sudden-death-duel",
    name: "Sudden Death Duel",
    type: "sudden-death",
    phase: challengePhases.SUDDEN_DEATH,
    weights: {
      strength: 0.3,
      agility: 0.3,
      luck: 0.4,
    },
    traitBoosts: {
      "Clutch Player": 3,
    },
  },
];
