"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { BarChart3, BookOpen, HelpCircle, Target, Clock, TrendingUp, Layers, Swords, ShieldCheck, Users, Sparkles } from "lucide-react";
import Link from "next/link";
import { CapyStats } from "@/components/illustrations/capi-illustrations";

interface StatsData {
  totalDecks: number;
  totalQuizzes: number;
  totalStudySessions: number;
  totalQuizSessions: number;
  totalCardsStudied: number;
  avgAccuracy: number;
  studyActivity: { date: string; count: number }[];
  recentStudySessions: { id: string; deck_title: string; cards_studied: number; cards_correct: number; duration_seconds: number; completed_at: string }[];
  recentQuizSessions: { id: string; quiz_title: string; score: number; total_questions: number; completed_at: string }[];
}

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [
        { count: totalDecks },
        { count: totalQuizzes },
        { data: studySessions },
        { data: quizSessions },
      ] = await Promise.all([
        supabase.from("decks").select("*", { count: "exact", head: true }).eq("owner_id", user.id),
        supabase.from("quizzes").select("*", { count: "exact", head: true }).eq("owner_id", user.id),
        supabase.from("study_sessions").select("*, decks(title)").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(50),
        supabase.from("quiz_sessions").select("*, quizzes(title)").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(50),
      ]);

      const totalCardsStudied = studySessions?.reduce((sum, s) => sum + s.cards_studied, 0) ?? 0;
      const totalCorrect = studySessions?.reduce((sum, s) => sum + s.cards_correct, 0) ?? 0;
      const avgAccuracy = totalCardsStudied > 0 ? Math.round((totalCorrect / totalCardsStudied) * 100) : 0;

      // Build 14-day activity
      const activityMap = new Map<string, number>();
      for (let i = 13; i >= 0; i--) {
        activityMap.set(format(subDays(new Date(), i), "yyyy-MM-dd"), 0);
      }
      studySessions?.forEach((s) => {
        const day = format(new Date(s.completed_at), "yyyy-MM-dd");
        if (activityMap.has(day)) activityMap.set(day, (activityMap.get(day) ?? 0) + 1);
      });
      quizSessions?.forEach((s) => {
        const day = format(new Date(s.completed_at), "yyyy-MM-dd");
        if (activityMap.has(day)) activityMap.set(day, (activityMap.get(day) ?? 0) + 1);
      });

      setData({
        totalDecks: totalDecks ?? 0,
        totalQuizzes: totalQuizzes ?? 0,
        totalStudySessions: studySessions?.length ?? 0,
        totalQuizSessions: quizSessions?.length ?? 0,
        totalCardsStudied,
        avgAccuracy,
        studyActivity: Array.from(activityMap, ([date, count]) => ({ date, count })),
        recentStudySessions: (studySessions ?? []).slice(0, 10).map((s) => ({
          id: s.id,
          deck_title: (s as { decks?: { title: string } }).decks?.title ?? "—",
          cards_studied: s.cards_studied,
          cards_correct: s.cards_correct,
          duration_seconds: s.duration_seconds,
          completed_at: s.completed_at,
        })),
        recentQuizSessions: (quizSessions ?? []).slice(0, 10).map((s) => ({
          id: s.id,
          quiz_title: (s as { quizzes?: { title: string } }).quizzes?.title ?? "—",
          score: s.score,
          total_questions: s.total_questions,
          completed_at: s.completed_at,
        })),
      });
      setLoading(false);
    }
    load();
  }, [supabase]);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#8c7a5b]" /></div>;

  if (!data) return null;

  const maxActivity = Math.max(...data.studyActivity.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <div className="game-panel animate-in-up rounded-[1.5rem] border border-[#d9cfbd] p-5 lg:p-6">
        <div className="section-hero">
          <div className="space-y-4">
            <div>
              <p className="hud-chip">Performance Board</p>
              <h1 className="mt-3 text-2xl font-semibold text-[#2b303a]">Statistiques</h1>
              <p className="mt-1 text-sm text-[#676258]">Analyse tes sessions, ta precision et ton rythme sur 14 jours.</p>
            </div>

            <div className="rubric-strip">
              <Link href="/decks" className="rubric-link"><Layers size={13} />Decks</Link>
              <Link href="/quizzes" className="rubric-link"><HelpCircle size={13} />Quiz</Link>
              <Link href="/ranked" className="rubric-link"><Swords size={13} />Ranked</Link>
              <Link href="/check" className="rubric-link"><ShieldCheck size={13} />Check</Link>
              <Link href="/social" className="rubric-link"><Users size={13} />Social</Link>
              <Link href="/stats" className="rubric-link rubric-link-active"><BarChart3 size={13} />Stats</Link>
            </div>
          </div>

          <div className="section-hero-visual">
            <div className="cover-art-meta">
              <span className="cover-art-tag">Activity stream</span>
              <span className="cover-art-chip">
                <Sparkles size={14} />
              </span>
            </div>
            <div className="relative z-[1] mt-2 flex items-end justify-center">
              <CapyStats className="h-36 drop-shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Decks", value: data.totalDecks, icon: BookOpen, color: "text-[#4c6079] bg-[#e8edf4]" },
          { label: "Quizzes", value: data.totalQuizzes, icon: HelpCircle, color: "text-[#5f5a75] bg-[#ece8f4]" },
          { label: "Cartes etudiees", value: data.totalCardsStudied, icon: Target, color: "text-[#4f6a53] bg-[#e8f0e8]" },
          { label: "Precision", value: `${data.avgAccuracy}%`, icon: TrendingUp, color: "text-[#7a5e2f] bg-[#f5ecd8]" },
        ].map((kpi) => (
          <div key={kpi.label} className="game-panel rounded-[1.2rem] border border-[#d9cfbd] p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${kpi.color}`}><kpi.icon size={20} /></div>
              <div>
                <p className="text-2xl font-bold text-[#2b303a]">{kpi.value}</p>
                <p className="text-xs text-[#736e62]">{kpi.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity chart */}
      <div className="game-panel rounded-[1.3rem] border border-[#d9cfbd] p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#2b303a]">
          <BarChart3 size={20} className="text-[#756443]" />
          Activité des 14 derniers jours
        </h2>
        <div className="flex items-end gap-1.5 h-32">
          {data.studyActivity.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="min-h-[2px] w-full rounded-t bg-[linear-gradient(180deg,#8f7d5e,#6f5d42)] transition-all"
                style={{ height: `${(d.count / maxActivity) * 100}%` }}
                title={`${d.count} session(s)`}
              />
              <span className="text-[10px] text-[#8c8576]">
                {format(new Date(d.date), "dd", { locale: fr })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent sessions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Study sessions */}
        <div className="game-panel rounded-[1.3rem] border border-[#d9cfbd] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#2b303a]">Sessions d&apos;etude recentes</h2>
          {data.recentStudySessions.length === 0 ? (
            <p className="text-sm text-[#676258]">Aucune session</p>
          ) : (
            <div className="space-y-3">
              {data.recentStudySessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-[#2b303a]">{s.deck_title}</p>
                    <p className="text-xs text-[#736e62]">
                      {s.cards_correct}/{s.cards_studied} correctes
                      <span className="mx-1">·</span>
                      <Clock size={10} className="inline" /> {Math.floor(s.duration_seconds / 60)}min
                    </p>
                  </div>
                  <span className="text-xs text-[#8c8576]">
                    {format(new Date(s.completed_at), "dd MMM", { locale: fr })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quiz sessions */}
        <div className="game-panel rounded-[1.3rem] border border-[#d9cfbd] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#2b303a]">Sessions de quiz recentes</h2>
          {data.recentQuizSessions.length === 0 ? (
            <p className="text-sm text-[#676258]">Aucune session</p>
          ) : (
            <div className="space-y-3">
              {data.recentQuizSessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-[#2b303a]">{s.quiz_title}</p>
                    <p className="text-xs text-[#736e62]">
                      {s.score}/{s.total_questions} ({Math.round((s.score / s.total_questions) * 100)}%)
                    </p>
                  </div>
                  <span className="text-xs text-[#8c8576]">
                    {format(new Date(s.completed_at), "dd MMM", { locale: fr })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
