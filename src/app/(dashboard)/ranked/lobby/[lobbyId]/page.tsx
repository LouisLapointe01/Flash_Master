"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
import { ArrowLeft, CheckCircle2, Loader2, Play, Shield, Timer, Users, XCircle } from "lucide-react";

type LobbyRow = {
  id: string;
  mode: "ranked" | "training";
  status: "forming" | "countdown" | "in_progress" | "paused" | "finished" | "cancelled";
  scope_type: "general" | "category";
  scope_key: string;
  max_players: number;
  target_duration_seconds: number;
  quiz_id: string | null;
  created_by: string;
};

type QuizOption = { id: string; title: string };

type PlayerProfile = { display_name: string | null };

type LobbyPlayerRow = {
  id: string;
  user_id: string;
  points_snapshot: number;
  tier_key: string;
  is_ready: boolean;
  joined_at: string;
  profiles?: PlayerProfile | PlayerProfile[] | null;
};

const LOBBY_STATUS_LABELS: Record<LobbyRow["status"], string> = {
  forming: "Formation",
  countdown: "Compte à rebours",
  in_progress: "En cours",
  paused: "Pause",
  finished: "Terminé",
  cancelled: "Annulé",
};

function formatTier(tierKey: string) {
  return `${tierKey.charAt(0).toUpperCase()}${tierKey.slice(1)}`;
}

function getDisplayName(player: LobbyPlayerRow) {
  if (Array.isArray(player.profiles)) return player.profiles[0]?.display_name ?? "Joueur";
  return player.profiles?.display_name ?? "Joueur";
}

