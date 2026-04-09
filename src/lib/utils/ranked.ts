import type { RankedScopeType } from "@/lib/types";

export type RankedTier = {
  key: string;
  label: string;
  minPoints: number;
};

export const TARGET_MATCH_DURATION_SECONDS = 15 * 60;
export const DEFAULT_LOBBY_MAX_PLAYERS = 30;

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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getTierIndex(tierKey: string) {
  return RANKED_TIERS.findIndex((item) => item.key === tierKey);
}

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
  const currentIndex = getTierIndex(current.key);
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

export function getAllowedOpponentTierKeys(tierKey: string) {
  const index = getTierIndex(tierKey);
  if (index < 0) return [tierKey];

  const keys = [tierKey];
  if (index > 0) keys.push(RANKED_TIERS[index - 1].key);
  if (index < RANKED_TIERS.length - 1) keys.push(RANKED_TIERS[index + 1].key);
  return keys;
}

export function areTiersCompatible(pointsA: number, pointsB: number) {
  const tierA = getTierFromPoints(pointsA);
  const tierB = getTierFromPoints(pointsB);
  const allowed = getAllowedOpponentTierKeys(tierA.key);
  return allowed.includes(tierB.key);
}

export function normalizeCategoryScope(path: string[] | null | undefined, fallbackCategory?: string | null) {
  if (path && path.length > 0) {
    return path.map((item) => item.trim()).filter(Boolean).join(" > ");
  }
  if (fallbackCategory?.trim()) return fallbackCategory.trim();
  return "General";
}

export function computeRankedDeltaFromScore(params: {
  currentPoints: number;
  correctAnswers: number;
  totalQuestions: number;
  opponentPoints?: number;
  durationSeconds?: number;
  pauseCount?: number;
  wonMatch?: boolean;
}) {
  const {
    currentPoints,
    correctAnswers,
    totalQuestions,
    opponentPoints = currentPoints,
    durationSeconds,
    pauseCount = 0,
    wonMatch,
  } = params;

  const safeTotal = Math.max(1, totalQuestions);
  const safeCorrect = clamp(correctAnswers, 0, safeTotal);
  const wrongAnswers = safeTotal - safeCorrect;
  const accuracy = safeCorrect / safeTotal;

  const expectedScore = 1 / (1 + 10 ** ((opponentPoints - currentPoints) / 400));
  const rawActualScore = wonMatch === undefined
    ? accuracy
    : wonMatch
      ? Math.max(0.6, accuracy)
      : Math.min(0.4, accuracy);
  const actualScore = clamp(rawActualScore, 0, 1);

  const tier = getTierFromPoints(currentPoints);
  const tierIndex = Math.max(0, getTierIndex(tier.key));
  const kFactor = Math.max(26, 52 - tierIndex * 3);
  const eloDelta = Math.round(kFactor * (actualScore - expectedScore));

  const accuracyBonus = accuracy >= 0.7
    ? Math.round((accuracy - 0.7) * 28)
    : 0;

  let paceAdjustment = 0;
  if (durationSeconds && durationSeconds > 0) {
    const durationRatio = durationSeconds / TARGET_MATCH_DURATION_SECONDS;
    if (durationRatio >= 0.8 && durationRatio <= 1.25) {
      paceAdjustment += 4;
    } else if (durationRatio < 0.5) {
      paceAdjustment -= 6;
    } else if (durationRatio > 1.6) {
      paceAdjustment -= 4;
    }
  }

  const pausePenalty = Math.max(0, pauseCount - 1) * 2;
  const rawDelta = eloDelta + accuracyBonus + paceAdjustment - pausePenalty;
  const delta = clamp(Math.round(rawDelta), -95, 95);
  const nextPoints = Math.max(0, currentPoints + delta);

  return {
    wrongAnswers,
    accuracy,
    expectedScore,
    actualScore,
    kFactor,
    accuracyBonus,
    paceAdjustment,
    pausePenalty,
    delta,
    nextPoints,
  };
}

export function computeRankedDelta(params: {
  currentPoints: number;
  correctAnswers: number;
  totalQuestions: number;
}) {
  const result = computeRankedDeltaFromScore({
    currentPoints: params.currentPoints,
    correctAnswers: params.correctAnswers,
    totalQuestions: params.totalQuestions,
  });

  const gainPerCorrect = params.correctAnswers > 0
    ? Math.max(1, Math.round(Math.max(0, result.delta) / params.correctAnswers))
    : 0;
  const lossPerWrong = result.wrongAnswers > 0
    ? Math.max(1, Math.round(Math.max(0, -result.delta) / result.wrongAnswers))
    : 0;

  return {
    wrongAnswers: result.wrongAnswers,
    gainPerCorrect,
    lossPerWrong,
    delta: result.delta,
    nextPoints: result.nextPoints,
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
