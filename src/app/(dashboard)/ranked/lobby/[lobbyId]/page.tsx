"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
import { ArrowLeft, CheckCircle2, Copy, Loader2, Play, Shield, UserPlus, XCircle } from "lucide-react";

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

type FriendshipLookupRow = {
  requester_id: string;
  addressee_id: string;
  requester?: Array<{ display_name: string | null }>;
  addressee?: Array<{ display_name: string | null }>;
};

type PresenceStatus = "online" | "dnd" | "offline";

type FriendPresenceRow = {
  user_id: string;
  status: PresenceStatus;
  last_seen_at: string;
};

type LobbyFriend = {
  id: string;
  label: string;
  presence: PresenceStatus;
};

const LOBBY_STATUS_LABELS: Record<LobbyRow["status"], string> = {
  forming: "Formation",
  countdown: "Compte à rebours",
  in_progress: "En cours",
  paused: "Pause",
  finished: "Terminé",
  cancelled: "Annulé",
};

function getDisplayName(player: LobbyPlayerRow) {
  if (Array.isArray(player.profiles)) return player.profiles[0]?.display_name ?? "Joueur";
  return player.profiles?.display_name ?? "Joueur";
}

function getTierKey(points: number) {
  if (points >= 3500) return "grandmaster";
  if (points >= 2850) return "master";
  if (points >= 2300) return "diamond";
  if (points >= 1850) return "platinum";
  if (points >= 1450) return "gold";
  if (points >= 1100) return "silver";
  if (points >= 800) return "bronze";
  return "rookie";
}

function parseLobbyScope(scopeType: LobbyRow["scope_type"], scopeKey: string) {
  const normalized = scopeKey.trim().toLowerCase();

  const rankedQueueMatch = normalized.match(/^q:(solo_q|duo_q|flex)\|(.*)$/);
  if (rankedQueueMatch) {
    const queueMode = rankedQueueMatch[1];
    const baseScope = rankedQueueMatch[2] || "general";
    return {
      queueLabel: queueMode === "solo_q" ? "Solo Q" : queueMode === "duo_q" ? "Duo Q" : "Flex 5v5",
      scopeLabel: scopeType === "general" ? "General" : baseScope,
    };
  }

  const customQueueMatch = normalized.match(/^queue:(solo_q|duo_q|flex)\|party:(\d+)$/);
  if (customQueueMatch) {
    const queueMode = customQueueMatch[1];
    return {
      queueLabel: queueMode === "solo_q" ? "Solo Q" : queueMode === "duo_q" ? "Duo Q" : "Flex 5v5",
      scopeLabel: scopeType === "general" ? "General" : normalized,
    };
  }

  if (normalized.startsWith("training")) {
    return {
      queueLabel: "Training",
      scopeLabel: "General",
    };
  }

  return {
    queueLabel: scopeType === "general" ? "Classe" : "Classe categorie",
    scopeLabel: scopeType === "general" ? "General" : normalized,
  };
}

function getEffectivePresence(status?: PresenceStatus, lastSeenAt?: string) {
  if (!status) return "offline" as const;
  if (status === "dnd") return "dnd" as const;
  if (status === "offline") return "offline" as const;

  const lastSeenMs = lastSeenAt ? new Date(lastSeenAt).getTime() : 0;
  if (!lastSeenMs) return "offline" as const;
  if (Date.now() - lastSeenMs > 3 * 60 * 1000) return "offline" as const;
  return "online" as const;
}

function getPresenceLabel(status: PresenceStatus) {
  if (status === "online") return "En ligne";
  if (status === "dnd") return "DND";
  return "Deconnecte";
}

function getPresenceClass(status: PresenceStatus) {
  if (status === "online") return "border-emerald-400/40 bg-emerald-500/12 text-emerald-300";
  if (status === "dnd") return "border-amber-400/40 bg-amber-500/12 text-amber-300";
  return "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--text-muted)]";
}

