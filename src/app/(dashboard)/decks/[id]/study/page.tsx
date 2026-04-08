"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDeck } from "@/lib/hooks/use-decks";
import { StudyCard } from "@/components/flashcards/study-card";
import { createClient } from "@/lib/supabase/client";
import { calculateSM2, qualityFromDifficulty } from "@/lib/utils/spaced-repetition";
import Link from "next/link";
import { ArrowLeft, CheckCircle, RotateCcw, Layers, HelpCircle, Swords, ShieldCheck, Users, Sparkles, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FlashcardProgress } from "@/lib/types";
import { FlashMasterLogo } from "@/components/branding/flash-master-logo";
import { normalizeCategoryScope } from "@/lib/utils/ranked";

export default function StudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { deck, loading } = useDeck(id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState<Record<string, FlashcardProgress>>({});
  const [correct, setCorrect] = useState(0);
  const [studied, setStudied] = useState(0);
  const [finished, setFinished] = useState(false);
  const startTimeRef = useRef(0);
  const supabase = createClient();

  const cards = useMemo(() => deck?.flashcards ?? [], [deck?.flashcards]);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  const loadProgress = useCallback(async () => {
    if (cards.length === 0) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("flashcard_progress")
      .select("*")
      .eq("user_id", user.id)
      .in(
        "flashcard_id",
        cards.map((c) => c.id)
      );

    const map: Record<string, FlashcardProgress> = {};
    data?.forEach((p) => {
      map[p.flashcard_id] = p as FlashcardProgress;
    });
    setProgress(map);
  }, [cards, supabase]);

  useEffect(() => {
    if (cards.length === 0) return;

    const timeoutId = window.setTimeout(() => {
      void loadProgress();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [cards.length, loadProgress]);

  async function handleRate(difficulty: "again" | "hard" | "good" | "easy") {
    const card = cards[currentIndex];
    if (!card) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const existing = progress[card.id];
    const quality = qualityFromDifficulty(difficulty);
    const result = calculateSM2({
      quality,
      easeFactor: existing?.ease_factor ?? 2.5,
      intervalDays: existing?.interval_days ?? 0,
      reviewCount: existing?.review_count ?? 0,
    });

    const upsertData = {
      user_id: user.id,
      flashcard_id: card.id,
      proficiency: result.proficiency,
      ease_factor: result.easeFactor,
      interval_days: result.intervalDays,
      next_review: result.nextReview.toISOString(),
      review_count: (existing?.review_count ?? 0) + 1,
    };

    if (existing) {
      await supabase.from("flashcard_progress").update(upsertData).eq("id", existing.id);
    } else {
      await supabase.from("flashcard_progress").insert(upsertData);
    }

    setStudied((s) => s + 1);
    if (difficulty === "good" || difficulty === "easy") setCorrect((c) => c + 1);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Session terminée
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      await supabase.from("study_sessions").insert({
        user_id: user.id,
        deck_id: id,
        cards_studied: studied + 1,
        cards_correct: correct + (difficulty === "good" || difficulty === "easy" ? 1 : 0),
        duration_seconds: duration,
      });
      setFinished(true);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#0e8f8f]" />
      </div>
    );
  }

  if (!deck) return <div className="py-16 text-center text-[#4a747a]">Deck introuvable</div>;

  const categoryLabel = normalizeCategoryScope(deck.category_path, deck.category);

  if (cards.length === 0) {
    return (
      <div className="game-panel rounded-[1.35rem] border border-[#d9cfbd] py-16 text-center">
        <p className="text-[#676258]">Ce deck ne contient aucune carte.</p>
        <Link href={`/decks/${id}/edit`}>
          <Button className="mt-4">Ajouter des cartes</Button>
        </Link>
      </div>
    );
  }

  if (finished) {
    const pct = studied > 0 ? Math.round((correct / studied) * 100) : 0;
    return (
      <div className="mx-auto max-w-xl space-y-6 py-16 text-center">
        <CheckCircle size={64} className="mx-auto text-emerald-500" />
        <h2 className="text-2xl font-bold text-[#2b303a]">Session terminee !</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="game-panel rounded-xl border border-[#d9cfbd] p-4">
            <p className="text-2xl font-bold text-[#2b303a]">{studied}</p>
            <p className="text-xs text-[#676258]">Cartes</p>
          </div>
          <div className="game-panel rounded-xl border border-[#d9cfbd] p-4">
            <p className="text-2xl font-bold text-emerald-600">{correct}</p>
            <p className="text-xs text-[#676258]">Correctes</p>
          </div>
          <div className="game-panel rounded-xl border border-[#d9cfbd] p-4">
            <p className="text-2xl font-bold text-[#7a6643]">{pct}%</p>
            <p className="text-xs text-[#676258]">Score</p>
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <Button
            onClick={() => {
              setCurrentIndex(0);
              setStudied(0);
              setCorrect(0);
              setFinished(false);
              startTimeRef.current = Date.now();
            }}
          >
            <RotateCcw size={16} /> Recommencer
          </Button>
          <Link href={`/decks/${id}`}>
            <Button variant="secondary">Retour au deck</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/decks/${id}`} className="rounded-xl border border-[#d6cab8] bg-white/85 p-2 text-[#7a7262] hover:text-[#4b453a]">
          <ArrowLeft size={20} />
        </Link>
        <p className="text-sm font-medium text-[#726a5b]">Retour au detail du deck</p>
      </div>

      <div className="game-panel animate-in-up rounded-[1.5rem] border border-[#d9cfbd] p-5 lg:p-6">
        <div className="section-hero">
          <div className="space-y-4">
            <div>
              <p className="hud-chip">Study Session</p>
              <h1 className="mt-3 text-2xl font-semibold text-[#2b303a]">{deck.title}</h1>
              <p className="mt-1 text-sm text-[#676258]">Session active de repetition espacee.</p>
            </div>

            <div className="rubric-strip">
              <Link href="/decks" className="rubric-link rubric-link-active"><Layers size={13} />Decks</Link>
              <Link href="/quizzes" className="rubric-link"><HelpCircle size={13} />Quiz</Link>
              <Link href="/ranked" className="rubric-link"><Swords size={13} />Ranked</Link>
              <Link href="/check" className="rubric-link"><ShieldCheck size={13} />Check</Link>
              <Link href="/social" className="rubric-link"><Users size={13} />Social</Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#6e6759]">
              <span className="rounded-full border border-[#d6cab8] bg-white/88 px-2.5 py-1">{currentIndex + 1} / {cards.length}</span>
              <span className="rounded-full border border-[#d6cab8] bg-white/88 px-2.5 py-1">{categoryLabel}</span>
            </div>
          </div>

          <div className="section-hero-visual">
            <div className="cover-art-meta">
              <span className="cover-art-tag">Focus mode</span>
              <span className="cover-art-chip">
                <Sparkles size={14} />
              </span>
            </div>
            <div className="relative z-[1] mt-4 space-y-3">
              <FlashMasterLogo size="md" className="rounded-2xl bg-white/70 px-3 py-2" />
              <div className="mind-note rounded-[1rem] p-3">
                <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#706a5d]"><BrainCircuit size={12} /> Rubrique active</p>
                <p className="mt-1 text-sm text-[#3d3a33]">Evaluation continue de difficultes via SM-2</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-[#e5ddce]">
        <div
          className="h-2 rounded-full bg-[linear-gradient(90deg,#7b6847,#c5aa79)] transition-all"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      <StudyCard card={cards[currentIndex]} onRate={handleRate} />
    </div>
  );
}
