"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
import { Flame, Loader2, Medal, Swords, Target, Trophy } from "lucide-react";
import {
  DEFAULT_LOBBY_MAX_PLAYERS,
  TARGET_MATCH_DURATION_SECONDS,
  normalizeCategoryScope,
} from "@/lib/utils/ranked";

type QuizWithCount = {
  id: string;
  title: string;
  description: string;
  category: string;
  category_path: string[];
  visibility: string;
  quiz_questions?: Array<{ count: number }>;
  profiles?: Array<{ display_name: string }>;
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

function getQuestionCount(quiz: QuizWithCount) {
  if (!Array.isArray(quiz.quiz_questions) || quiz.quiz_questions.length === 0) return 0;
  const first = quiz.quiz_questions[0] as { count?: number };
  return first.count ?? 0;
}

export default function RankedPage() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [busyMatchmaking, setBusyMatchmaking] = useState(false);
  const [syncingQueue, setSyncingQueue] = useState(false);
  const [quizzes, setQuizzes] = useState<QuizWithCount[]>([]);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [scopeFilter, setScopeFilter] = useState<string>("all");
  const [queueStatus, setQueueStatus] = useState<"idle" | "searching" | "matched">("idle");
  const [queueLobbyId, setQueueLobbyId] = useState<string | null>(null);
  const [queueScopeLabel, setQueueScopeLabel] = useState("general");
  const [queueMessage, setQueueMessage] = useState("");

  const applyQueueState = useCallback((activeQueue: QueueRow | null) => {
    if (activeQueue?.status === "matched") {
      setQueueStatus("matched");
      setQueueLobbyId(activeQueue.matched_lobby_id ?? null);
      setQueueScopeLabel(activeQueue.scope_key);
      return;
    }

    if (activeQueue?.status === "searching") {
      setQueueStatus("searching");
      setQueueLobbyId(null);
      setQueueScopeLabel(activeQueue.scope_key);
      return;
    }

    setQueueStatus("idle");
    setQueueLobbyId(null);
    setQueueScopeLabel("general");
  }, []);

  const syncQueueState = useCallback(
    async (userId: string, options?: { quiet?: boolean }) => {
      if (!options?.quiet) {
        setSyncingQueue(true);
      }

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
        setQueueMessage("Adversaire trouve. Rejoins le lobby pour preparer la manche.");
      }

      if (!options?.quiet) {
        setSyncingQueue(false);
      }
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
          .select("id, title, description, category, category_path, visibility, quiz_questions(count), profiles(display_name)")
          .eq("visibility", "public")
          .order("updated_at", { ascending: false })
          .limit(60),
        supabase
          .from("ranked_match_queue")
          .select("id, status, matched_lobby_id, scope_type, scope_key, created_at")
          .eq("user_id", user.id)
          .in("status", ["searching", "matched"])
          .order("created_at", { ascending: false })
          .limit(1),
      ]);

      setQuizzes(((quizData as unknown as QuizWithCount[]) ?? []));

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

    return () => {
      window.clearInterval(intervalId);
    };
  }, [myUserId, queueStatus, syncQueueState]);

  const scopes = useMemo(() => {
    const fromQuizzes = new Set(
      quizzes
      .map((quiz) => normalizeCategoryScope(quiz.category_path, quiz.category).toLowerCase())
      .filter((label) => label !== "general")
    );

    return Array.from(fromQuizzes).sort((a, b) => a.localeCompare(b));
  }, [quizzes]);

  const filteredQuizzes = useMemo(() => {
    if (scopeFilter === "all") return quizzes;

    return quizzes.filter((quiz) => {
      const category = normalizeCategoryScope(quiz.category_path, quiz.category).toLowerCase();
      return category === scopeFilter;
    });
  }, [quizzes, scopeFilter]);

  async function handleJoinQueue() {
    if (!myUserId) {
      setQueueMessage("Session utilisateur introuvable.");
      return;
    }

    const targetScope = scopeFilter === "all"
      ? { scopeType: "general", scopeKey: "general" }
      : { scopeType: "category", scopeKey: scopeFilter };

    setBusyMatchmaking(true);
    setQueueMessage("");

    const { data, error } = await supabase.rpc("enqueue_ranked_match", {
      p_scope_type: targetScope.scopeType,
      p_scope_key: targetScope.scopeKey,
      p_max_players: DEFAULT_LOBBY_MAX_PLAYERS,
    });

    if (error) {
      setQueueMessage(error.message);
      setBusyMatchmaking(false);
      return;
    }

    const payload = (data ?? {}) as QueueRpcResponse;
    setQueueScopeLabel(targetScope.scopeKey);

    if (payload.status === "matched") {
      setQueueStatus("matched");
      setQueueLobbyId(payload.lobby_id ?? null);
      setQueueMessage("Adversaire trouve. Rejoins le lobby pour preparer la manche.");
    } else {
      setQueueStatus("searching");
      setQueueLobbyId(null);
      setQueueMessage("Recherche en cours. En attente d'un joueur de rang compatible.");
    }

    void syncQueueState(myUserId, { quiet: true });
    setBusyMatchmaking(false);
  }

  async function handleCancelQueue() {
    if (!myUserId) {
      setQueueMessage("Session utilisateur introuvable.");
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
    setQueueMessage("Recherche annulee.");
    void syncQueueState(myUserId, { quiet: true });
    setBusyMatchmaking(false);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#1f6f9d]" />
      </div>
    );
  }

  const targetDurationMinutes = Math.round(TARGET_MATCH_DURATION_SECONDS / 60);

  return (
    <div className="space-y-6">
      <div className="game-panel animate-in-up rounded-[1.5rem] border border-[#d9cfbd] p-5 lg:p-6">
        <div className="space-y-3">
          <p className="hud-chip">Ranked Arena</p>
          <h1 className="page-title mt-1">Mode classe</h1>
          <p className="text-sm text-[#557893]">Lance la file competitive depuis ici. Les details complets de ton rang sont dans ton profil.</p>
          <Link href="/settings?view=rank" className="inline-flex rounded-full border border-[#c9d9e8] bg-white/85 px-3 py-1.5 text-xs font-semibold text-[#2f5f84]">
            Voir Mon rang
          </Link>
        </div>
      </div>

      <div className="game-panel animate-in-up rounded-[1.35rem] border border-[#c6d8e8] p-4" style={{ animationDelay: "70ms" }}>
        <div className="mb-3 rounded-[0.95rem] border border-[#c9d9e8] bg-white/75 p-3">
          <p className="text-xs font-bold uppercase tracking-[0.09em] text-[#587790]">Matchmaking</p>
          <p className="mt-1 text-sm text-[#3f627d]">
            Scope actif: <span className="font-semibold text-[#214d70]">{scopeFilter === "all" ? "general" : scopeFilter}</span>
          </p>
          <p className="mt-0.5 text-sm text-[#3f627d]">
            Etat: <span className="font-semibold text-[#214d70]">{queueStatus === "idle" ? "hors file" : queueStatus === "searching" ? "en recherche" : "match trouve"}</span>
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" disabled={busyMatchmaking || queueStatus !== "idle"} onClick={() => void handleJoinQueue()}>
              {busyMatchmaking ? <Loader2 size={14} className="animate-spin" /> : <Swords size={14} />}
              Entrer en file
            </Button>
            <Button size="sm" variant="secondary" disabled={busyMatchmaking || queueStatus !== "searching"} onClick={() => void handleCancelQueue()}>
              Quitter la file
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
              Actualiser
            </Button>
          </div>

          {queueMessage ? <p className="mt-2 text-xs text-[#4a6a81]">{queueMessage}</p> : null}
          {queueStatus === "matched" && queueLobbyId ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="text-xs text-[#2a5d87]">Lobby: {queueLobbyId.slice(0, 8)}...</p>
              <Link href={`/ranked/lobby/${queueLobbyId}`}>
                <Button size="sm">
                  <Swords size={14} /> Ouvrir le lobby
                </Button>
              </Link>
            </div>
          ) : null}
          {queueStatus !== "idle" ? (
            <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-[#6d88a1]">Scope file: {queueScopeLabel}</p>
          ) : null}
        </div>

        <div className="mb-3 grid gap-2 rounded-[0.95rem] border border-[#c9d9e8] bg-white/75 p-3 text-xs text-[#3c5e78] md:grid-cols-3">
          <p>
            Matchmaking: <span className="font-black text-[#1e4d70]">tiers adjacents uniquement</span>
          </p>
          <p>
            Lobby max: <span className="font-black text-[#1e4d70]">{DEFAULT_LOBBY_MAX_PLAYERS} joueurs</span>
          </p>
          <p>
            Duree cible: <span className="font-black text-[#1e4d70]">{targetDurationMinutes} min</span>
          </p>
        </div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.09em] text-[#587790]">Scopes classes</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setScopeFilter("all")}
            className={clsx(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              scopeFilter === "all"
                ? "border-[#1f6f9d] bg-[#e8f3fb] text-[#1f5f84]"
                : "border-[#c9d9e8] bg-white text-[#4d6f87] hover:border-[#97b8d3]"
            )}
          >
            Tous
          </button>
          {scopes.map((scope) => (
            <button
              key={scope}
              type="button"
              onClick={() => setScopeFilter(scope)}
              className={clsx(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                scopeFilter === scope
                  ? "border-[#1f6f9d] bg-[#e8f3fb] text-[#1f5f84]"
                  : "border-[#c9d9e8] bg-white text-[#4d6f87] hover:border-[#97b8d3]"
              )}
            >
              {scope}
            </button>
          ))}
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <div className="game-panel rounded-[1.35rem] border border-[#c6d8e8] py-14 text-center">
          <Trophy size={42} className="mx-auto text-[#8aa2b8]" />
          <p className="mt-2 text-sm text-[#53758d]">Aucun quiz public pour ce scope.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredQuizzes.map((quiz) => {
            const categoryLabel = normalizeCategoryScope(quiz.category_path, quiz.category);
            const questionCount = getQuestionCount(quiz);

            return (
              <div key={quiz.id} className="game-panel interactive-card rounded-[1.35rem] border border-[#c6d8e8] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold text-[#102c43]">{quiz.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-[#4e7089]">
                      {quiz.description || "Quiz de competition rapide."}
                    </p>
                  </div>
                  <span className="rounded-full border border-[#c9d9e8] bg-white/88 px-2 py-0.5 text-xs font-semibold text-[#54758d]">
                    {questionCount} q
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-[#e7f2fc] px-2 py-0.5 font-semibold text-[#1f5f84]">{categoryLabel}</span>
                  {quiz.profiles?.[0]?.display_name ? (
                    <span className="rounded-full bg-[#ecf6ef] px-2 py-0.5 font-semibold text-[#2f6e4e]">Par {quiz.profiles[0].display_name}</span>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/quizzes/${quiz.id}/play?mode=ranked&scope=general`}>
                    <Button size="sm"><Swords size={14} /> Classé general</Button>
                  </Link>
                  <Link href={`/quizzes/${quiz.id}/play?mode=ranked&scope=category`}>
                    <Button size="sm" variant="secondary"><Medal size={14} /> Classe spec.</Button>
                  </Link>
                  <Link href={`/quizzes/${quiz.id}/play`}>
                    <Button size="sm" variant="secondary"><Target size={14} /> Entrainement</Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="game-panel animate-in-up rounded-[1.3rem] border border-[#c6d8e8] p-4 text-sm text-[#4f7088]" style={{ animationDelay: "140ms" }}>
        <p className="inline-flex items-center gap-2 font-semibold text-[#274c68]">
          <Flame size={14} className="text-[#de5d5d]" />
          Regles rapide:
        </p>
        <p className="mt-1">Bonne reponse: points gagnes. Mauvaise reponse ou timeout: points perdus. Plus ton rang monte, plus gagner devient difficile.</p>
      </div>
    </div>
  );
}
