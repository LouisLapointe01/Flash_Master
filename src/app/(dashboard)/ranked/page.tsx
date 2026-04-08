"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
import { Flame, Medal, Swords, Target, Trophy, Layers, HelpCircle, ShieldCheck, Users, Sparkles } from "lucide-react";
import type { RankedProfile } from "@/lib/types";
import { CapyRanked } from "@/components/illustrations/capi-illustrations";
import {
  getNextTier,
  getTierFromPoints,
  getTierProgress,
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

function getQuestionCount(quiz: QuizWithCount) {
  if (!Array.isArray(quiz.quiz_questions) || quiz.quiz_questions.length === 0) return 0;
  const first = quiz.quiz_questions[0] as { count?: number };
  return first.count ?? 0;
}

export default function RankedPage() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<QuizWithCount[]>([]);
  const [profiles, setProfiles] = useState<RankedProfile[]>([]);
  const [scopeFilter, setScopeFilter] = useState<string>("all");

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

      const [{ data: rankedData }, { data: quizData }] = await Promise.all([
        supabase
          .from("ranked_profiles")
          .select("*")
          .eq("user_id", user.id)
          .order("points", { ascending: false }),
        supabase
          .from("quizzes")
          .select("id, title, description, category, category_path, visibility, quiz_questions(count), profiles(display_name)")
          .eq("visibility", "public")
          .order("updated_at", { ascending: false })
          .limit(60),
      ]);

      setProfiles((rankedData as RankedProfile[]) ?? []);
      setQuizzes(((quizData as unknown as QuizWithCount[]) ?? []));
      setLoading(false);
    }

    void load();
  }, [supabase]);

  const generalProfile = useMemo(
    () => profiles.find((item) => item.scope_type === "general" && item.scope_key === "general") ?? null,
    [profiles]
  );

  const categoryProfiles = useMemo(
    () => profiles.filter((item) => item.scope_type === "category"),
    [profiles]
  );

  const scopes = useMemo(() => {
    const fromProfiles = new Set(categoryProfiles.map((item) => item.scope_key));
    const fromQuizzes = quizzes
      .map((quiz) => normalizeCategoryScope(quiz.category_path, quiz.category).toLowerCase())
      .filter((label) => label !== "general");

    for (const label of fromQuizzes) {
      fromProfiles.add(label);
    }

    return Array.from(fromProfiles).sort((a, b) => a.localeCompare(b));
  }, [categoryProfiles, quizzes]);

  const filteredQuizzes = useMemo(() => {
    if (scopeFilter === "all") return quizzes;

    return quizzes.filter((quiz) => {
      const category = normalizeCategoryScope(quiz.category_path, quiz.category).toLowerCase();
      return category === scopeFilter;
    });
  }, [quizzes, scopeFilter]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#1f6f9d]" />
      </div>
    );
  }

  const currentGeneralPoints = generalProfile?.points ?? 1000;
  const currentTier = getTierFromPoints(currentGeneralPoints);
  const nextTier = getNextTier(currentGeneralPoints);

  return (
    <div className="space-y-6">
      <div className="game-panel animate-in-up rounded-[1.5rem] border border-[#d9cfbd] p-5 lg:p-6">
        <div className="section-hero">
          <div className="space-y-4">
            <div>
              <p className="hud-chip">Ranked Arena</p>
              <h1 className="mt-3 text-2xl font-semibold text-[#2b303a]">Mode classe</h1>
              <p className="mt-1 text-sm text-[#676258]">
                Quiz illimites, points qui montent et descendent, paliers de plus en plus exigeants.
              </p>
            </div>

            <div className="rubric-strip">
              <Link href="/decks" className="rubric-link"><Layers size={13} />Decks</Link>
              <Link href="/quizzes" className="rubric-link"><HelpCircle size={13} />Quiz</Link>
              <Link href="/ranked" className="rubric-link rubric-link-active"><Swords size={13} />Ranked</Link>
              <Link href="/check" className="rubric-link"><ShieldCheck size={13} />Check</Link>
              <Link href="/social" className="rubric-link"><Users size={13} />Social</Link>
            </div>

            <div className="min-w-[16rem] rounded-[1.1rem] border border-[#d3c392] bg-[linear-gradient(160deg,#fff7df,#f8efd2)] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7b5e1e]">Classement general</p>
              <p className="mt-1 text-3xl font-black text-[#24384f]">{currentGeneralPoints} RP</p>
              <p className="mt-0.5 text-xs text-[#6f5e3c]">Rang: {currentTier.label}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e5d8b2]">
                <div
                  className="h-2 rounded-full bg-[linear-gradient(90deg,#dca640,#f1cb67)]"
                  style={{ width: `${Math.round(getTierProgress(currentGeneralPoints) * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-[#6f5e3c]">
                {nextTier
                  ? `Prochain palier ${nextTier.label}: ${Math.max(0, nextTier.minPoints - currentGeneralPoints)} RP`
                  : "Palier maximum atteint"}
              </p>
            </div>
          </div>

          <div className="section-hero-visual">
            <div className="cover-art-meta">
              <span className="cover-art-tag">Ranked season</span>
              <span className="cover-art-chip">
                <Sparkles size={14} />
              </span>
            </div>
            <div className="relative z-[1] mt-2 flex items-end justify-center">
              <CapyRanked className="h-36 drop-shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="game-panel animate-in-up rounded-[1.35rem] border border-[#c6d8e8] p-4" style={{ animationDelay: "70ms" }}>
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

      {categoryProfiles.length > 0 ? (
        <div className="game-panel animate-in-up rounded-[1.35rem] border border-[#c6d8e8] p-4" style={{ animationDelay: "110ms" }}>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.09em] text-[#587790]">Classements specialises</p>
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            {categoryProfiles.slice(0, 6).map((profile) => {
              const tier = getTierFromPoints(profile.points);
              return (
                <div key={profile.id} className="rounded-[1rem] border border-[#d4e2ee] bg-white/78 p-3">
                  <p className="truncate text-xs font-semibold uppercase tracking-[0.07em] text-[#6a86a0]">{profile.scope_key}</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-lg font-black text-[#14334d]">{profile.points} RP</p>
                    <span className="rounded-full bg-[#edf5ff] px-2 py-0.5 text-xs font-semibold text-[#2b5d86]">{tier.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

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