function getInviteStatusMessage(status: string) {
  if (status === "invited") return "Invitation envoyee.";
  if (status === "already_pending") return "Invitation deja en attente.";
  if (status === "friend_dnd") return "Ce joueur est en mode ne pas deranger.";
  if (status === "friend_offline") return "Ce joueur est deconnecte.";
  if (status === "already_in_lobby") return "Ce joueur est deja dans le lobby.";
  if (status === "not_friend") return "Ce joueur n'est pas dans tes amis.";
  if (status === "lobby_locked") return "Le lobby n'accepte plus d'invitations.";
  if (status === "invalid_target") return "Cible invalide.";
  return "Invitation impossible pour le moment.";
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
  const [copied, setCopied] = useState(false);
  const [lobbyFriends, setLobbyFriends] = useState<LobbyFriend[]>([]);
  const [inviteBusyId, setInviteBusyId] = useState<string | null>(null);
  const [inviteMessage, setInviteMessage] = useState("");
  const redirectedRef = useRef(false);

  const mySlot = useMemo(() => {
    if (!myUserId) return null;
    return players.find((p) => p.user_id === myUserId) ?? null;
  }, [myUserId, players]);

  const readyCount = useMemo(() => players.filter((p) => p.is_ready).length, [players]);
  const everyoneReady = players.length >= 2 && readyCount === players.length;
  const isCreator = myUserId === lobby?.created_by;
  const canJoinLobby = Boolean(
    myUserId &&
    lobby &&
    lobby.status === "forming" &&
    players.length < lobby.max_players &&
    !players.some((player) => player.user_id === myUserId)
  );

  const scopeMeta = useMemo(() => {
    if (!lobby) return { queueLabel: "Classe", scopeLabel: "General" };
    return parseLobbyScope(lobby.scope_type, lobby.scope_key);
  }, [lobby]);

  const loadLobbyFriends = useCallback(async (userId: string, currentPlayerIds: string[]) => {
    const { data: friendshipsData } = await supabase
      .from("friendships")
      .select("requester_id, addressee_id, requester:requester_id(display_name), addressee:addressee_id(display_name)")
      .eq("status", "accepted")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .limit(120);

    const friendships = ((friendshipsData as unknown as FriendshipLookupRow[]) ?? []);
    if (friendships.length === 0) {
      setLobbyFriends([]);
      return;
    }

    const friendById = new Map<string, { id: string; label: string }>();

    for (const relation of friendships) {
      const isRequester = relation.requester_id === userId;
      const friendId = isRequester ? relation.addressee_id : relation.requester_id;
      const friendName = isRequester ? relation.addressee?.[0]?.display_name : relation.requester?.[0]?.display_name;

      if (!friendById.has(friendId)) {
        friendById.set(friendId, { id: friendId, label: friendName ?? "Ami" });
      }
    }

    const friendIds = Array.from(friendById.keys());
    if (friendIds.length === 0) {
      setLobbyFriends([]);
      return;
    }

    const { data: presenceData } = await supabase
      .from("user_presence")
      .select("user_id, status, last_seen_at")
      .in("user_id", friendIds);

    const presenceRows = (presenceData as FriendPresenceRow[]) ?? [];
    const presenceMap = new Map<string, FriendPresenceRow>();

    for (const row of presenceRows) {
      presenceMap.set(row.user_id, row);
    }

    const presenceRank: Record<PresenceStatus, number> = { online: 3, dnd: 2, offline: 1 };
    const filteredFriends = Array.from(friendById.values())
      .filter((friend) => !currentPlayerIds.includes(friend.id))
      .map((friend) => {
        const row = presenceMap.get(friend.id);
        return {
          ...friend,
          presence: getEffectivePresence(row?.status, row?.last_seen_at),
        };
      })
      .sort((a, b) => {
        if (presenceRank[b.presence] !== presenceRank[a.presence]) {
          return presenceRank[b.presence] - presenceRank[a.presence];
        }
        return a.label.localeCompare(b.label);
      });

    setLobbyFriends(filteredFriends);
  }, [supabase]);

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

      return { lobbyData, playersData };
    },
    [lobbyId, navigateToGame, supabase]
  );

  const insertCurrentUserInLobby = useCallback(
    async (userId: string) => {
      const { data: profile } = await supabase
        .from("ranked_profiles")
        .select("points")
        .eq("user_id", userId)
        .eq("scope_type", "general")
        .eq("scope_key", "general")
        .maybeSingle();

      const points = (profile as { points: number } | null)?.points ?? 1000;
      const tierKey = getTierKey(points);

      const { error } = await supabase.from("game_lobby_players").insert({
        lobby_id: lobbyId,
        user_id: userId,
        points_snapshot: points,
        tier_key: tierKey,
        is_ready: false,
      });

      return !error;
    },
    [lobbyId, supabase]
  );

  useEffect(() => {
    async function boot() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setMessage("Session introuvable."); setLoading(false); return; }
      setMyUserId(user.id);

      const [initialState] = await Promise.all([
        loadState(user.id),
        supabase
          .from("quizzes")
          .select("id, title")
          .eq("visibility", "public")
          .order("updated_at", { ascending: false })
          .limit(80)
          .then(({ data }) => setQuizzes((data as QuizOption[]) ?? [])),
      ]);

      let lobbyData = initialState?.lobbyData ?? null;
      let playersData = initialState?.playersData ?? [];

      if (!lobbyData) {
        const joined = await insertCurrentUserInLobby(user.id);
        if (joined) {
          const joinedState = await loadState(user.id);
          lobbyData = joinedState?.lobbyData ?? null;
          playersData = joinedState?.playersData ?? [];
        }
      }

      if (lobbyData?.quiz_id) setSelectedQuizId(lobbyData.quiz_id);
      await loadLobbyFriends(user.id, playersData.map((player) => player.user_id));
      setLoading(false);
    }
    void boot();
  }, [insertCurrentUserInLobby, loadLobbyFriends, loadState, supabase]);

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

  useEffect(() => {
    if (!myUserId) return;

    const playerIds = players.map((player) => player.user_id);
    void loadLobbyFriends(myUserId, playerIds);

    const intervalId = window.setInterval(() => {
      void loadLobbyFriends(myUserId, playerIds);
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [loadLobbyFriends, myUserId, players]);

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

  async function handleJoinLobby() {
    if (!myUserId || !lobby) return;

    setBusy(true);
    setMessage("");

    const joined = await insertCurrentUserInLobby(myUserId);
    if (!joined) {
      setMessage("Impossible de rejoindre ce lobby pour le moment.");
      setBusy(false);
      return;
    }

    await loadState(myUserId);
    setBusy(false);
  }

  async function handleCopyLobbyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/ranked/lobby/${lobbyId}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setMessage("Impossible de copier le lien de lobby.");
    }
  }

  async function handleInviteFriend(friendUserId: string) {
    if (!myUserId || !lobby) return;

    setInviteBusyId(friendUserId);
    setInviteMessage("");

    const { data, error } = await supabase.rpc("invite_friend_to_lobby", {
      p_lobby_id: lobby.id,
      p_friend_user_id: friendUserId,
      p_note: "",
    });

    if (error) {
      setInviteMessage(error.message);
      setInviteBusyId(null);
      return;
    }

    const payload = (data ?? {}) as { status?: string };
    setInviteMessage(getInviteStatusMessage(payload.status ?? "unknown"));

    await loadLobbyFriends(myUserId, players.map((player) => player.user_id));
    setInviteBusyId(null);
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
    <div className="space-y-4">
      <section className="game-panel precision-hud-panel animate-in-up p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/ranked" className="rounded-[0.9rem] border border-[var(--line)] bg-[var(--surface-soft)] p-2 text-[var(--text-muted)] transition hover:text-[var(--primary)]">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <p className="hud-chip">{lobby.mode === "training" ? "Training Lobby" : "Ranked Lobby"}</p>
              <h1 className="page-title mt-1">Lobby</h1>
            </div>
          </div>

          <div className="precision-grid-dot rounded-[0.9rem] border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2 text-right">
            <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">Ready</p>
            <p className="font-mono text-sm font-black text-[var(--foreground)]">{readyCount}/{players.length}</p>
          </div>
        </div>
      </section>

      <div className="game-panel precision-hud-panel animate-in-up p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="precision-grid-dot rounded-[0.95rem] border border-[var(--line)] bg-[var(--surface-soft)] p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--text-muted)]">Statut</p>
            <p className={clsx("mt-1 font-semibold", lobby.status === "in_progress" ? "text-[var(--primary)]" : "text-[var(--foreground)]")}>
              {LOBBY_STATUS_LABELS[lobby.status]}
            </p>
          </div>
          <div className="precision-grid-dot rounded-[0.95rem] border border-[var(--line)] bg-[var(--surface-soft)] p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--text-muted)]">File</p>
            <p className="mt-1 font-semibold text-[var(--foreground)]">
              {scopeMeta.queueLabel}
            </p>
          </div>
          <div className="precision-grid-dot rounded-[0.95rem] border border-[var(--line)] bg-[var(--surface-soft)] p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--text-muted)]">Scope</p>
            <p className="mt-1 font-semibold text-[var(--foreground)]">{scopeMeta.scopeLabel}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => void handleCopyLobbyLink()}>
            <Copy size={14} /> {copied ? "Copie" : "Copier"}
          </Button>
          {canJoinLobby ? (
            <Button size="sm" disabled={busy} onClick={() => void handleJoinLobby()}>
              <UserPlus size={14} /> Rejoindre
            </Button>
          ) : null}
        </div>

        {lobby.status === "forming" ? (
          <div className="mt-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--text-muted)]">Inviter des amis</p>
            {lobbyFriends.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">Aucun ami disponible pour ce lobby.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                {lobbyFriends.slice(0, 8).map((friend) => (
                  <div key={friend.id} className="precision-grid-dot flex items-center justify-between gap-2 rounded-[0.9rem] border border-[var(--line)] bg-[var(--surface-soft)] p-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--foreground)]">{friend.label}</p>
                      <span className={clsx("mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold", getPresenceClass(friend.presence))}>
                        {getPresenceLabel(friend.presence)}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy || inviteBusyId === friend.id || friend.presence !== "online"}
                      onClick={() => void handleInviteFriend(friend.id)}
                    >
                      {inviteBusyId === friend.id ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
                      Inviter
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {inviteMessage ? <p className="mt-2 text-xs text-[var(--text-muted)]">{inviteMessage}</p> : null}
          </div>
        ) : null}

        {isCreator && lobby.status === "forming" ? (
          <div className="mt-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--text-muted)]">
              Quiz
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
                Valider
              </Button>
            </div>
          </div>
        ) : lobby.quiz_id ? (
          <div className="mt-4 rounded-[0.95rem] border border-[var(--line-strong)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--primary)]">
            Quiz: {quizzes.find((q) => q.id === lobby.quiz_id)?.title ?? lobby.quiz_id.slice(0, 8)}
          </div>
        ) : (
          <div className="mt-4 rounded-[0.95rem] border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text-muted)]">
            Quiz en attente...
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={busy || !mySlot || !lobby.quiz_id}
            onClick={() => void handleToggleReady()}
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
            {mySlot?.is_ready ? "Unready" : "Pret"}
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
              <Play size={14} /> Lancer
            </Button>
          )}

          <Button size="sm" variant="danger" disabled={busy} onClick={() => void handleLeaveLobby()}>
            <XCircle size={14} /> Quitter
          </Button>
        </div>

        {message ? (
          <p className="mt-2 text-xs text-red-400">{message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {players.map((player) => {
          const isMe = player.user_id === myUserId;
          return (
            <div
              key={player.id}
              className={clsx(
                "game-panel precision-hud-panel animate-in-up rounded-[var(--radius-md)] p-4 transition",
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
