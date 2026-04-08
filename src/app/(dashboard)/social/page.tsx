"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clsx } from "clsx";
import { normalizeCategoryScope } from "@/lib/utils/ranked";
import { Handshake, Send, Shield, Trophy, Users, Layers, HelpCircle, Swords, ShieldCheck, Sparkles } from "lucide-react";
import type { Quiz } from "@/lib/types";
import { FlashMasterLogo } from "@/components/branding/flash-master-logo";

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
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#1f6f9d]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="game-panel animate-in-up rounded-[1.5rem] border border-[#d9cfbd] p-5 lg:p-6">
        <div className="section-hero">
          <div className="space-y-4">
            <div>
              <p className="hud-chip">Social Hub</p>
              <h1 className="mt-3 text-2xl font-semibold text-[#2b303a]">Amis, associations et duels</h1>
              <p className="mt-1 text-sm text-[#676258]">Ajoute des amis, rejoins des groupes, puis lance des sessions ranked ou training ensemble.</p>
            </div>

            <div className="rubric-strip">
              <Link href="/decks" className="rubric-link"><Layers size={13} />Decks</Link>
              <Link href="/quizzes" className="rubric-link"><HelpCircle size={13} />Quiz</Link>
              <Link href="/ranked" className="rubric-link"><Swords size={13} />Ranked</Link>
              <Link href="/check" className="rubric-link"><ShieldCheck size={13} />Check</Link>
              <Link href="/social" className="rubric-link rubric-link-active"><Users size={13} />Social</Link>
            </div>
          </div>

          <div className="section-hero-visual">
            <div className="cover-art-meta">
              <span className="cover-art-tag">Social pulse</span>
              <span className="cover-art-chip">
                <Sparkles size={14} />
              </span>
            </div>
            <div className="relative z-[1] mt-4 space-y-3">
              <FlashMasterLogo size="md" className="rounded-2xl bg-white/70 px-3 py-2" />
              <div className="mind-note rounded-[1rem] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#706a5d]">Rubrique active</p>
                <p className="mt-1 text-sm text-[#3d3a33]">Repertoire social, associations et challenges entre proches</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="game-panel animate-in-up rounded-[1.35rem] border border-[#c6d8e8] p-4" style={{ animationDelay: "70ms" }}>
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-[#21425d]"><Users size={14} /> Amis</p>
          <div className="flex gap-2">
            <Input
              id="friend_search"
              value={friendSearch}
              onChange={(event) => setFriendSearch(event.target.value)}
              placeholder="Display name exact"
            />
            <Button disabled={busy} onClick={() => void sendFriendRequest()}><Send size={14} /> Ajouter</Button>
          </div>
          {friendError ? <p className="mt-2 text-xs text-rose-700">{friendError}</p> : null}

          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64849b]">Demandes recues</p>
            {pendingReceived.length === 0 ? (
              <p className="text-xs text-[#6788a0]">Aucune demande en attente.</p>
            ) : (
              pendingReceived.map((item) => (
                <div key={item.id} className="rounded-[0.95rem] border border-[#d2e1ee] bg-white/85 p-2.5">
                  <p className="text-sm font-semibold text-[#20415c]">{item.requester?.[0]?.display_name ?? "Utilisateur"}</p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" disabled={busy} onClick={() => void respondFriendRequest(item.id, true)}>Accepter</Button>
                    <Button size="sm" variant="secondary" disabled={busy} onClick={() => void respondFriendRequest(item.id, false)}>Refuser</Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64849b]">Amis valides ({acceptedFriends.length})</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {acceptedFriends.length === 0 ? (
                <span className="text-xs text-[#6788a0]">Aucun ami valide.</span>
              ) : (
                acceptedFriends.map((friend) => (
                  <span key={friend.id} className="rounded-full border border-[#c9d9e8] bg-white/88 px-2.5 py-1 text-xs font-semibold text-[#4d6f87]">
                    {friend.label}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="game-panel animate-in-up rounded-[1.35rem] border border-[#c6d8e8] p-4" style={{ animationDelay: "100ms" }}>
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-[#21425d]"><Shield size={14} /> Associations</p>
          <div className="space-y-2 max-h-72 overflow-auto pr-1 soft-scroll">
            {associations.length === 0 ? (
              <p className="text-xs text-[#6788a0]">Aucune association disponible.</p>
            ) : (
              associations.map((association) => {
                const joined = myMemberships.includes(association.id);
                return (
                  <div key={association.id} className="rounded-[0.95rem] border border-[#d2e1ee] bg-white/85 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#20415c]">{association.name}</p>
                        <p className="text-xs text-[#5d7e96]">{association.description || "Sans description"}</p>
                        <p className="mt-1 text-[11px] text-[#6b8ca2]">
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

      <div className="game-panel animate-in-up rounded-[1.4rem] border border-[#c6d8e8] p-4" style={{ animationDelay: "130ms" }}>
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-[#21425d]"><Handshake size={14} /> Lancer une partie entre proches</p>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[#64849b]">Mode</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setChallengeMode("ranked")}
                className={clsx(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold",
                  challengeMode === "ranked"
                    ? "border-[#1f6f9d] bg-[#e8f3fb] text-[#1f5f84]"
                    : "border-[#c9d9e8] bg-white text-[#4d6f87]"
                )}
              >
                Ranked
              </button>
              <button
                type="button"
                onClick={() => setChallengeMode("training")}
                className={clsx(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold",
                  challengeMode === "training"
                    ? "border-[#1f6f9d] bg-[#e8f3fb] text-[#1f5f84]"
                    : "border-[#c9d9e8] bg-white text-[#4d6f87]"
                )}
              >
                Training
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[#64849b]">Ami cible</label>
            <select
              value={challengeFriendId}
              onChange={(event) => setChallengeFriendId(event.target.value)}
              className="w-full rounded-[0.9rem] border border-[#c9d9e8] bg-white/90 px-3 py-2 text-sm text-[#1f3f5a]"
            >
              <option value="">Ouvert (sans adversaire direct)</option>
              {acceptedFriends.map((friend) => (
                <option key={friend.id} value={friend.id}>{friend.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[#64849b]">Quiz</label>
            <select
              value={challengeQuizId}
              onChange={(event) => setChallengeQuizId(event.target.value)}
              className="w-full rounded-[0.9rem] border border-[#c9d9e8] bg-white/90 px-3 py-2 text-sm text-[#1f3f5a]"
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
            <p className="text-xs text-[#6788a0]">Aucun challenge pour le moment.</p>
          ) : (
            challenges.slice(0, 8).map((challenge) => (
              <div key={challenge.id} className="rounded-[0.95rem] border border-[#d2e1ee] bg-white/85 p-3">
                <p className="text-sm font-semibold text-[#20415c]">{challenge.quizzes?.[0]?.title ?? "Quiz"}</p>
                <p className="mt-0.5 text-xs text-[#5d7e96]">
                  {challenge.mode.toUpperCase()} · {challenge.status}
                </p>
                <p className="mt-1 text-xs text-[#5d7e96]">
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
