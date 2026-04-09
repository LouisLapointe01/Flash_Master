import { bench, describe } from "vitest";
import {
  getTierFromPoints,
  getNextTier,
  getTierProgress,
  computeRankedDelta,
  normalizeCategoryScope,
  getRankedScopeTargets,
  parseCategoryPath,
} from "@/lib/utils/ranked";

// ─── Calcul de tier ───────────────────────────────────────────────────────────

describe("Ranked — calcul de tier", () => {
  bench("getTierFromPoints — Rookie (0)", () => {
    getTierFromPoints(0);
  });

  bench("getTierFromPoints — Gold (1500)", () => {
    getTierFromPoints(1500);
  });

  bench("getTierFromPoints — Grandmaster (3500)", () => {
    getTierFromPoints(3500);
  });

  bench("getNextTier — depuis Bronze", () => {
    getNextTier(900);
  });

  bench("getTierProgress — progression à mi-chemin", () => {
    getTierProgress(1625);
  });

  bench("getTierProgress — au maximum (Grandmaster)", () => {
    getTierProgress(9999);
  });
});

// ─── Calcul de delta ──────────────────────────────────────────────────────────

describe("Ranked — calcul de delta", () => {
  bench("quiz parfait (10/10) — joueur débutant", () => {
    computeRankedDelta({ currentPoints: 0, correctAnswers: 10, totalQuestions: 10 });
  });

  bench("quiz parfait (10/10) — joueur avancé (2500 pts)", () => {
    computeRankedDelta({ currentPoints: 2500, correctAnswers: 10, totalQuestions: 10 });
  });

  bench("quiz raté (0/10) — impact négatif", () => {
    computeRankedDelta({ currentPoints: 1500, correctAnswers: 0, totalQuestions: 10 });
  });

  bench("quiz moyen (6/10) — résultat mixte", () => {
    computeRankedDelta({ currentPoints: 1200, correctAnswers: 6, totalQuestions: 10 });
  });
});

// ─── Scope & catégories ───────────────────────────────────────────────────────

describe("Ranked — scopes et catégories", () => {
  const pathSimple = ["Mathématiques"];
  const pathProfond = ["Sciences", "Biologie", "Génétique", "ADN", "Mutations"];

  bench("normalizeCategoryScope — chemin simple", () => {
    normalizeCategoryScope(pathSimple);
  });

  bench("normalizeCategoryScope — chemin profond (5 niveaux)", () => {
    normalizeCategoryScope(pathProfond);
  });

  bench("normalizeCategoryScope — null avec fallback", () => {
    normalizeCategoryScope(null, "Histoire");
  });

  bench("getRankedScopeTargets — catégorie générale", () => {
    getRankedScopeTargets(null);
  });

  bench("getRankedScopeTargets — catégorie spécifique", () => {
    getRankedScopeTargets(pathSimple);
  });

  bench("parseCategoryPath — format slash", () => {
    parseCategoryPath("Sciences / Biologie / Génétique");
  });

  bench("parseCategoryPath — format arrow", () => {
    parseCategoryPath("Sciences > Biologie > Génétique > ADN");
  });
});

// ─── Simulation de parties ────────────────────────────────────────────────────

describe("Ranked — simulation de saison complète", () => {
  bench("100 parties consécutives avec progression de tier", () => {
    let points = 0;
    for (let i = 0; i < 100; i++) {
      const correct = Math.floor(i % 11);
      const result = computeRankedDelta({
        currentPoints: points,
        correctAnswers: correct,
        totalQuestions: 10,
      });
      points = result.nextPoints;
      getTierFromPoints(points);
      getTierProgress(points);
    }
  });
});
