"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clsx } from "clsx";
import { normalizeCategoryScope } from "@/lib/utils/ranked";
import { BellRing, Handshake, Send, Shield, Trophy, Users } from "lucide-react";
import type { Quiz } from "@/lib/types";
import { HeroSignalVisual } from "@/components/branding/hero-signal-visual";

type FriendshipRow = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "rejected";
  requester?: Array<{ display_name: string | null }>;
  addressee?: Array<{ display_name: string | null }>;
};

type PresenceStatus = "online" | "dnd" | "offline";

type FriendPresenceRow = {
  user_id: string;
  status: PresenceStatus;
  last_seen_at: string;
};

type AssociationRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_path: string[];
};

type ChallengeRow = {
  id: string;
  creator_id: string;
  opponent_id: string | null;
  mode: "ranked" | "training";
  status: "pending" | "accepted" | "completed" | "cancelled";
  quizzes?: Array<{ title: string }>;
  creator?: Array<{ display_name: string }>;
  opponent?: Array<{ display_name: string }>;
};

type LobbyInvitationRow = {
  id: string;
  lobby_id: string;
  inviter_id: string;
  invitee_id: string;
  status: "pending" | "accepted" | "declined" | "expired" | "cancelled";
  created_at: string;
  inviter?: Array<{ display_name: string | null }>;
};

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
  if (status === "dnd") return "Ne pas deranger";
  return "Deconnecte";
}

function getPresenceClass(status: PresenceStatus) {
  if (status === "online") return "border-emerald-400/40 bg-emerald-500/12 text-emerald-300";
  if (status === "dnd") return "border-amber-400/40 bg-amber-500/12 text-amber-300";
  return "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--text-muted)]";
}

function getLobbyInviteMessage(status: string) {
  if (status === "accepted") return "Invitation acceptee. Entree dans le lobby.";
  if (status === "declined") return "Invitation refusee.";
  if (status === "expired") return "Invitation expiree: lobby indisponible.";
  if (status === "lobby_full") return "Lobby plein.";
  if (status === "lobby_missing") return "Lobby introuvable.";
  return "Invitation mise a jour.";
}

