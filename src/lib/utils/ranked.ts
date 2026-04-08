import type { RankedScopeType } from "@/lib/types";

export type RankedTier = {
  key: string;
  label: string;
  minPoints: number;
};

export const RANKED_TIERS: RankedTier[] = [
  { key: "rookie", label: "Rookie", minPoints: 0 },
  { key: "bronze", label: "Bronze", minPoints: 800 },
  { key: "silver", label: "Silver", minPoints: 1100 },
  { key: "gold", label: "Gold", minPoints: 1450 },
  { key: "platinum", label: "Platinum", minPoints: 1850 },
  { key: "diamond", label: "Diamond", minPoints: 2300 },
  { key: "master", label: "Master", minPoints: 2850 },
  { key: "grandmaster", label: "Grandmaster", minPoints: 3500 },
];

export function getTierFromPoints(points: number) {
  let tier = RANKED_TIERS[0];
  for (const candidate of RANKED_TIERS) {
    if (points >= candidate.minPoints) {
      tier = candidate;
    }
  }
  return tier;
}

export function getNextTier(points: number) {
  const current = getTierFromPoints(points);
  const currentIndex = RANKED_TIERS.findIndex((item) => item.key === current.key);
  if (currentIndex < 0 || currentIndex >= RANKED_TIERS.length - 1) return null;
  return RANKED_TIERS[currentIndex + 1];
}

export function getTierProgress(points: number) {
  const current = getTierFromPoints(points);
  const next = getNextTier(points);
  if (!next) return 1;

  const total = next.minPoints - current.minPoints;
  if (total <= 0) return 1;
  return Math.max(0, Math.min(1, (points - current.minPoints) / total));
}

export function normalizeCategoryScope(path: string[] | null | undefined, fallbackCategory?: string | null) {
  if (path && path.length > 0) {
    return path.map((item) => item.trim()).filter(Boolean).join(" > ");
  }
  if (fallbackCategory?.trim()) return fallbackCategory.trim();
  return "General";
}

export function computeRankedDelta(params: {
  currentPoints: number;
  correctAnswers: number;
  totalQuestions: number;
}) {
  const { currentPoints, correctAnswers, totalQuestions } = params;
  const wrongAnswers = Math.max(0, totalQuestions - correctAnswers);

  const gainPerCorrect = Math.max(4, Math.round(16 - (currentPoints - 1000) / 320));
  const lossPerWrong = Math.max(10, Math.round(10 + (currentPoints - 1000) / 240));
  const rawDelta = correctAnswers * gainPerCorrect - wrongAnswers * lossPerWrong;

  const clampedDelta = Math.max(-95, Math.min(85, rawDelta));
  const nextPoints = Math.max(0, currentPoints + clampedDelta);

  return {
    wrongAnswers,
    gainPerCorrect,
    lossPerWrong,
    delta: clampedDelta,
    nextPoints,
  };
}

export function getRankedScopeTargets(path: string[] | null | undefined, fallbackCategory?: string | null) {
  const targets: { scopeType: RankedScopeType; scopeKey: string }[] = [
    { scopeType: "general", scopeKey: "general" },
  ];

  const categoryScope = normalizeCategoryScope(path, fallbackCategory);
  if (categoryScope.toLowerCase() !== "general") {
    targets.push({
      scopeType: "category",
      scopeKey: categoryScope.toLowerCase(),
    });
  }

  return targets;
}

export function parseCategoryPath(value: string) {
  return value
    .split(/>|\//)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .slice(0, 6);
}
