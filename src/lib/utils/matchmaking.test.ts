import { describe, expect, it } from "vitest";
import {
  canJoinLobby,
  findBestRankedMatchCandidate,
  getLobbyPauseBudgetSeconds,
  type RankedQueueEntry,
} from "@/lib/utils/matchmaking";

const NOW = Date.UTC(2026, 0, 1, 10, 0, 0);

function entry(overrides: Partial<RankedQueueEntry>): RankedQueueEntry {
  return {
    userId: "u-default",
    points: 1500,
    scopeType: "general",
    scopeKey: "general",
    queuedAt: NOW - 15_000,
    ...overrides,
  };
}

describe("matchmaking helpers", () => {
  it("validates lobby capacity with default and custom max", () => {
    expect(canJoinLobby(29)).toBe(true);
    expect(canJoinLobby(30)).toBe(false);

    expect(canJoinLobby(7, 8)).toBe(true);
    expect(canJoinLobby(8, 8)).toBe(false);
  });

  it("computes a pause budget with min and max guardrails", () => {
    expect(getLobbyPauseBudgetSeconds(900)).toBe(90);
    expect(getLobbyPauseBudgetSeconds(100)).toBe(30);
    expect(getLobbyPauseBudgetSeconds(5_000)).toBe(120);
  });
});

describe("findBestRankedMatchCandidate", () => {
  it("returns null when no candidate is compatible", () => {
    const target = entry({ userId: "target", points: 1500 });

    const queue = [
      entry({ userId: "target", points: 1510 }),
      entry({ userId: "different-scope", scopeType: "category", scopeKey: "science" }),
      entry({ userId: "incompatible-tier", points: 3200 }),
    ];

    expect(findBestRankedMatchCandidate(queue, target, NOW)).toBeNull();
  });

  it("prefers the lowest fit score, including wait time bias", () => {
    const target = entry({ userId: "target", points: 1500, queuedAt: NOW - 20_000 });

    const queue = [
      entry({ userId: "close-gap", points: 1490, queuedAt: NOW - 10_000 }),
      entry({ userId: "patient", points: 1540, queuedAt: NOW - 180_000 }),
      entry({ userId: "far-gap", points: 1850, queuedAt: NOW - 60_000 }),
    ];

    const best = findBestRankedMatchCandidate(queue, target, NOW);
    expect(best?.entry.userId).toBe("patient");
    expect(best?.waitSeconds).toBe(180);
    expect(best?.fitScore).toBeLessThan(0);
  });

  it("uses deterministic tie breakers: gap first, then wait", () => {
    const target = entry({ userId: "target", points: 1500, queuedAt: NOW - 120_000 });

    const queue = [
      entry({ userId: "larger-gap", points: 1525, queuedAt: NOW - 145_000 }),
      entry({ userId: "smaller-gap", points: 1520, queuedAt: NOW - 140_000 }),
    ];

    const best = findBestRankedMatchCandidate(queue, target, NOW);
    expect(best?.entry.userId).toBe("smaller-gap");
  });
});