export default function SocialPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [friendships, setFriendships] = useState<FriendshipRow[]>([]);
  const [associations, setAssociations] = useState<AssociationRow[]>([]);
  const [myMemberships, setMyMemberships] = useState<string[]>([]);
  const [quizzes, setQuizzes] = useState<Array<Pick<Quiz, "id" | "title" | "category" | "category_path">>>([]);
  const [challenges, setChallenges] = useState<ChallengeRow[]>([]);
  const [lobbyInvitations, setLobbyInvitations] = useState<LobbyInvitationRow[]>([]);
  const [presenceByFriendId, setPresenceByFriendId] = useState<Record<string, PresenceStatus>>({});
  const [myPresence, setMyPresence] = useState<PresenceStatus>("online");

  const [friendSearch, setFriendSearch] = useState("");
  const [friendError, setFriendError] = useState<string | null>(null);
  const [socialMessage, setSocialMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [challengeMode, setChallengeMode] = useState<"ranked" | "training">("ranked");
  const [challengeQuizId, setChallengeQuizId] = useState("");
  const [challengeFriendId, setChallengeFriendId] = useState("");

  const loadFriendships = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id, status, requester:requester_id(display_name), addressee:addressee_id(display_name)")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    const loaded = ((data as unknown as FriendshipRow[]) ?? []);
    setFriendships(loaded);
    return loaded;
  }, [supabase]);

  const loadLobbyInvitations = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("lobby_invitations")
      .select("id, lobby_id, inviter_id, invitee_id, status, created_at, inviter:inviter_id(display_name)")
      .eq("invitee_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(25);

    setLobbyInvitations((data as unknown as LobbyInvitationRow[]) ?? []);
  }, [supabase]);

  const loadFriendPresence = useCallback(async (friendIds: string[]) => {
    if (friendIds.length === 0) {
      setPresenceByFriendId({});
      return;
    }

    const { data } = await supabase
      .from("user_presence")
      .select("user_id, status, last_seen_at")
      .in("user_id", friendIds);

    const rows = (data as FriendPresenceRow[]) ?? [];
    const map: Record<string, PresenceStatus> = {};

    for (const friendId of friendIds) {
      const row = rows.find((item) => item.user_id === friendId);
      map[friendId] = getEffectivePresence(row?.status, row?.last_seen_at);
    }

    setPresenceByFriendId(map);
  }, [supabase]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setMyUserId(user.id);

      const [associationsRes, membershipsRes, quizzesRes, challengesRes, myPresenceRes] = await Promise.all([
        supabase
          .from("associations")
          .select("id, name, slug, description, category_path")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("association_memberships")
          .select("association_id")
          .eq("user_id", user.id),
        supabase
          .from("quizzes")
          .select("id, title, category, category_path")
          .eq("visibility", "public")
          .order("updated_at", { ascending: false })
          .limit(80),
        supabase
          .from("quiz_challenges")
          .select("id, creator_id, opponent_id, mode, status, quizzes(title), creator:creator_id(display_name), opponent:opponent_id(display_name)")
          .or(`creator_id.eq.${user.id},opponent_id.eq.${user.id}`)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("user_presence")
          .select("status")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (!active) return;

      const loadedQuizzes = (quizzesRes.data as Array<Pick<Quiz, "id" | "title" | "category" | "category_path">>) ?? [];

      setAssociations((associationsRes.data as AssociationRow[]) ?? []);
      setMyMemberships(((membershipsRes.data as Array<{ association_id: string }>) ?? []).map((item) => item.association_id));
      setQuizzes(loadedQuizzes);
      setChallenges(((challengesRes.data as unknown as ChallengeRow[]) ?? []));
      setMyPresence(((myPresenceRes.data as { status: PresenceStatus } | null)?.status) ?? "online");

      await Promise.all([
        loadFriendships(user.id),
        loadLobbyInvitations(user.id),
      ]);

      if (!active) return;

      if (loadedQuizzes.length > 0) {
        setChallengeQuizId((current) => current || loadedQuizzes[0].id);
      }

      setLoading(false);
    }

    void load();
    return () => { active = false; };
  }, [loadFriendships, loadLobbyInvitations, supabase]);

  const acceptedFriends = useMemo(() => {
    if (!myUserId) return [] as Array<{ id: string; label: string }>;

    return friendships
      .filter((item) => item.status === "accepted")
      .map((item) => {
        const isRequester = item.requester_id === myUserId;
        const friendId = isRequester ? item.addressee_id : item.requester_id;
        const friendName = isRequester ? item.addressee?.[0]?.display_name : item.requester?.[0]?.display_name;
        return { id: friendId, label: friendName ?? "Ami" };
      });
  }, [friendships, myUserId]);

  const acceptedFriendIds = useMemo(() => acceptedFriends.map((friend) => friend.id), [acceptedFriends]);

  const pendingReceived = useMemo(() => {
    if (!myUserId) return [] as FriendshipRow[];
    return friendships.filter((item) => item.status === "pending" && item.addressee_id === myUserId);
  }, [friendships, myUserId]);

  useEffect(() => {
    if (!myUserId) return;

    void loadFriendPresence(acceptedFriendIds);
    const intervalId = window.setInterval(() => {
      void loadFriendPresence(acceptedFriendIds);
    }, 12000);

    return () => window.clearInterval(intervalId);
  }, [acceptedFriendIds, loadFriendPresence, myUserId]);

  useEffect(() => {
    if (!myUserId) return;

    const intervalId = window.setInterval(() => {
      void loadLobbyInvitations(myUserId);
    }, 9000);

    return () => window.clearInterval(intervalId);
  }, [loadLobbyInvitations, myUserId]);

  useEffect(() => {
    if (!myUserId) return;

    const pushPresence = async () => {
      await supabase.rpc("set_my_presence", { p_status: myPresence });
    };

    void pushPresence();
    const intervalId = window.setInterval(() => {
      void pushPresence();
    }, 45000);

    return () => window.clearInterval(intervalId);
  }, [myPresence, myUserId, supabase]);

  useEffect(() => {
    if (!myUserId) return;

    return () => {
      void supabase.rpc("set_my_presence", { p_status: "offline" });
    };
  }, [myUserId, supabase]);

  async function sendFriendRequest() {
    if (!friendSearch.trim() || !myUserId) return;
    setBusy(true);
    setFriendError(null);
    setSocialMessage(null);

    const { data, error } = await supabase.rpc("send_friend_request_by_display_name", {
      p_display_name: friendSearch.trim(),
    });

    if (error) {
      setFriendError(error.message);
      setBusy(false);
      return;
    }

    const payload = (data ?? {}) as { status?: string; target_display_name?: string };

    if (payload.status === "not_found") {
      setFriendError("Aucun profil trouve.");
      setBusy(false);
      return;
    }

    if (payload.status === "self") {
      setFriendError("Tu ne peux pas t'ajouter toi-meme.");
      setBusy(false);
      return;
    }

    if (payload.status === "already_friends") {
      setFriendError("Vous etes deja amis.");
      setBusy(false);
      return;
    }

    if (payload.status === "already_pending") {
      setFriendError("Demande deja envoyee.");
      setBusy(false);
      return;
    }

    if (payload.status === "auto_accepted") {
      setSocialMessage("Ami ajoute automatiquement.");
    } else {
      setSocialMessage("Demande d'ami envoyee.");
    }

    setFriendSearch("");
    await loadFriendships(myUserId);
    setBusy(false);
  }

  async function respondFriendRequest(friendshipId: string, accepted: boolean) {
    if (!myUserId) return;
    setBusy(true);
    setSocialMessage(null);

    const { data, error } = await supabase.rpc("respond_friend_request", {
      p_friendship_id: friendshipId,
      p_accept: accepted,
    });

    if (error) {
      setFriendError(error.message);
      setBusy(false);
      return;
    }

    const payload = (data ?? {}) as { status?: string };
    if (payload.status === "accepted") {
      setSocialMessage("Demande acceptee.");
    } else if (payload.status === "rejected") {
      setSocialMessage("Demande refusee.");
    }

    await loadFriendships(myUserId);
    setBusy(false);
  }

  async function toggleMembership(associationId: string, joined: boolean) {
    if (!myUserId) return;
    setBusy(true);

    if (joined) {
      await supabase
        .from("association_memberships")
        .delete()
        .eq("association_id", associationId)
        .eq("user_id", myUserId);
    } else {
      await supabase.from("association_memberships").insert({
        association_id: associationId,
        user_id: myUserId,
      });
    }

    const { data } = await supabase
      .from("association_memberships")
      .select("association_id")
      .eq("user_id", myUserId);

    setMyMemberships(((data as Array<{ association_id: string }>) ?? []).map((item) => item.association_id));
    setBusy(false);
  }

  async function createChallenge() {
    if (!myUserId || !challengeQuizId) return;

    setBusy(true);

    await supabase.from("quiz_challenges").insert({
      creator_id: myUserId,
      opponent_id: challengeFriendId || null,
      quiz_id: challengeQuizId,
      mode: challengeMode,
      status: "pending",
    });

    const { data } = await supabase
      .from("quiz_challenges")
      .select("id, creator_id, opponent_id, mode, status, quizzes(title), creator:creator_id(display_name), opponent:opponent_id(display_name)")
      .or(`creator_id.eq.${myUserId},opponent_id.eq.${myUserId}`)
      .order("created_at", { ascending: false })
      .limit(50);

    setChallenges(((data as unknown as ChallengeRow[]) ?? []));
    setBusy(false);
  }

  async function respondLobbyInvitation(invitationId: string, accepted: boolean, lobbyId: string) {
    if (!myUserId) return;

    setBusy(true);
    setSocialMessage(null);

    const { data, error } = await supabase.rpc("respond_lobby_invitation", {
      p_invitation_id: invitationId,
      p_accept: accepted,
    });

    if (error) {
      setSocialMessage(error.message);
      setBusy(false);
      return;
    }

    const payload = (data ?? {}) as { status?: string; lobby_id?: string };
    const effectiveLobbyId = payload.lobby_id ?? lobbyId;

    if (accepted && payload.status === "accepted" && effectiveLobbyId) {
      router.push(`/ranked/lobby/${effectiveLobbyId}`);
      return;
    }

    setSocialMessage(getLobbyInviteMessage(payload.status ?? "updated"));
    await loadLobbyInvitations(myUserId);
    setBusy(false);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="game-panel animate-in-up p-5 lg:p-6">
        <div className="section-hero">
          <div>
            <p className="hud-chip">Social Hub</p>
            <h1 className="page-title mt-2">Escouade</h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">Ajoute des amis et remplis tes lobbys avec un filtre simple: en ligne, ne pas deranger, deconnecte.</p>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Presence</p>
              <select
                value={myPresence}
                onChange={(event) => setMyPresence(event.target.value as PresenceStatus)}
                className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)]"
              >
                <option value="online">En ligne</option>
                <option value="dnd">Ne pas deranger</option>
                <option value="offline">Deconnecte</option>
              </select>
            </div>
          </div>

          <HeroSignalVisual
            tag="Social pulse"
            title="Reseau actif"
            icon={Users}
            accent="green"
            chips={[`${acceptedFriends.length} amis`, `${lobbyInvitations.length} invites`, `${associations.length} assos`, `${challenges.length} challenges`]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="game-panel animate-in-up p-4" style={{ animationDelay: "70ms" }}>
          <p className="mb-3 inline-flex items-center gap-2 font-mono text-sm font-black uppercase tracking-[0.08em] text-[var(--foreground)]"><Users size={14} /> Amis</p>
          <div className="flex gap-2">
            <Input
              id="friend_search"
              value={friendSearch}
              onChange={(event) => setFriendSearch(event.target.value)}
              placeholder="Display name exact"
            />
            <Button disabled={busy} onClick={() => void sendFriendRequest()}><Send size={14} /> Ajouter</Button>
          </div>
          {friendError ? <p className="mt-2 text-xs text-red-400">{friendError}</p> : null}

          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Demandes recues</p>
            {pendingReceived.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">Aucune demande en attente.</p>
            ) : (
              pendingReceived.map((item) => (
                <div key={item.id} className="rounded-[0.95rem] border border-[var(--line)] bg-[var(--surface-soft)] p-2.5">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{item.requester?.[0]?.display_name ?? "Utilisateur"}</p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" disabled={busy} onClick={() => void respondFriendRequest(item.id, true)}>Accepter</Button>
                    <Button size="sm" variant="secondary" disabled={busy} onClick={() => void respondFriendRequest(item.id, false)}>Refuser</Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Amis valides ({acceptedFriends.length})</p>
            <div className="mt-2 space-y-2">
              {acceptedFriends.length === 0 ? (
                <span className="text-xs text-[var(--text-muted)]">Aucun ami valide.</span>
              ) : (
                acceptedFriends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between gap-2 rounded-[0.9rem] border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2">
                    <p className="text-sm font-semibold text-[var(--foreground)]">{friend.label}</p>
                    <span className={clsx("rounded-full border px-2 py-0.5 text-[11px] font-semibold", getPresenceClass(presenceByFriendId[friend.id] ?? "offline"))}>
                      {getPresenceLabel(presenceByFriendId[friend.id] ?? "offline")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="game-panel animate-in-up p-4" style={{ animationDelay: "100ms" }}>
          <p className="mb-3 inline-flex items-center gap-2 font-mono text-sm font-black uppercase tracking-[0.08em] text-[var(--foreground)]"><Shield size={14} /> Associations</p>
          <div className="space-y-2 max-h-72 overflow-auto pr-1 soft-scroll">
            {associations.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">Aucune association disponible.</p>
            ) : (
              associations.map((association) => {
                const joined = myMemberships.includes(association.id);
                return (
                  <div key={association.id} className="rounded-[0.95rem] border border-[var(--line)] bg-[var(--surface-soft)] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">{association.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{association.description || "Sans description"}</p>
                        <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                          {normalizeCategoryScope(association.category_path, "General")}
                        </p>
                      </div>
                      <Button size="sm" variant="secondary" disabled={busy} onClick={() => void toggleMembership(association.id, joined)}>
                        {joined ? "Quitter" : "Suivre"}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="game-panel animate-in-up p-4" style={{ animationDelay: "118ms" }}>
        <p className="mb-3 inline-flex items-center gap-2 font-mono text-sm font-black uppercase tracking-[0.08em] text-[var(--foreground)]"><BellRing size={14} /> Invitations lobby recues</p>
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {lobbyInvitations.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">Aucune invitation lobby en attente.</p>
          ) : (
            lobbyInvitations.map((invitation) => (
              <div key={invitation.id} className="rounded-[0.95rem] border border-[var(--line)] bg-[var(--surface-soft)] p-3">
                <p className="text-sm font-semibold text-[var(--foreground)]">{invitation.inviter?.[0]?.display_name ?? "Un joueur"}</p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">Lobby {invitation.lobby_id.slice(0, 8)}...</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" disabled={busy} onClick={() => void respondLobbyInvitation(invitation.id, true, invitation.lobby_id)}>
                    Rejoindre
                  </Button>
                  <Button size="sm" variant="secondary" disabled={busy} onClick={() => void respondLobbyInvitation(invitation.id, false, invitation.lobby_id)}>
                    Refuser
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {socialMessage ? (
        <p className="text-xs text-[var(--text-muted)]">{socialMessage}</p>
      ) : null}

      <div className="game-panel animate-in-up p-4" style={{ animationDelay: "130ms" }}>
        <p className="mb-3 inline-flex items-center gap-2 font-mono text-sm font-black uppercase tracking-[0.08em] text-[var(--foreground)]"><Handshake size={14} /> Lancer une partie entre proches</p>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Mode</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setChallengeMode("ranked")}
                className={clsx(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-150 ease-in-out",
                  challengeMode === "ranked"
                    ? "border-green-400 bg-green-400/15 text-green-300"
                    : "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--foreground)]"
                )}
              >
                Ranked
              </button>
              <button
                type="button"
                onClick={() => setChallengeMode("training")}
                className={clsx(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-150 ease-in-out",
                  challengeMode === "training"
                    ? "border-green-400 bg-green-400/15 text-green-300"
                    : "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--foreground)]"
                )}
              >
                Training
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Ami cible</label>
            <select
              value={challengeFriendId}
              onChange={(event) => setChallengeFriendId(event.target.value)}
              className="w-full rounded-[0.9rem] border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              <option value="">Ouvert (sans adversaire direct)</option>
              {acceptedFriends.map((friend) => (
                <option key={friend.id} value={friend.id}>{friend.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Quiz</label>
            <select
              value={challengeQuizId}
              onChange={(event) => setChallengeQuizId(event.target.value)}
              className="w-full rounded-[0.9rem] border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <Button disabled={busy || !challengeQuizId} onClick={() => void createChallenge()}>
            <Trophy size={14} /> Creer challenge
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-2">
          {challenges.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">Aucun challenge pour le moment.</p>
          ) : (
            challenges.slice(0, 8).map((challenge) => (
              <div key={challenge.id} className="rounded-[0.95rem] border border-[var(--line)] bg-[var(--surface-soft)] p-3">
                <p className="text-sm font-semibold text-[var(--foreground)]">{challenge.quizzes?.[0]?.title ?? "Quiz"}</p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {challenge.mode.toUpperCase()} · {challenge.status}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {challenge.creator?.[0]?.display_name ?? "Createur"} vs {challenge.opponent?.[0]?.display_name ?? "Ouvert"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
