import { bench, describe } from "vitest";
import {
  calculateSM2,
  qualityFromDifficulty,
} from "@/lib/utils/spaced-repetition";

// ─── Calcul unitaire ──────────────────────────────────────────────────────────

describe("SM-2 — calcul unitaire", () => {
  bench("qualité parfaite (5) — première révision", () => {
    calculateSM2({ quality: 5, easeFactor: 2.5, intervalDays: 1, reviewCount: 0 });
  });

  bench("qualité parfaite (5) — révision avancée", () => {
    calculateSM2({ quality: 5, easeFactor: 2.5, intervalDays: 30, reviewCount: 10 });
  });

  bench("qualité médiocre (2) — réinitialisation", () => {
    calculateSM2({ quality: 2, easeFactor: 2.5, intervalDays: 30, reviewCount: 10 });
  });

  bench("qualité limite (3) — passage/échec", () => {
    calculateSM2({ quality: 3, easeFactor: 1.3, intervalDays: 6, reviewCount: 2 });
  });

  bench("qualityFromDifficulty — les 4 niveaux", () => {
    qualityFromDifficulty("again");
    qualityFromDifficulty("hard");
    qualityFromDifficulty("good");
    qualityFromDifficulty("easy");
  });
});

// ─── Traitement en lot ────────────────────────────────────────────────────────

describe("SM-2 — traitement en lot", () => {
  const cards100 = Array.from({ length: 100 }, (_, i) => ({
    quality: (i % 6) as 0 | 1 | 2 | 3 | 4 | 5,
    easeFactor: 1.3 + (i % 20) * 0.06,
    intervalDays: 1 + (i % 30),
    reviewCount: i % 15,
  }));

  const cards1000 = Array.from({ length: 1000 }, (_, i) => ({
    quality: (i % 6) as 0 | 1 | 2 | 3 | 4 | 5,
    easeFactor: 1.3 + (i % 20) * 0.06,
    intervalDays: 1 + (i % 90),
    reviewCount: i % 50,
  }));

  bench("100 cartes — session d'étude complète", () => {
    for (const card of cards100) calculateSM2(card);
  });

  bench("1 000 cartes — révision massive", () => {
    for (const card of cards1000) calculateSM2(card);
  });

  bench("simulation d'une progression complète (50 révisions, même carte)", () => {
    let state = { easeFactor: 2.5, intervalDays: 1, reviewCount: 0 };
    for (let i = 0; i < 50; i++) {
      const quality = i % 2 === 0 ? 4 : 5;
      const result = calculateSM2({ quality, ...state });
      state = {
        easeFactor: result.easeFactor,
        intervalDays: result.intervalDays,
        reviewCount: state.reviewCount + 1,
      };
    }
  });
});
