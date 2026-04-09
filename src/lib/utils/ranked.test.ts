import { describe, expect, it } from "vitest";
import {
  RANKED_TIERS,
  TARGET_MATCH_DURATION_SECONDS,
  areTiersCompatible,
  computeRankedDelta,
  computeRankedDeltaFromScore,
  getAllowedOpponentTierKeys,
  getNextTier,
  getRankedScopeTargets,
  getTierFromPoints,
  getTierProgress,
  normalizeCategoryScope,
  parseCategoryPath,
} from "@/lib/utils/ranked";

describe("ranked tiers", () => {
  it("maps point thresholds to the expected tier", () => {
    expect(getTierFromPoints(-100).key).toBe("rookie");

    for (const tier of RANKED_TIERS) {
      expect(getTierFromPoints(tier.minPoints).key).toBe(tier.key);
    }

    for (let i = 1; i < RANKED_TIERS.length; i += 1) {
      const beforeThreshold = RANKED_TIERS[i].minPoints - 1;
      expect(getTierFromPoints(beforeThreshold).key).toBe(RANKED_TIERS[i - 1].key);
    }
  });

  it("returns next tier and null when already max tier", () => {
    expect(getNextTier(1450)?.key).toBe("platinum");
    expect(getNextTier(10_000)).toBeNull();
  });

  it("computes tier progress in [0, 1]", () => {
    expect(getTierProgress(1450)).toBe(0);
    expect(getTierProgress(1650)).toBeCloseTo(0.5, 5);
    expect(getTierProgress(9999)).toBe(1);
  });

  it("computes allowed adjacent opponents", () => {
    expect(getAllowedOpponentTierKeys("gold")).toEqual(["gold", "silver", "platinum"]);
    expect(getAllowedOpponentTierKeys("unknown")).toEqual(["unknown"]);
  });

  it("checks compatibility based on adjacent tiers", () => {
    expect(areTiersCompatible(1500, 1200)).toBe(true);
    expect(areTiersCompatible(1500, 500)).toBe(false);
  });
});

describe("ranked scopes and categories", () => {
  it("normalizes category scope from path, fallback or default", () => {
    expect(normalizeCategoryScope([" Science ", " Biology "])).toBe("Science > Biology");
    expect(normalizeCategoryScope(null, "  History ")).toBe("History");
    expect(normalizeCategoryScope(null)).toBe("General");
  });

  it("builds scope targets with lowercase category key", () => {
    expect(getRankedScopeTargets(null)).toEqual([{ scopeType: "general", scopeKey: "general" }]);
    expect(getRankedScopeTargets(["Science", "Biology"])).toEqual([
      { scopeType: "general", scopeKey: "general" },
      { scopeType: "category", scopeKey: "science > biology" },
    ]);
  });

  it("parses category strings with different separators and caps depth", () => {
    expect(parseCategoryPath("Science / Biology > DNA")).toEqual(["Science", "Biology", "DNA"]);
    expect(parseCategoryPath("a > b > c > d > e > f > g")).toEqual(["a", "b", "c", "d", "e", "f"]);
  });
});

describe("ranked delta", () => {
  it("keeps computed values inside expected safety bounds on a large matrix", () => {
    const totals = [1, 5, 10, 20];

    for (let points = 0; points <= 4200; points += 210) {
      for (const totalQuestions of totals) {
        for (let correctAnswers = -2; correctAnswers <= totalQuestions + 2; correctAnswers += 1) {
          const result = computeRankedDeltaFromScore({
            currentPoints: points,
            correctAnswers,
            totalQuestions,
            opponentPoints: 1800,
            durationSeconds: TARGET_MATCH_DURATION_SECONDS,
            pauseCount: 2,
          });

          expect(result.accuracy).toBeGreaterThanOrEqual(0);
          expect(result.accuracy).toBeLessThanOrEqual(1);
          expect(result.actualScore).toBeGreaterThanOrEqual(0);
          expect(result.actualScore).toBeLessThanOrEqual(1);
          expect(result.expectedScore).toBeGreaterThanOrEqual(0);
          expect(result.expectedScore).toBeLessThanOrEqual(1);
          expect(result.delta).toBeGreaterThanOrEqual(-95);
          expect(result.delta).toBeLessThanOrEqual(95);
          expect(result.nextPoints).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it("applies won/lost clamps to actual score", () => {
    const forcedWin = computeRankedDeltaFromScore({
      currentPoints: 1200,
      correctAnswers: 2,
      totalQuestions: 10,
      wonMatch: true,
    });

    const forcedLoss = computeRankedDeltaFromScore({
      currentPoints: 1200,
      correctAnswers: 9,
      totalQuestions: 10,
      wonMatch: false,
    });

    expect(forcedWin.actualScore).toBe(0.6);
    expect(forcedLoss.actualScore).toBe(0.4);
  });

  it("applies pace and pause adjustments", () => {
    const normal = computeRankedDeltaFromScore({
      currentPoints: 1200,
      correctAnswers: 7,
      totalQuestions: 10,
      durationSeconds: TARGET_MATCH_DURATION_SECONDS,
      pauseCount: 1,
    });

    const tooFast = computeRankedDeltaFromScore({
      currentPoints: 1200,
      correctAnswers: 7,
      totalQuestions: 10,
      durationSeconds: Math.floor(TARGET_MATCH_DURATION_SECONDS * 0.4),
      pauseCount: 1,
    });

    const tooSlow = computeRankedDeltaFromScore({
      currentPoints: 1200,
      correctAnswers: 7,
      totalQuestions: 10,
      durationSeconds: Math.ceil(TARGET_MATCH_DURATION_SECONDS * 1.7),
      pauseCount: 1,
    });

    const paused = computeRankedDeltaFromScore({
      currentPoints: 1200,
      correctAnswers: 7,
      totalQuestions: 10,
      durationSeconds: TARGET_MATCH_DURATION_SECONDS,
      pauseCount: 4,
    });

    expect(normal.paceAdjustment).toBe(4);
    expect(tooFast.paceAdjustment).toBe(-6);
    expect(tooSlow.paceAdjustment).toBe(-4);
    expect(paused.pausePenalty).toBe(6);
    expect(paused.delta).toBeLessThan(normal.delta);
  });

  it("wrapper returns coherent gain/loss metrics", () => {
    const positive = computeRankedDelta({
      currentPoints: 1200,
      correctAnswers: 9,
      totalQuestions: 10,
    });

    const negative = computeRankedDelta({
      currentPoints: 1200,
      correctAnswers: 1,
      totalQuestions: 10,
    });

    expect(positive.wrongAnswers).toBe(1);
    expect(positive.gainPerCorrect).toBeGreaterThanOrEqual(1);
    expect(positive.nextPoints).toBeGreaterThanOrEqual(1200);

    expect(negative.wrongAnswers).toBe(9);
    expect(negative.lossPerWrong).toBeGreaterThanOrEqual(1);
    expect(negative.nextPoints).toBeLessThanOrEqual(1200);
  });
});