export default function RankedLobbyPage({ params }: { params: Promise<{ lobbyId: string }> }) {
  const { lobbyId } = use(params);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [lobby, setLobby] = useState<LobbyRow | null>(null);
  const [players, setPlayers] = useState<LobbyPlayerRow[]>([]);
  const [quizzes, setQuizzes] = useState<QuizOption[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [message, setMessage] = useState("");
  const redirectedRef = useRef(false);

  const mySlot = useMemo(() => {
    if (!myUserId) return null;
    return players.find((p) => p.user_id === myUserId) ?? null;
  }, [myUserId, players]);

  const readyCount = useMemo(() => players.filter((p) => p.is_ready).length, [players]);
  const everyoneReady = players.length >= 2 && readyCount === players.length;
  const isCreator = myUserId === lobby?.created_by;
  const targetDurationMinutes = Math.round((lobby?.target_duration_seconds ?? 900) / 60);

  const navigateToGame = useCallback(
    (quizId: string) => {
      if (redirectedRef.current) return;
      redirectedRef.current = true;
      router.push(`/quizzes/${quizId}/play?mode=ranked&lobby_id=${lobbyId}`);
    },
    [lobbyId, router]
  );

  const loadState = useCallback(
    async (userId: string) => {
      const [lobbyRes, playersRes] = await Promise.all([
        supabase
          .from("game_lobbies")
          .select("id, mode, status, scope_type, scope_key, max_players, target_duration_seconds, quiz_id, created_by")
          .eq("id", lobbyId)
          .maybeSingle(),
        supabase
          .from("game_lobby_players")
          .select("id, user_id, points_snapshot, tier_key, is_ready, joined_at, profiles(display_name)")
          .eq("lobby_id", lobbyId)
          .order("joined_at", { ascending: true }),
      ]);

      const lobbyData = (lobbyRes.data as LobbyRow | null) ?? null;
      const playersData = (playersRes.data as unknown as LobbyPlayerRow[]) ?? [];

      setLobby(lobbyData);
      setPlayers(playersData);

      if (lobbyData?.status === "in_progress" && lobbyData.quiz_id) {
        navigateToGame(lobbyData.quiz_id);
      }

      if (lobbyData?.status === "cancelled") setMessage("Ce lobby a été annulé.");
      if (lobbyData && !playersData.some((p) => p.user_id === userId)) {
        setMessage("Tu ne fais plus partie de ce lobby.");
      }

      return lobbyData;
    },
    [lobbyId, navigateToGame, supabase]
  );

  useEffect(() => {
    async function boot() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setMessage("Session introuvable."); setLoading(false); return; }
      setMyUserId(user.id);

      const [lobbyData] = await Promise.all([
        loadState(user.id),
        supabase
          .from("quizzes")
          .select("id, title")
          .eq("visibility", "public")
          .order("updated_at", { ascending: false })
          .limit(80)
          .then(({ data }) => setQuizzes((data as QuizOption[]) ?? [])),
      ]);

      if (lobbyData?.quiz_id) setSelectedQuizId(lobbyData.quiz_id);
      setLoading(false);
    }
    void boot();
  }, [loadState, supabase]);

  // Realtime subscriptions
  useEffect(() => {
    if (!myUserId) return;

    const channel = supabase
      .channel(`lobby-${lobbyId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "game_lobbies", filter: `id=eq.${lobbyId}` }, () => {
        void loadState(myUserId);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "game_lobby_players", filter: `lobby_id=eq.${lobbyId}` }, () => {
        void loadState(myUserId);
      })
      .subscribe();

    // Fallback polling
    const intervalId = window.setInterval(() => void loadState(myUserId), 4000);

    return () => {
      void supabase.removeChannel(channel);
      window.clearInterval(intervalId);
    };
  }, [lobbyId, loadState, myUserId, supabase]);

  async function handleSelectQuiz(quizId: string) {
    if (!isCreator || !quizId) return;
    setBusy(true);
    setMessage("");
    const { error } = await supabase.rpc("set_lobby_quiz", { p_lobby_id: lobbyId, p_quiz_id: quizId });
    if (error) { setMessage(error.message); setBusy(false); return; }
    setSelectedQuizId(quizId);
    if (myUserId) await loadState(myUserId);
    setBusy(false);
  }

  async function handleToggleReady() {
    if (!mySlot) return;
    setBusy(true);
    setMessage("");

    const { error } = await supabase
      .from("game_lobby_players")
      .update({ is_ready: !mySlot.is_ready })
      .eq("id", mySlot.id)
      .eq("user_id", mySlot.user_id);

    if (error) { setMessage(error.message); setBusy(false); return; }

    // After toggling ready, try to start if everyone is ready
    const { data: startResult, error: startError } = await supabase.rpc("start_lobby_if_ready", {
      p_lobby_id: lobbyId,
    });

    if (!startError && startResult) {
      const result = startResult as { status: string; quiz_id?: string };
      if (result.status === "in_progress" && result.quiz_id) {
        navigateToGame(result.quiz_id);
        return;
      }
    }

    if (myUserId) await loadState(myUserId);
    setBusy(false);
  }

  async function handleLeaveLobby() {
    if (!myUserId) return;
    setBusy(true);
    await supabase.from("game_lobby_players").delete().eq("lobby_id", lobbyId).eq("user_id", myUserId);
    router.push("/ranked");
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-400" />
      </div>
    );
  }

  if (!lobby) {
    return (
      <div className="game-panel p-8 text-center">
        <p className="text-sm text-[var(--text-muted)]">Lobby introuvable ou non accessible.</p>
        <Link href="/ranked" className="mt-3 inline-flex text-sm font-semibold text-cyan-400">Retour au matchmaking</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/ranked" className="rounded-[0.9rem] border border-[var(--line)] bg-[var(--surface-soft)] p-2 text-[var(--text-muted)] transition hover:text-[var(--primary)]">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="hud-chip">Ranked Lobby</p>
          <h1 className="page-title mt-1">Préparation</h1>
        </div>
      </div>

      {/* Lobby info */}
      <div className="game-panel animate-in-up p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[0.95rem] border border-[var(--line)] bg-[var(--surface-soft)] p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--text-muted)]">Statut</p>
            <p className={clsx("mt-1 font-semibold", lobby.status === "in_progress" ? "text-[var(--primary)]" : "text-[var(--foreground)]")}>
              {LOBBY_STATUS_LABELS[lobby.status]}
            </p>
          </div>
          <div className="rounded-[0.95rem] border border-[var(--line)] bg-[var(--surface-soft)] p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--text-muted)]">Scope</p>
            <p className="mt-1 font-semibold text-[var(--foreground)]">
              {lobby.scope_type === "general" ? "Général" : lobby.scope_key}
            </p>
          </div>
          <div className="rounded-[0.95rem] border border-[var(--line)] bg-[var(--surface-soft)] p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--text-muted)]">Cadence</p>
            <p className="mt-1 inline-flex items-center gap-1 font-semibold text-[var(--foreground)]">
              <Timer size={13} /> {targetDurationMinutes} min
            </p>
          </div>
        </div>

        {/* Quiz selector — creator only */}
        {isCreator && lobby.status === "forming" ? (
          <div className="mt-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--text-muted)]">
              Quiz de la manche (sélection hôte)
            </p>
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="flex-1 rounded-[0.9rem] border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--line-strong)]"
              >
                <option value="">— Choisir un quiz —</option>
                {quizzes.map((q) => (
                  <option key={q.id} value={q.id}>{q.title}</option>
                ))}
              </select>
              <Button
                size="sm"
                disabled={busy || !selectedQuizId}
                onClick={() => void handleSelectQuiz(selectedQuizId)}
              >
                Confirmer
              </Button>
            </div>
          </div>
        ) : lobby.quiz_id ? (
          <div className="mt-4 rounded-[0.95rem] border border-[var(--line-strong)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--primary)]">
            Quiz sélectionné · {quizzes.find((q) => q.id === lobby.quiz_id)?.title ?? lobby.quiz_id.slice(0, 8)}
          </div>
        ) : (
          <div className="mt-4 rounded-[0.95rem] border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text-muted)]">
            En attente de la sélection du quiz par l&apos;hôte…
          </div>
        )}

        {/* Ready actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={busy || !mySlot || !lobby.quiz_id}
            onClick={() => void handleToggleReady()}
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
            {mySlot?.is_ready ? "Retirer prêt" : "Je suis prêt"}
          </Button>

          {everyoneReady && lobby.quiz_id && (
            <Button
              size="sm"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const { data } = await supabase.rpc("start_lobby_if_ready", { p_lobby_id: lobbyId });
                const result = data as { status: string; quiz_id?: string } | null;
                if (result?.status === "in_progress" && result.quiz_id) {
                  navigateToGame(result.quiz_id);
                } else {
                  if (myUserId) await loadState(myUserId);
                  setBusy(false);
                }
              }}
            >
              <Play size={14} /> Lancer la manche
            </Button>
          )}

          <Button size="sm" variant="danger" disabled={busy} onClick={() => void handleLeaveLobby()}>
            <XCircle size={14} /> Quitter
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Users size={13} className="text-[var(--text-muted)]" />
          <p className="text-xs text-[var(--text-muted)]">
            <span className="font-bold text-[var(--foreground)]">{readyCount}/{players.length}</span> prêts
            {everyoneReady ? " — tous prêts, vous pouvez lancer !" : " — en attente des confirmations"}
            {!lobby.quiz_id ? " · Quiz requis avant de pouvoir se préparer" : ""}
          </p>
        </div>

        {message ? (
          <p className="mt-2 text-xs text-red-400">{message}</p>
        ) : null}
      </div>

      {/* Player cards */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {players.map((player) => {
          const isMe = player.user_id === myUserId;
          return (
            <div
              key={player.id}
              className={clsx(
                "game-panel animate-in-up rounded-[var(--radius-md)] p-4 transition",
                player.is_ready
                  ? "border-[var(--primary)] shadow-[0_0_14px_rgba(57,255,20,0.22)]"
                  : "border-[var(--line)]"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-base font-black uppercase tracking-[0.04em] text-[var(--foreground)]">
                    {getDisplayName(player)}
                    {isMe && <span className="ml-2 text-xs font-semibold normal-case tracking-normal text-[var(--text-muted)]">(toi)</span>}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {formatTier(player.tier_key)} · {player.points_snapshot} RP
                  </p>
                </div>

                <span className={clsx(
                  "rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em]",
                  player.is_ready
                    ? "border-[var(--primary)] bg-[rgba(57,255,20,0.12)] text-[var(--primary)]"
                    : "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--text-muted)]"
                )}>
                  {player.is_ready
                    ? <span className="inline-flex items-center gap-1"><CheckCircle2 size={11} /> Prêt</span>
                    : "En attente"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
