"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
import { ArrowLeft, CheckCircle2, Loader2, Shield, Timer, Users, XCircle } from "lucide-react";

type LobbyRow = {
  id: string;
  mode: "ranked" | "training";
  status: "forming" | "countdown" | "in_progress" | "paused" | "finished" | "cancelled";
  scope_type: "general" | "category";
  scope_key: string;
  max_players: number;
  target_duration_seconds: number;
};

type PlayerProfile = {
  display_name: string | null;
};

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
  forming: "formation",
  countdown: "compte a rebours",
  in_progress: "en cours",
  paused: "pause",
  finished: "termine",
  cancelled: "annule",
};

function formatTierLabel(tierKey: string) {
  if (!tierKey) return "Rookie";
  return `${tierKey.charAt(0).toUpperCase()}${tierKey.slice(1)}`;
}

function getPlayerDisplayName(player: LobbyPlayerRow) {
  if (Array.isArray(player.profiles)) {
    return player.profiles[0]?.display_name ?? "Joueur";
  }
  return player.profiles?.display_name ?? "Joueur";
}

export default function RankedLobbyPage({ params }: { params: Promise<{ lobbyId: string }> }) {
  const { lobbyId } = use(params);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [lobby, setLobby] = useState<LobbyRow | null>(null);
  const [players, setPlayers] = useState<LobbyPlayerRow[]>([]);
  const [message, setMessage] = useState("");

  const mySlot = useMemo(() => {
    if (!myUserId) return null;
    return players.find((player) => player.user_id === myUserId) ?? null;
  }, [myUserId, players]);

  const readyCount = useMemo(() => players.filter((player) => player.is_ready).length, [players]);
  const everyoneReady = players.length > 1 && readyCount === players.length;
  const targetDurationMinutes = Math.round((lobby?.target_duration_seconds ?? 900) / 60);

  const loadLobbyState = useCallback(
    async (userId: string, options?: { quiet?: boolean }) => {
      if (!options?.quiet) {
        setSyncing(true);
      }

      const [lobbyRes, playersRes] = await Promise.all([
        supabase
          .from("game_lobbies")
          .select("id, mode, status, scope_type, scope_key, max_players, target_duration_seconds")
          .eq("id", lobbyId)
          .maybeSingle(),
        supabase
          .from("game_lobby_players")
          .select("id, user_id, points_snapshot, tier_key, is_ready, joined_at, profiles(display_name)")
          .eq("lobby_id", lobbyId)
          .order("joined_at", { ascending: true }),
      ]);

      if (lobbyRes.error) {
        setMessage(lobbyRes.error.message);
      }

      if (playersRes.error) {
        setMessage(playersRes.error.message);
      }

      const lobbyData = (lobbyRes.data as LobbyRow | null) ?? null;
      const playersData = (playersRes.data as unknown as LobbyPlayerRow[]) ?? [];

      setLobby(lobbyData);
      setPlayers(playersData);

      if (lobbyData?.status === "cancelled") {
        setMessage("Ce lobby a ete annule.");
      }

      if (lobbyData && !playersData.some((player) => player.user_id === userId)) {
        setMessage("Tu ne fais plus partie de ce lobby.");
      }

      if (!options?.quiet) {
        setSyncing(false);
      }
    },
    [lobbyId, supabase]
  );

  useEffect(() => {
    async function boot() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Session utilisateur introuvable.");
        setLoading(false);
        return;
      }

      setMyUserId(user.id);
      await loadLobbyState(user.id, { quiet: true });
      setLoading(false);
    }

    void boot();
  }, [loadLobbyState, supabase]);

  useEffect(() => {
    if (!myUserId) return;

    const intervalId = window.setInterval(() => {
      void loadLobbyState(myUserId, { quiet: true });
    }, 4000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadLobbyState, myUserId]);

  async function handleToggleReady() {
    if (!mySlot) {
      setMessage("Tu dois etre dans le lobby pour changer ton statut.");
      return;
    }

    setBusy(true);
    setMessage("");

    const { error } = await supabase
      .from("game_lobby_players")
      .update({ is_ready: !mySlot.is_ready })
      .eq("id", mySlot.id)
      .eq("user_id", mySlot.user_id);

    if (error) {
      setMessage(error.message);
      setBusy(false);
      return;
    }

    await loadLobbyState(mySlot.user_id, { quiet: true });
    setBusy(false);
  }

  async function handleLeaveLobby() {
    if (!myUserId) {
      setMessage("Session utilisateur introuvable.");
      return;
    }

    setBusy(true);
    setMessage("");

    const { error } = await supabase
      .from("game_lobby_players")
      .delete()
      .eq("lobby_id", lobbyId)
      .eq("user_id", myUserId);

    if (error) {
      setMessage(error.message);
      setBusy(false);
      return;
    }

    router.push("/ranked");
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#1f6f9d]" />
      </div>
    );
  }

  if (!lobby) {
    return (
      <div className="game-panel rounded-[1.3rem] border border-[#c6d8e8] p-8 text-center">
        <p className="text-sm text-[#56758d]">Lobby introuvable ou non accessible.</p>
        <Link href="/ranked" className="mt-3 inline-flex text-sm font-semibold text-[#1f5f84]">
          Retour au matchmaking
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/ranked" className="rounded-xl border border-[#d6cab8] bg-white/85 p-2 text-[#7a7262] hover:text-[#4b453a]">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-[#65849b]">Ranked Lobby</p>
          <h1 className="text-xl font-semibold text-[#173a58]">Preparation de manche</h1>
        </div>
      </div>

      <div className="game-panel rounded-[1.35rem] border border-[#c6d8e8] p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[1rem] border border-[#c9d9e8] bg-white/80 p-3 text-sm text-[#3f627d]">
            <p className="text-xs font-bold uppercase tracking-[0.09em] text-[#587790]">Statut</p>
            <p className="mt-1 font-semibold text-[#1f5f84]">{LOBBY_STATUS_LABELS[lobby.status]}</p>
          </div>
          <div className="rounded-[1rem] border border-[#c9d9e8] bg-white/80 p-3 text-sm text-[#3f627d]">
            <p className="text-xs font-bold uppercase tracking-[0.09em] text-[#587790]">Scope</p>
            <p className="mt-1 font-semibold text-[#1f5f84]">{lobby.scope_type === "general" ? "general" : lobby.scope_key}</p>
          </div>
          <div className="rounded-[1rem] border border-[#c9d9e8] bg-white/80 p-3 text-sm text-[#3f627d]">
            <p className="text-xs font-bold uppercase tracking-[0.09em] text-[#587790]">Cadence</p>
            <p className="mt-1 inline-flex items-center gap-1 font-semibold text-[#1f5f84]">
              <Timer size={14} /> {targetDurationMinutes} min
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button size="sm" disabled={busy || !mySlot} onClick={() => void handleToggleReady()}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
            {mySlot?.is_ready ? "Retirer pret" : "Je suis pret"}
          </Button>

          <Button size="sm" variant="secondary" disabled={busy || syncing || !myUserId} onClick={() => {
            if (!myUserId) return;
            void loadLobbyState(myUserId);
          }}>
            {syncing ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
            Actualiser
          </Button>

          <Button size="sm" variant="danger" disabled={busy || !myUserId} onClick={() => void handleLeaveLobby()}>
            <XCircle size={14} /> Quitter
          </Button>
        </div>

        <p className="mt-3 text-xs text-[#476982]">
          Joueurs prets: <span className="font-black text-[#1e4d70]">{readyCount}/{players.length}</span>
          {everyoneReady ? " - equipe completee, lancement imminent." : " - en attente des confirmations."}
        </p>

        {message ? <p className="mt-2 text-xs text-[#4a6a81]">{message}</p> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {players.map((player) => {
          const isMe = player.user_id === myUserId;
          const displayName = getPlayerDisplayName(player);

          return (
            <div
              key={player.id}
              className={clsx(
                "game-panel rounded-[1.2rem] border p-4",
                player.is_ready ? "border-green-300 bg-[#f3fff4]" : "border-[#c6d8e8] bg-white"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[#12344d]">{displayName}</p>
                  <p className="mt-1 text-xs text-[#557893]">
                    {formatTierLabel(player.tier_key)} - {player.points_snapshot} pts
                    {isMe ? " - toi" : ""}
                  </p>
                </div>

                <span
                  className={clsx(
                    "rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]",
                    player.is_ready
                      ? "border-green-300 bg-green-100 text-green-700"
                      : "border-[#c9d9e8] bg-white text-[#5a7a92]"
                  )}
                >
                  {player.is_ready ? (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 size={12} /> Pret
                    </span>
                  ) : (
                    "En attente"
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
