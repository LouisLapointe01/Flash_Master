"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
import { Loader2, Swords, Target } from "lucide-react";
import { TARGET_MATCH_DURATION_SECONDS, normalizeCategoryScope } from "@/lib/utils/ranked";

type QuizWithCount = {
  id: string;
  category: string;
  category_path: string[];
};

type QueueRow = {
  id: string;
  status: "searching" | "matched" | "cancelled";
  matched_lobby_id: string | null;
  scope_type: "general" | "category";
  scope_key: string;
  created_at: string;
};

type QueueRpcResponse = {
  status?: "searching" | "matched";
  queue_id?: string;
  lobby_id?: string;
  opponent_user_id?: string;
  scope_type?: "general" | "category";
  scope_key?: string;
};

type QueueMode = "solo_q" | "duo_q" | "flex";

type QueueConfig = {
  key: QueueMode;
  label: string;
  subtitle: string;
  partySlots: number;
  maxPlayers: number;
};

const RANKED_QUEUES: QueueConfig[] = [
  {
    key: "solo_q",
    label: "Solo Q",
    subtitle: "1v1",
    partySlots: 1,
    maxPlayers: 2,
  },
  {
    key: "duo_q",
    label: "Duo Q",
    subtitle: "2v2",
    partySlots: 2,
    maxPlayers: 4,
  },
  {
    key: "flex",
    label: "Flex 5v5",
    subtitle: "5v5",
    partySlots: 5,
    maxPlayers: 10,
  },
];

function parseQueueMode(value: string | null | undefined): QueueMode {
  if (value === "duo_q" || value === "flex") return value;
  return "solo_q";
}

function getQueueConfig(queueMode: QueueMode) {
  return RANKED_QUEUES.find((queue) => queue.key === queueMode) ?? RANKED_QUEUES[0];
}

function encodeQueueScopeKey(baseScopeKey: string, queueMode: QueueMode) {
  return `q:${queueMode}|${baseScopeKey}`;
}

function decodeQueueScopeKey(scopeKey: string) {
  const normalized = scopeKey.trim().toLowerCase();
  const queueMatch = normalized.match(/^q:(solo_q|duo_q|flex)\|(.*)$/);

  if (!queueMatch) {
    return {
      queueMode: "solo_q" as QueueMode,
      baseScopeKey: normalized || "general",
    };
  }

  return {
    queueMode: parseQueueMode(queueMatch[1]),
    baseScopeKey: queueMatch[2] || "general",
  };
}

