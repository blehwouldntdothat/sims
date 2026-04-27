export const advantageTypes = {
  IDOL: "idol",
  VOTE_STEAL: "vote-steal",
};

export const advantagesConfig = {
  maxIdolsPerSeason: 2,
  maxVoteStealsPerSeason: 1,
};

export const advantagesList = [
  {
    id: "hidden-immunity-idol",
    type: advantageTypes.IDOL,
    name: "Hidden Immunity Idol",
    description: "Cancels all votes cast against the holder at one ceremony.",
  },
  {
    id: "vote-steal",
    type: advantageTypes.VOTE_STEAL,
    name: "Vote Steal",
    description: "Steal another camper's vote and vote twice.",
  },
];
