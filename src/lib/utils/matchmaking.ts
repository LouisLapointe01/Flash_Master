import {
  DEFAULT_LOBBY_MAX_PLAYERS,
  TARGET_MATCH_DURATION_SECONDS,
  areTiersCompatible,
  getTierFromPoints,
} from "@/lib/utils/ranked";

export type RankedQueueEntry = {
  userId: string;
  points: number;
  scopeType: "general" | "category";
  scopeKey: string;
  queuedAt: string | number | Date;
};

function toTimestamp(value: string | number | Date) {
  if (typeof value === "number") return value;
  if (value instanceof Date) return value.getTime();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Date.now() : parsed;
}

export function canJoinLobby(currentPlayers: number, maxPlayers = DEFAULT_LOBBY_MAX_PLAYERS) {
  return currentPlayers < maxPlayers;
}

export function getLobbyPauseBudgetSeconds(targetDurationSeconds = TARGET_MATCH_DURATION_SECONDS) {
  // Budget de pause: 10% du temps total, capé pour garder le rythme.
  return Math.min(120, Math.max(30, Math.round(targetDurationSeconds * 0.1)));
}

export function findBestRankedMatchCandidate(
  queue: RankedQueueEntry[],
  target: RankedQueueEntry,
  now = Date.now()
) {
  const candidates = queue.filter((entry) => {
    if (entry.userId === target.userId) return false;
    if (entry.scopeType !== target.scopeType) return false;
    if (entry.scopeKey !== target.scopeKey) return false;
    return areTiersCompatible(entry.points, target.points);
  });

  if (candidates.length === 0) return null;

  const targetQueuedAt = toTimestamp(target.queuedAt);

  const ranked = candidates
    .map((entry) => {
      const pointsGap = Math.abs(entry.points - target.points);
      const entryQueuedAt = toTimestamp(entry.queuedAt);
      const waitSeconds = Math.max(0, Math.round((now - Math.min(targetQueuedAt, entryQueuedAt)) / 1000));

      // Score plus bas = meilleur match.
      const fitScore = pointsGap - Math.min(waitSeconds, 120);

      return {
        entry,
        fitScore,
        pointsGap,
        waitSeconds,
        tier: getTierFromPoints(entry.points),
      };
    })
    .sort((a, b) => a.fitScore - b.fitScore || a.pointsGap - b.pointsGap || b.waitSeconds - a.waitSeconds);

  return ranked[0] ?? null;
}
