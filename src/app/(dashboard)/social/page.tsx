"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clsx } from "clsx";
import { normalizeCategoryScope } from "@/lib/utils/ranked";
import { Handshake, Send, Shield, Trophy, Users } from "lucide-react";
import type { Quiz } from "@/lib/types";
import { HeroSignalVisual } from "@/components/branding/hero-signal-visual";

type FriendshipRow = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "rejected";
  requester?: Array<{ display_name: string }>;
  addressee?: Array<{ display_name: string }>;
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

export default function SocialPage() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [friendships, setFriendships] = useState<FriendshipRow[]>([]);
  const [associations, setAssociations] = useState<AssociationRow[]>([]);
  const [myMemberships, setMyMemberships] = useState<string[]>([]);
  const [quizzes, setQuizzes] = useState<Array<Pick<Quiz, "id" | "title" | "category" | "category_path">>>([]);
  const [challenges, setChallenges] = useState<ChallengeRow[]>([]);

  const [friendSearch, setFriendSearch] = useState("");
  const [friendError, setFriendError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [challengeMode, setChallengeMode] = useState<"ranked" | "training">("ranked");
  const [challengeQuizId, setChallengeQuizId] = useState("");
  const [challengeFriendId, setChallengeFriendId] = useState("");

  useEffect(() => {
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

      const [friendshipsRes, associationsRes, membershipsRes, quizzesRes, challengesRes] = await Promise.all([
        supabase
          .from("friendships")
          .select("id, requester_id, addressee_id, status, requester:requester_id(display_name), addressee:addressee_id(display_name)")
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
          .order("created_at", { ascending: false }),
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
      ]);

      const loadedQuizzes = (quizzesRes.data as Array<Pick<Quiz, "id" | "title" | "category" | "category_path">>) ?? [];

      setFriendships(((friendshipsRes.data as unknown as FriendshipRow[]) ?? []));
      setAssociations((associationsRes.data as AssociationRow[]) ?? []);
      setMyMemberships(((membershipsRes.data as Array<{ association_id: string }>) ?? []).map((item) => item.association_id));
      setQuizzes(loadedQuizzes);
      setChallenges(((challengesRes.data as unknown as ChallengeRow[]) ?? []));

      if (!challengeQuizId && loadedQuizzes.length > 0) {
        setChallengeQuizId(loadedQuizzes[0].id);
      }

      setLoading(false);
    }

    void load();
  }, [challengeQuizId, supabase]);

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

  const pendingReceived = useMemo(() => {
    if (!myUserId) return [] as FriendshipRow[];
    return friendships.filter((item) => item.status === "pending" && item.addressee_id === myUserId);
  }, [friendships, myUserId]);

  async function sendFriendRequest() {
    if (!friendSearch.trim() || !myUserId) return;
    setBusy(true);
    setFriendError(null);

    const { data: target } = await supabase
      .from("profiles")
      .select("id, display_name")
      .ilike("display_name", friendSearch.trim())
      .limit(1)
      .maybeSingle();

    if (!target) {
      setFriendError("Aucun profil trouve.");
      setBusy(false);
      return;
    }

    if (target.id === myUserId) {
      setFriendError("Tu ne peux pas t'ajouter toi-meme.");
      setBusy(false);
      return;
    }

    const { error } = await supabase.from("friendships").insert({
      requester_id: myUserId,
      addressee_id: target.id,
      status: "pending",
    });

    if (error) {
      setFriendError(error.message);
      setBusy(false);
      return;
    }

    setFriendSearch("");
    setBusy(false);

    const { data } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id, status, requester:requester_id(display_name), addressee:addressee_id(display_name)")
      .or(`requester_id.eq.${myUserId},addressee_id.eq.${myUserId}`)
      .order("created_at", { ascending: false });

    setFriendships(((data as unknown as FriendshipRow[]) ?? []));
  }

  async function respondFriendRequest(friendshipId: string, accepted: boolean) {
    if (!myUserId) return;
    setBusy(true);

    await supabase
      .from("friendships")
      .update({ status: accepted ? "accepted" : "rejected" })
      .eq("id", friendshipId);

    const { data } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id, status, requester:requester_id(display_name), addressee:addressee_id(display_name)")
      .or(`requester_id.eq.${myUserId},addressee_id.eq.${myUserId}`)
      .order("created_at", { ascending: false });

    setFriendships(((data as unknown as FriendshipRow[]) ?? []));
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
            <h1 className="page-title mt-2">Social</h1>
            <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">Ajoute des amis, rejoins des assos, et lance des challenges sans friction.</p>
          </div>

          <HeroSignalVisual
            tag="Social pulse"
            title="Reseau et defis"
            icon={Users}
            accent="green"
            chips={[`${acceptedFriends.length} amis`, `${associations.length} assos`, `${challenges.length} challenges`]}
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
            <div className="mt-2 flex flex-wrap gap-2">
              {acceptedFriends.length === 0 ? (
                <span className="text-xs text-[var(--text-muted)]">Aucun ami valide.</span>
              ) : (
                acceptedFriends.map((friend) => (
                  <span key={friend.id} className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)]">
                    {friend.label}
                  </span>
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
