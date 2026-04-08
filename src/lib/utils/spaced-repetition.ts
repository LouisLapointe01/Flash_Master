/**
 * SM-2 Algorithm implementation for spaced repetition.
 * Quality: 0-5 (0=complete blackout, 5=perfect response)
 */

interface SM2Input {
  quality: number; // 0-5
  easeFactor: number;
  intervalDays: number;
  reviewCount: number;
}

interface SM2Result {
  easeFactor: number;
  intervalDays: number;
  nextReview: Date;
  proficiency: number; // 0-10
}

export function calculateSM2({
  quality,
  easeFactor,
  intervalDays,
  reviewCount,
}: SM2Input): SM2Result {
  // Clamp quality
  const q = Math.max(0, Math.min(5, quality));

  // Calculate new ease factor
  let newEF = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  newEF = Math.max(1.3, newEF);

  let newInterval: number;

  if (q < 3) {
    // Failed — reset
    newInterval = 1;
  } else if (reviewCount === 0) {
    newInterval = 1;
  } else if (reviewCount === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(intervalDays * newEF);
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  // Convert quality (0-5) to proficiency (0-10)
  const proficiency = Math.round((q / 5) * 10);

  return {
    easeFactor: Math.round(newEF * 100) / 100,
    intervalDays: newInterval,
    nextReview,
    proficiency,
  };
}

export function qualityFromDifficulty(difficulty: "again" | "hard" | "good" | "easy"): number {
  switch (difficulty) {
    case "again": return 1;
    case "hard": return 2;
    case "good": return 4;
    case "easy": return 5;
  }
}
