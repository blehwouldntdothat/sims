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
    description: "Race through mud pits, walls, ropes, and hazards to reach the finish line first.",
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
    description: "Climb a tower by solving brain teasers and unlocking each new level.",
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
    description: "Put on a wild performance with singing, rhythm, and stage presence.",
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
    description: "Build and light a fire before your opponent in a high-pressure duel.",
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
    description: "Defeated players battle through a brutal course for a second chance.",
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
    description: "The ultimate all-around challenge testing every skill one last time.",
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
    description: "A fast and ruthless one-on-one clash where only one survives.",
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
