import { afterEach, describe, expect, it, vi } from "vitest";
import { calculateSM2, qualityFromDifficulty } from "@/lib/utils/spaced-repetition";

afterEach(() => {
  vi.useRealTimers();
});

describe("qualityFromDifficulty", () => {
  it("maps each difficulty to the expected quality value", () => {
    expect(qualityFromDifficulty("again")).toBe(1);
    expect(qualityFromDifficulty("hard")).toBe(2);
    expect(qualityFromDifficulty("good")).toBe(4);
    expect(qualityFromDifficulty("easy")).toBe(5);
  });
});

describe("calculateSM2", () => {
  it("resets interval on failed recall", () => {
    const result = calculateSM2({
      quality: 2,
      easeFactor: 2.4,
      intervalDays: 20,
      reviewCount: 8,
    });

    expect(result.intervalDays).toBe(1);
    expect(result.proficiency).toBe(4);
  });

  it("uses first and second interval defaults for early reviews", () => {
    const firstReview = calculateSM2({
      quality: 4,
      easeFactor: 2.5,
      intervalDays: 3,
      reviewCount: 0,
    });

    const secondReview = calculateSM2({
      quality: 4,
      easeFactor: 2.5,
      intervalDays: 3,
      reviewCount: 1,
    });

    expect(firstReview.intervalDays).toBe(1);
    expect(secondReview.intervalDays).toBe(6);
  });

  it("uses multiplicative interval growth after second review", () => {
    const result = calculateSM2({
      quality: 5,
      easeFactor: 2.5,
      intervalDays: 10,
      reviewCount: 2,
    });

    expect(result.easeFactor).toBe(2.6);
    expect(result.intervalDays).toBe(26);
    expect(result.proficiency).toBe(10);
  });

  it("clamps quality and enforces minimum ease factor", () => {
    const result = calculateSM2({
      quality: -10,
      easeFactor: 0.5,
      intervalDays: 30,
      reviewCount: 6,
    });

    expect(result.easeFactor).toBe(1.3);
    expect(result.intervalDays).toBe(1);
    expect(result.proficiency).toBe(0);
  });

  it("computes nextReview from current clock time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-01T10:00:00.000Z"));

    const result = calculateSM2({
      quality: 4,
      easeFactor: 2.5,
      intervalDays: 6,
      reviewCount: 2,
    });

    expect(result.intervalDays).toBe(15);
    expect(result.nextReview.toISOString()).toBe("2026-02-16T10:00:00.000Z");
  });
});