export default function RankedPage() {
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [busyMatchmaking, setBusyMatchmaking] = useState(false);
  const [syncingQueue, setSyncingQueue] = useState(false);
  const [quizzes, setQuizzes] = useState<QuizWithCount[]>([]);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [scopeFilter, setScopeFilter] = useState<string>("all");
  const [queueMode, setQueueMode] = useState<QueueMode>(parseQueueMode(searchParams.get("queue")));
  const [queueStatus, setQueueStatus] = useState<"idle" | "searching" | "matched">("idle");
  const [queueLobbyId, setQueueLobbyId] = useState<string | null>(null);
  const [queueScopeLabel, setQueueScopeLabel] = useState("general");
  const [queueMessage, setQueueMessage] = useState("");

  useEffect(() => {
    setQueueMode(parseQueueMode(searchParams.get("queue")));
  }, [searchParams]);

  const applyQueueState = useCallback((activeQueue: QueueRow | null) => {
    if (!activeQueue) {
      setQueueStatus("idle");
      setQueueLobbyId(null);
      setQueueScopeLabel("general");
      return;
    }

    const parsedScope = decodeQueueScopeKey(activeQueue.scope_key);
    setQueueMode(parsedScope.queueMode);
    setQueueScopeLabel(parsedScope.baseScopeKey);

    if (activeQueue.status === "matched") {
      setQueueStatus("matched");
      setQueueLobbyId(activeQueue.matched_lobby_id ?? null);
      return;
    }

    if (activeQueue.status === "searching") {
      setQueueStatus("searching");
      setQueueLobbyId(null);
      return;
    }

    setQueueStatus("idle");
    setQueueLobbyId(null);
  }, []);

  const syncQueueState = useCallback(
    async (userId: string, options?: { quiet?: boolean }) => {
      if (!options?.quiet) setSyncingQueue(true);

      const { data, error } = await supabase
        .from("ranked_match_queue")
        .select("id, status, matched_lobby_id, scope_type, scope_key, created_at")
        .eq("user_id", userId)
        .in("status", ["searching", "matched"])
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        if (!options?.quiet) {
          setQueueMessage(error.message);
          setSyncingQueue(false);
        }
        return;
      }

      const activeQueue = ((data as QueueRow[] | null) ?? [])[0] ?? null;
      applyQueueState(activeQueue);

      if (activeQueue?.status === "matched") {
        setQueueMessage("Match trouve. Ouvre le lobby.");
      }

      if (!options?.quiet) setSyncingQueue(false);
    },
    [applyQueueState, supabase]
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMyUserId(null);
        setLoading(false);
        return;
      }

      setMyUserId(user.id);

      const [{ data: quizData }, { data: queueData }] = await Promise.all([
        supabase
          .from("quizzes")
          .select("id, category, category_path")
          .eq("visibility", "public")
          .order("updated_at", { ascending: false })
          .limit(160),
        supabase
          .from("ranked_match_queue")
          .select("id, status, matched_lobby_id, scope_type, scope_key, created_at")
          .eq("user_id", user.id)
          .in("status", ["searching", "matched"])
          .order("created_at", { ascending: false })
          .limit(1),
      ]);

      setQuizzes((quizData as QuizWithCount[]) ?? []);
      const activeQueue = ((queueData as QueueRow[] | null) ?? [])[0] ?? null;
      applyQueueState(activeQueue);
      setLoading(false);
    }

    void load();
  }, [applyQueueState, supabase]);

  useEffect(() => {
    if (!myUserId || queueStatus !== "searching") return;

    const intervalId = window.setInterval(() => {
      void syncQueueState(myUserId, { quiet: true });
    }, 3500);

    return () => window.clearInterval(intervalId);
  }, [myUserId, queueStatus, syncQueueState]);

  const scopes = useMemo(() => {
    const fromQuizzes = new Set(
      quizzes
        .map((quiz) => normalizeCategoryScope(quiz.category_path, quiz.category).toLowerCase())
        .filter((label) => label !== "general")
    );

    return Array.from(fromQuizzes).sort((a, b) => a.localeCompare(b));
  }, [quizzes]);

  async function handleJoinQueue() {
    if (!myUserId) {
      setQueueMessage("Session introuvable.");
      return;
    }

    const baseScopeKey = scopeFilter === "all" ? "general" : scopeFilter;
    const scopeType = scopeFilter === "all" ? "general" : "category";
    const scopeKey = encodeQueueScopeKey(baseScopeKey, queueMode);
    const queueConfig = getQueueConfig(queueMode);

    setBusyMatchmaking(true);
    setQueueMessage("");

    const { data, error } = await supabase.rpc("enqueue_ranked_match", {
      p_scope_type: scopeType,
      p_scope_key: scopeKey,
      p_max_players: queueConfig.maxPlayers,
    });

    if (error) {
      setQueueMessage(error.message);
      setBusyMatchmaking(false);
      return;
    }

    const payload = (data ?? {}) as QueueRpcResponse;
    setQueueScopeLabel(baseScopeKey);

    if (payload.status === "matched") {
      setQueueStatus("matched");
      setQueueLobbyId(payload.lobby_id ?? null);
      setQueueMessage("Match trouve. Ouvre le lobby.");
    } else {
      setQueueStatus("searching");
      setQueueLobbyId(null);
      setQueueMessage(`Recherche ${queueConfig.label}...`);
    }

    void syncQueueState(myUserId, { quiet: true });
    setBusyMatchmaking(false);
  }

  async function handleCancelQueue() {
    if (!myUserId) {
      setQueueMessage("Session introuvable.");
      return;
    }

    setBusyMatchmaking(true);
    setQueueMessage("");

    const { error } = await supabase.rpc("cancel_ranked_queue");
    if (error) {
      setQueueMessage(error.message);
      setBusyMatchmaking(false);
      return;
    }

    setQueueStatus("idle");
    setQueueLobbyId(null);
    setQueueScopeLabel("general");
    setQueueMessage("File annulee.");
    void syncQueueState(myUserId, { quiet: true });
    setBusyMatchmaking(false);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--secondary)]" />
      </div>
    );
  }

  const targetDurationMinutes = Math.round(TARGET_MATCH_DURATION_SECONDS / 60);
  const queueConfig = getQueueConfig(queueMode);
  const queueStatusLabel = queueStatus === "idle" ? "Hors file" : queueStatus === "searching" ? "Recherche" : "Match trouve";

  return (
    <div className="space-y-4">
      <section className="game-panel precision-hud-panel animate-in-up rounded-[1.5rem] p-5 lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="hud-chip">Ranked Console</p>
            <h1 className="page-title mt-2">Classe</h1>
          </div>

          <div className="precision-grid-dot rounded-[0.95rem] border border-[var(--line-strong)] bg-[var(--surface-soft)] px-4 py-3 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Etat</p>
            <p className="mt-1 font-mono text-sm font-black uppercase tracking-[0.08em] text-[var(--foreground)]">{queueStatusLabel}</p>
          </div>
        </div>
      </section>

      <section className="game-panel precision-hud-panel animate-in-up rounded-[1.35rem] p-4" style={{ animationDelay: "60ms" }}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.09em] text-[var(--text-muted)]">Queues</p>
          <Link href="/play">
            <Button size="sm" variant="secondary"><Target size={14} /> Launcher</Button>
          </Link>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {RANKED_QUEUES.map((queue) => (
            <button
              key={queue.key}
              type="button"
              data-cursor="interactive"
              onClick={() => setQueueMode(queue.key)}
              disabled={queueStatus === "searching"}
              className={clsx(
                "precision-grid-dot rounded-[1rem] border p-4 text-left transition",
                queueMode === queue.key
                  ? "border-[var(--line-strong)] bg-[rgba(0,255,255,0.12)]"
                  : "border-[var(--line)] bg-[var(--surface-soft)]"
              )}
            >
              <p className="font-mono text-sm font-black uppercase tracking-[0.08em] text-[var(--foreground)]">{queue.label}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{queue.maxPlayers} joueurs</p>
            </button>
          ))}
        </div>
      </section>

      <section className="game-panel precision-hud-panel animate-in-up rounded-[1.35rem] p-4" style={{ animationDelay: "90ms" }}>
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-[0.95rem] border border-[var(--line)] bg-[var(--surface-soft)] p-3 text-xs text-[var(--text-muted)]">
          <span className="hud-chip">{queueConfig.label}</span>
          <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 font-semibold text-[var(--foreground)]">{queueScopeLabel}</span>
          <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 font-semibold text-[var(--foreground)]">{targetDurationMinutes}m</span>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            data-cursor="interactive"
            onClick={() => setScopeFilter("all")}
            className={clsx(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              scopeFilter === "all"
                ? "border-[var(--line-strong)] bg-[rgba(0,255,255,0.12)] text-[var(--secondary)]"
                : "border-[var(--line)] bg-[var(--surface)] text-[var(--text-muted)]"
            )}
          >
            Tous
          </button>
          {scopes.map((scope) => (
            <button
              key={scope}
              type="button"
              data-cursor="interactive"
              onClick={() => setScopeFilter(scope)}
              className={clsx(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                scopeFilter === scope
                  ? "border-[var(--line-strong)] bg-[rgba(0,255,255,0.12)] text-[var(--secondary)]"
                  : "border-[var(--line)] bg-[var(--surface)] text-[var(--text-muted)]"
              )}
            >
              {scope}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={busyMatchmaking || queueStatus !== "idle"} onClick={() => void handleJoinQueue()}>
            {busyMatchmaking ? <Loader2 size={14} className="animate-spin" /> : <Swords size={14} />}
            Entrer
          </Button>
          <Button size="sm" variant="secondary" disabled={busyMatchmaking || queueStatus !== "searching"} onClick={() => void handleCancelQueue()}>
            Quitter
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={busyMatchmaking || syncingQueue || !myUserId}
            onClick={() => {
              if (!myUserId) return;
              void syncQueueState(myUserId);
            }}
          >
            {syncingQueue ? <Loader2 size={14} className="animate-spin" /> : null}
            Sync
          </Button>
        </div>

        {queueMessage ? <p className="mt-3 text-xs text-[var(--text-muted)]">{queueMessage}</p> : null}

        {queueStatus === "matched" && queueLobbyId ? (
          <div className="mt-3">
            <Link href={`/ranked/lobby/${queueLobbyId}`}>
              <Button size="sm"><Swords size={14} /> Ouvrir le lobby</Button>
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}