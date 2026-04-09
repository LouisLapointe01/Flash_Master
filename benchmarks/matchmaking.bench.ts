import { bench, describe } from "vitest";
import {
  canJoinLobby,
  findBestRankedMatchCandidate,
  getLobbyPauseBudgetSeconds,
  type RankedQueueEntry,
} from "@/lib/utils/matchmaking";

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0);
const SCOPE_KEY = "science > biology";

function makeTarget(points: number, queuedAt: number, userId = "target"): RankedQueueEntry {
  return {
    userId,
    points,
    scopeType: "category",
    scopeKey: SCOPE_KEY,
    queuedAt,
  };
}

function buildQueue(size: number, targetPoints: number): RankedQueueEntry[] {
  const offsets = [-260, -180, -90, -40, -20, -10, 0, 10, 20, 35, 60, 95, 140, 210];
  const queue: RankedQueueEntry[] = [];

  for (let i = 0; i < size; i += 1) {
    const offset = offsets[i % offsets.length];
    queue.push({
      userId: `user-${i}`,
      points: targetPoints + offset,
      scopeType: i % 7 === 0 ? "general" : "category",
      scopeKey: i % 7 === 0 ? "general" : SCOPE_KEY,
      queuedAt: NOW - ((i % 180) + 1) * 1000,
    });
  }

  return queue;
}

const target = makeTarget(1500, NOW - 20_000);
const queue100 = buildQueue(100, target.points);
const queue1000 = buildQueue(1000, target.points);
const queue5000 = buildQueue(5000, target.points);
const dynamicTargets = Array.from({ length: 300 }, (_, i) =>
  makeTarget(1300 + (i % 40) * 20, NOW - ((i % 90) + 5) * 1000, `target-${i}`)
);

describe("Matchmaking helpers", () => {
  bench("canJoinLobby calls", () => {
    canJoinLobby(12);
    canJoinLobby(30);
    canJoinLobby(24, 25);
  });

  bench("getLobbyPauseBudgetSeconds calls", () => {
    getLobbyPauseBudgetSeconds(600);
    getLobbyPauseBudgetSeconds(900);
    getLobbyPauseBudgetSeconds(5000);
  });
});

describe("Matchmaking candidate search", () => {
  bench("find best candidate in queue of 100", () => {
    findBestRankedMatchCandidate(queue100, target, NOW);
  });

  bench("find best candidate in queue of 1,000", () => {
    findBestRankedMatchCandidate(queue1000, target, NOW);
  });

  bench("find best candidate in queue of 5,000", () => {
    findBestRankedMatchCandidate(queue5000, target, NOW);
  });

  bench("simulate 300 consecutive matchmaking decisions", () => {
    for (const dynamicTarget of dynamicTargets) {
      findBestRankedMatchCandidate(queue1000, dynamicTarget, NOW);
    }
  });
});
