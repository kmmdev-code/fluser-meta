/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VoteInput {
  userId: string;
  optionId: string;
  rank: number;
}

export interface RoundResult {
  round: number;
  voteCounts: Record<string, number>;
  eliminatedOptionId?: string;
  winnerOptionId?: string;
  isTie?: boolean;
}

export function calculateIRVResults(
  options: string[],
  votes: VoteInput[]
): RoundResult[] {
  const rounds: RoundResult[] = [];
  
  // Group user votes ordered by rank: userId -> optionId[]
  const userBallots: Record<string, string[]> = {};
  
  // Clone and sort votes by rank
  const sortedVotes = [...votes].sort((a, b) => a.rank - b.rank);
  
  for (const vote of sortedVotes) {
    if (!userBallots[vote.userId]) {
      userBallots[vote.userId] = [];
    }
    // Only push if not already in ballot for this user
    if (!userBallots[vote.userId].includes(vote.optionId)) {
      userBallots[vote.userId].push(vote.optionId);
    }
  }

  let activeOptionIds = new Set(options);
  let roundNumber = 1;

  while (activeOptionIds.size > 0) {
    const voteCounts: Record<string, number> = {};
    activeOptionIds.forEach((id) => (voteCounts[id] = 0));
    let totalActiveVotes = 0;

    // Count top active choice for each ballot
    for (const userId in userBallots) {
      const ballot = userBallots[userId];
      const topChoice = ballot.find((optionId) => activeOptionIds.has(optionId));
      if (topChoice) {
        voteCounts[topChoice] = (voteCounts[topChoice] || 0) + 1;
        totalActiveVotes++;
      }
    }

    // Check for majority winner (> 50%)
    const majorityThreshold = Math.floor(totalActiveVotes / 2) + 1;
    let winnerId: string | undefined;

    for (const [optionId, count] of Object.entries(voteCounts)) {
      if (count >= majorityThreshold && totalActiveVotes > 0) {
        winnerId = optionId;
        break;
      }
    }

    if (winnerId) {
      rounds.push({
        round: roundNumber,
        voteCounts,
        winnerOptionId: winnerId,
      });
      break;
    }

    // Find lowest vote getter(s)
    let minVotes = Infinity;
    for (const count of Object.values(voteCounts)) {
      if (count < minVotes) minVotes = count;
    }

    const candidatesForElimination = Object.entries(voteCounts)
      .filter(([_, count]) => count === minVotes)
      .map(([optionId]) => optionId);

    // If all remaining options tie or no active votes remain
    if (candidatesForElimination.length === activeOptionIds.size || totalActiveVotes === 0) {
      rounds.push({
        round: roundNumber,
        voteCounts,
        isTie: true,
      });
      break;
    }

    // Eliminate lowest candidate
    const toEliminate = candidatesForElimination[0];
    activeOptionIds.delete(toEliminate);

    rounds.push({
      round: roundNumber,
      voteCounts,
      eliminatedOptionId: toEliminate,
    });

    roundNumber++;
  }

  return rounds;
}
