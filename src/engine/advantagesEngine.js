import { advantageTypes, advantagesList, advantagesConfig } from "../data/advantages.js";

function randomFloat() {
  return Math.random();
}

export function maybeFindAdvantages(state) {
  // simple: small chance each episode for someone to find an idol or vote steal
  const cast = state.currentCast;
  if (!cast.length) return;

  // Idol
  if (state.advantages.remainingIdols > 0 && randomFloat() < 0.2) {
    const finder = cast[Math.floor(Math.random() * cast.length)];
    state.advantages.remainingIdols -= 1;
    state.advantages.found.push({
      camperId: finder.id,
      advantageId: "hidden-immunity-idol",
      used: false,
    });
  }

  // Vote steal
  if (state.advantages.remainingVoteSteals > 0 && randomFloat() < 0.1) {
    const finder = cast[Math.floor(Math.random() * cast.length)];
    state.advantages.remainingVoteSteals -= 1;
    state.advantages.found.push({
      camperId: finder.id,
      advantageId: "vote-steal",
      used: false,
    });
  }
}

export function applyAdvantagesToVotes(state, votes) {
  // votes: array of { voterId, targetId }
  const newVotes = [...votes];

  // handle vote steal
  const voteSteals = state.advantages.found.filter(
    (a) => !a.used && a.advantageId === "vote-steal"
  );

  for (const vs of voteSteals) {
    const holderId = vs.camperId;
    const holderVotes = newVotes.filter((v) => v.voterId === holderId);
    if (!holderVotes.length) continue;

    // steal from a random other voter
    const others = newVotes.filter((v) => v.voterId !== holderId);
    if (!others.length) continue;

    const stolen = others[Math.floor(Math.random() * others.length)];
    // add an extra vote for holder to same target as their original vote
    newVotes.push({
      voterId: holderId,
      targetId: holderVotes[0].targetId,
      note: "vote-steal",
    });

    vs.used = true;
  }

  // handle idols: if holder has idol and would be eliminated, cancel votes
  const idols = state.advantages.found.filter(
    (a) => !a.used && a.advantageId === "hidden-immunity-idol"
  );

  const voteCounts = {};
  for (const v of newVotes) {
    voteCounts[v.targetId] = (voteCounts[v.targetId] || 0) + 1;
  }

  const maxVotes = Math.max(...Object.values(voteCounts || { 0: 0 }));
  const topTargets = Object.entries(voteCounts)
    .filter(([, count]) => count === maxVotes)
    .map(([id]) => id);

  for (const idol of idols) {
    if (topTargets.includes(idol.camperId)) {
      // cancel all votes against holder
      for (let i = newVotes.length - 1; i >= 0; i--) {
        if (newVotes[i].targetId === idol.camperId) {
          newVotes.splice(i, 1);
        }
      }
      idol.used = true;
    }
  }

  return newVotes;
}
