"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuiz } from "@/lib/hooks/use-quizzes";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Flame,
  ListChecks,
  RotateCcw,
  Swords,
  Trophy,
  XCircle,
} from "lucide-react";
import { clsx } from "clsx";
import type { QuizAnswer, RankedProfile } from "@/lib/types";
import {
  computeRankedDelta,
  getNextTier,
  getRankedScopeTargets,
  getTierFromPoints,
  normalizeCategoryScope,
} from "@/lib/utils/ranked";

const QUESTION_TIME_MS = 18000;

const ANSWER_THEMES = [
  {
    key: "A",
    idle: "bg-[linear-gradient(135deg,#df576c,#bb3048)] text-white border-[#e89aa7] hover:brightness-110",
  },
  {
    key: "B",
    idle: "bg-[linear-gradient(135deg,#2f86ca,#1f5f97)] text-white border-[#9ac7ea] hover:brightness-110",
  },
  {
    key: "C",
    idle: "bg-[linear-gradient(135deg,#ebb53f,#cb8d18)] text-white border-[#f2d496] hover:brightness-110",
  },
  {
    key: "D",
    idle: "bg-[linear-gradient(135deg,#26a66b,#1f8255)] text-white border-[#9cd9be] hover:brightness-110",
  },
] as const;

type AnswerEvent = {
  questionId: string;
  answerId: string | null;
  correct: boolean;
  points: number;
  remainingMs: number;
  timedOut: boolean;
};

type RankedUpdateSummary = {
  scopeType: "general" | "category";
  scopeKey: string;
  before: number;
  after: number;
  delta: number;
};

function getRankLabel(accuracy: number) {
  if (accuracy >= 95) return "Maitre strategiste";
  if (accuracy >= 85) return "Pilote elite";
  if (accuracy >= 70) return "Competiteur solide";
  if (accuracy >= 55) return "Progression active";
  return "Echauffement";
}

export default function PlayQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { quiz, loading } = useQuiz(id);
  const searchParams = useSearchParams();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [scorePoints, setScorePoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [roundGain, setRoundGain] = useState(0);
  const [remainingMs, setRemainingMs] = useState(QUESTION_TIME_MS);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  const [roundReady, setRoundReady] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [answers, setAnswers] = useState<AnswerEvent[]>([]);
  const [rankedUpdates, setRankedUpdates] = useState<RankedUpdateSummary[]>([]);
  const [rankedError, setRankedError] = useState<string | null>(null);

  const answeredRef = useRef(false);
  const selectedAnswerRef = useRef<string | null>(null);
  const streakRef = useRef(0);
  const questionStartedAtRef = useRef(0);
  const quizStartedAtRef = useRef(0);

  const supabase = useMemo(() => createClient(), []);

  const questions = useMemo(() => quiz?.quiz_questions ?? [], [quiz?.quiz_questions]);
  const currentQuestion = questions[currentIndex];

  // Dynamic Answer Selection: 1 correct + 3 random incorrect from the pool
  const questionAnswers = useMemo(() => {
    if (!currentQuestion?.quiz_answers) return [];

    const allAnswers = [...currentQuestion.quiz_answers];
    const correctOnes = allAnswers.filter(a => a.is_correct);
    const incorrectOnes = allAnswers.filter(a => !a.is_correct);

    // Pick 1 correct (if multiple, pick one)
    // eslint-disable-next-line
    const correct = correctOnes[Math.floor(Math.random() * correctOnes.length)] || allAnswers[0];

    // Shuffle and pick 3 incorrect
    // eslint-disable-next-line
    const shuffledIncorrect = incorrectOnes.sort(() => 0.5 - Math.random());
    const selectedIncorrect = shuffledIncorrect.slice(0, 3);

    // Combine and shuffle for display
    // eslint-disable-next-line
    return [correct, ...selectedIncorrect].sort(() => 0.5 - Math.random());
  }, [currentQuestion, currentIndex]); // currentIndex added to reshuffle if coming back or re-rendering
  const isRankedMode = searchParams.get("mode") === "ranked";
  const rankedScopeParam = searchParams.get("scope") === "category" ? "category" : "general";

  const answerLookup = useMemo(() => {
    const map = new Map<string, QuizAnswer>();
    for (const question of questions) {
      for (const answer of question.quiz_answers ?? []) {
        map.set(answer.id, answer);
      }
    }
    return map;
  }, [questions]);

  const getRemainingNow = useCallback(() => {
    if (!questionStartedAtRef.current) return QUESTION_TIME_MS;
    return Math.max(0, QUESTION_TIME_MS - (performance.now() - questionStartedAtRef.current));
  }, []);

  const resolveAnswer = useCallback(
    (answerId: string | null, timedOut: boolean) => {
      if (!currentQuestion || answeredRef.current) return;

      answeredRef.current = true;

      const remaining = getRemainingNow();
      setRemainingMs(remaining);

      const selected = answerId ?? null;
      const selectedItem = selected ? questionAnswers.find((item) => item.id === selected) : undefined;
      const isCorrect = Boolean(selectedItem?.is_correct);

      let gained = 0;
      const nextStreak = isCorrect ? streakRef.current + 1 : 0;

      if (isCorrect) {
        const speedFactor = remaining / QUESTION_TIME_MS;
        const streakBonus = Math.min(nextStreak, 8) * 35;
        gained = Math.round(480 + speedFactor * 520 + streakBonus);
        setCorrectCount((value) => value + 1);
        setScorePoints((value) => value + gained);
        setBestStreak((value) => Math.max(value, nextStreak));
      }

      streakRef.current = nextStreak;
      selectedAnswerRef.current = selected;

      setStreak(nextStreak);
      setRoundGain(gained);
      setSelectedAnswer(selected);
      setAnswered(true);
      setAnswers((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          answerId: selected,
          correct: isCorrect,
          points: gained,
          remainingMs: remaining,
          timedOut,
        },
      ]);
    },
    [currentQuestion, getRemainingNow, questionAnswers]
  );

  const handleConfirm = useCallback(() => {
    if (!selectedAnswerRef.current || answeredRef.current) return;
    resolveAnswer(selectedAnswerRef.current, false);
  }, [resolveAnswer]);

  const handleSelect = useCallback((answerId: string) => {
    if (answeredRef.current) return;
    selectedAnswerRef.current = answerId;
    setSelectedAnswer(answerId);
  }, []);

  const moveToQuestion = useCallback((nextIndex: number) => {
    if (!quizStartedAtRef.current) quizStartedAtRef.current = performance.now();
    questionStartedAtRef.current = 0;
    answeredRef.current = false;
    selectedAnswerRef.current = null;

    setCurrentIndex(nextIndex);
    setRoundReady(false);
    setCountdown(3);
    setAnswered(false);
    setSelectedAnswer(null);
    setRoundGain(0);
    setRemainingMs(QUESTION_TIME_MS);
  }, []);

  const startRun = useCallback(async () => {
    const now = performance.now();
    quizStartedAtRef.current = now;
    questionStartedAtRef.current = 0;
    answeredRef.current = false;
    selectedAnswerRef.current = null;

    setStarted(true);
    setRoundReady(false);
    setCountdown(3);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setRoundGain(0);
    setRemainingMs(QUESTION_TIME_MS);
    setRankedUpdates([]);
    setRankedError(null);
  }, []);

  const resetRun = useCallback(() => {
    const now = performance.now();
    quizStartedAtRef.current = now;
    questionStartedAtRef.current = now;
    answeredRef.current = false;
    selectedAnswerRef.current = null;
    streakRef.current = 0;

    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setCorrectCount(0);
    setScorePoints(0);
    setStreak(0);
    setBestStreak(0);
    setRoundGain(0);
    setRemainingMs(QUESTION_TIME_MS);
    setFinished(false);
    setStarted(false);
    setRoundReady(false);
    setCountdown(3);
    setAnswers([]);
    setRankedUpdates([]);
    setRankedError(null);
  }, []);

  useEffect(() => {
    if (!started || finished || roundReady || answered || !currentQuestion) return;

    const intervalId = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalId);
          questionStartedAtRef.current = performance.now();
          setRoundReady(true);
          setRemainingMs(QUESTION_TIME_MS);
          return 0;
        }
        return prev - 1;
      });
    }, 620);

    return () => window.clearInterval(intervalId);
  }, [answered, currentQuestion, finished, roundReady, started]);

  const applyRankedResults = useCallback(
    async (userId: string) => {
      if (!quiz) return;

      const allTargets = getRankedScopeTargets(quiz.category_path, quiz.category);
      const targets =
        rankedScopeParam === "category"
          ? allTargets.filter((item) => item.scopeType === "category")
          : allTargets.filter((item) => item.scopeType === "general");

      const effectiveTargets = targets.length > 0 ? targets : [{ scopeType: "general" as const, scopeKey: "general" }];
      const summaries: RankedUpdateSummary[] = [];

      for (const target of effectiveTargets) {
        const { data: existingProfile } = await supabase
          .from("ranked_profiles")
          .select("*")
          .eq("user_id", userId)
          .eq("scope_type", target.scopeType)
          .eq("scope_key", target.scopeKey)
          .maybeSingle();

        const current = (existingProfile as RankedProfile | null) ?? null;
        const currentPoints = current?.points ?? 1000;
        const rankResult = computeRankedDelta({
          currentPoints,
          correctAnswers: correctCount,
          totalQuestions: questions.length,
        });

        const nextPoints = rankResult.nextPoints;
        const wins = (current?.wins ?? 0) + (rankResult.delta > 0 ? 1 : 0);
        const losses = (current?.losses ?? 0) + (rankResult.delta <= 0 ? 1 : 0);
        const gamesPlayed = (current?.games_played ?? 0) + 1;
        const bestPoints = Math.max(current?.best_points ?? 1000, nextPoints);

        await supabase.from("ranked_profiles").upsert(
          {
            user_id: userId,
            scope_type: target.scopeType,
            scope_key: target.scopeKey,
            points: nextPoints,
            wins,
            losses,
            games_played: gamesPlayed,
            best_points: bestPoints,
          },
          {
            onConflict: "user_id,scope_type,scope_key",
          }
        );

        await supabase.from("ranked_match_results").insert({
          user_id: userId,
          quiz_id: id,
          scope_type: target.scopeType,
          scope_key: target.scopeKey,
          points_before: currentPoints,
          points_after: nextPoints,
          delta: rankResult.delta,
          correct_answers: correctCount,
          total_questions: questions.length,
        });

        summaries.push({
          scopeType: target.scopeType,
          scopeKey: target.scopeKey,
          before: currentPoints,
          after: nextPoints,
          delta: rankResult.delta,
        });
      }

      setRankedUpdates(summaries);
      setRankedError(null);
    },
    [correctCount, id, questions.length, quiz, rankedScopeParam, supabase]
  );

  const handleNext = useCallback(async () => {
    if (!currentQuestion) return;

    if (currentIndex < questions.length - 1) {
      moveToQuestion(currentIndex + 1);
      return;
    }

    const quizStart = quizStartedAtRef.current || performance.now();
    const duration = Math.max(1, Math.round((performance.now() - quizStart) / 1000));

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("quiz_sessions").insert({
        user_id: user.id,
        quiz_id: id,
        score: correctCount,
        total_questions: questions.length,
        duration_seconds: duration,
      });

      if (isRankedMode) {
        try {
          await applyRankedResults(user.id);
        } catch {
          setRankedError("Le classement n'a pas pu etre mis a jour pour cette manche.");
        }
      }
    }

    setFinished(true);
  }, [applyRankedResults, correctCount, currentIndex, currentQuestion, id, isRankedMode, moveToQuestion, questions.length, supabase]);

  useEffect(() => {
    if (!started || !roundReady || finished || answered || !currentQuestion) return;

    const intervalId = window.setInterval(() => {
      const nextRemaining = getRemainingNow();
      setRemainingMs(nextRemaining);

      if (nextRemaining <= 0 && !answeredRef.current) {
        resolveAnswer(selectedAnswerRef.current, true);
      }
    }, 90);

    return () => window.clearInterval(intervalId);
  }, [answered, currentQuestion, finished, getRemainingNow, resolveAnswer, roundReady, started]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--secondary)]" />
      </div>
    );
  }

  if (!quiz) {
    return <div className="py-16 text-center text-[var(--text-muted)]">Quiz introuvable</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-[var(--text-muted)]">Ce quiz ne contient aucune question.</p>
        <Link href={`/quizzes/${id}/edit`}>
          <Button className="mt-4">Ajouter des questions</Button>
        </Link>
      </div>
    );
  }

  const currentOutcome = answers[currentIndex];
  const timerRatio = Math.max(0, Math.min(1, remainingMs / QUESTION_TIME_MS));
  const timerSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const streakRatio = Math.max(0, Math.min(1, streak / 8));
  const countdownActive = !roundReady && !answered;
  const rankedScopeLabel =
    rankedScopeParam === "category"
      ? normalizeCategoryScope(quiz?.category_path, quiz?.category)
      : "Classement general";
  const streakLabel =
    streak >= 8
      ? "Mode fulgurant"
      : streak >= 5
        ? "Serie en feu"
        : streak >= 3
          ? "Rythme solide"
          : null;

  if (!started) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 py-8">
        <div className="game-panel animate-in-up rounded-[1.8rem] border border-[var(--line)] p-6 text-center lg:p-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <p className="hud-chip">Préparation manche</p>
            {isRankedMode ? (
              <p className="hud-chip border-[var(--line-strong)] bg-[rgba(245,158,11,0.16)] text-amber-300">Mode classé · {rankedScopeLabel}</p>
            ) : null}
          </div>
          <h1 className="mt-4 text-3xl font-black text-[var(--foreground)]">{quiz.title}</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--text-muted)]">
            {quiz.description || "Une manche rapide, rythmée, pensée pour la précision puis la vitesse."}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 text-left lg:grid-cols-4">
            <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--surface-soft)] p-3">
              <p className="text-xl font-bold text-[var(--foreground)]">{questions.length}</p>
              <p className="text-xs text-[var(--text-muted)]">Questions</p>
            </div>
            <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--surface-soft)] p-3">
              <p className="text-xl font-bold text-[var(--foreground)]">18s</p>
              <p className="text-xs text-[var(--text-muted)]">Par question</p>
            </div>
            <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--surface-soft)] p-3">
              <p className="text-xl font-bold text-[var(--foreground)]">Vitesse</p>
              <p className="text-xs text-[var(--text-muted)]">Bonus actif</p>
            </div>
            <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--surface-soft)] p-3">
              <p className="text-xl font-bold text-[var(--foreground)]">Souris</p>
              <p className="text-xs text-[var(--text-muted)]">Controle unique</p>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <Button size="lg" onClick={startRun}>Lancer la manche</Button>
            <Link href={`/quizzes/${id}`}>
              <Button size="lg" variant="secondary">Retour</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const avgReaction =
      answers.length > 0
        ? Math.round(
          (answers.reduce((sum, item) => sum + (QUESTION_TIME_MS - item.remainingMs), 0) /
            answers.length /
            100) // convert ms to 0.1s
        ) / 10
        : 0;
    const timeouts = answers.filter((item) => item.timedOut).length;

    return (
      <div className="mx-auto max-w-3xl space-y-6 py-10">
        <div className="game-panel animate-in-up rounded-[1.8rem] border border-[var(--line)] p-6 text-center lg:p-8">
          <Trophy size={64} className={clsx("mx-auto", accuracy >= 70 ? "text-amber-300" : "text-[var(--text-muted)]")} />
          <h2 className="mt-4 text-2xl font-bold text-[var(--foreground)]">Session terminée</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{getRankLabel(accuracy)}</p>
          <p className="mt-4 text-4xl font-black text-[var(--primary)]">{scorePoints} pts</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {correctCount}/{questions.length} bonnes réponses ({accuracy}%)
          </p>
        </div>

        {isRankedMode ? (
          <div className="game-panel animate-in-up rounded-[1.4rem] border border-[var(--line-strong)] bg-[var(--surface-soft)] p-4" style={{ animationDelay: "70ms" }}>
            <p className="inline-flex items-center gap-1 rounded-full border border-[var(--line-strong)] bg-[rgba(245,158,11,0.16)] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.08em] text-amber-300">
              <Swords size={12} />
              Résultat classé
            </p>

            {rankedError ? (
              <p className="mt-2 text-sm text-red-300">{rankedError}</p>
            ) : rankedUpdates.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--text-muted)]">Synchronisation du classement en cours.</p>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                {rankedUpdates.map((update) => {
                  const tier = getTierFromPoints(update.after);
                  const nextTier = getNextTier(update.after);
                  const scopeTitle =
                    update.scopeType === "general"
                      ? "Classement général"
                      : `Catégorie · ${update.scopeKey}`;

                  return (
                    <div key={`${update.scopeType}-${update.scopeKey}`} className="rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.07em] text-[var(--text-muted)]">{scopeTitle}</p>
                      <div className="mt-1 flex items-baseline justify-between gap-2">
                        <p className="text-xl font-black text-[var(--foreground)]">{update.after} RP</p>
                        <p className={clsx("text-sm font-bold", update.delta >= 0 ? "text-emerald-700" : "text-rose-700")}>
                          {update.delta >= 0 ? `+${update.delta}` : update.delta}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">Rang actuel: {tier.label}</p>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                        {nextTier ? `Prochain palier ${nextTier.label}: ${Math.max(0, nextTier.minPoints - update.after)} RP` : "Palier maximum atteint"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="game-panel rounded-[1.2rem] border border-[var(--line)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--foreground)]">{scorePoints}</p>
            <p className="text-xs text-[var(--text-muted)]">Points</p>
          </div>
          <div className="game-panel rounded-[1.2rem] border border-[var(--line)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--foreground)]">{accuracy}%</p>
            <p className="text-xs text-[var(--text-muted)]">Précision</p>
          </div>
          <div className="game-panel rounded-[1.2rem] border border-[var(--line)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--foreground)]">{bestStreak}</p>
            <p className="text-xs text-[var(--text-muted)]">Meilleure série</p>
          </div>
          <div className="game-panel rounded-[1.2rem] border border-[var(--line)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--foreground)]">{avgReaction}s</p>
            <p className="text-xs text-[var(--text-muted)]">Réaction moyenne</p>
          </div>
        </div>

        <div className="game-panel rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface-soft)] p-4 text-sm text-[var(--text-muted)]">
          <p>
            Temps expiré sur {timeouts} question{timeouts !== 1 ? "s" : ""}. Continue à viser la précision d&apos;abord, puis la vitesse.
          </p>
        </div>

        <div className="game-panel divide-y divide-[var(--line)] overflow-hidden rounded-[1.4rem] border border-[var(--line)] text-left">
          {questions.map((question, index) => {
            const answer = answers[index];
            const selected = answer?.answerId ? answerLookup.get(answer.answerId) : null;
            const correct = question.quiz_answers?.find((item: QuizAnswer) => item.is_correct);

            return (
              <div key={question.id} className="p-4">
                <div className="flex items-start gap-2">
                  {answer?.correct ? (
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--foreground)]">{index + 1}. {question.question_text}</p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      Ton choix: {selected?.answer_text ?? "Aucune réponse"}
                    </p>
                    <p className="mt-0.5 text-xs text-emerald-300">Bonne réponse: {correct?.answer_text ?? "-"}</p>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">+{answer?.points ?? 0} pts</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-3">
          <Button onClick={resetRun}>
            <RotateCcw size={16} /> Recommencer
          </Button>
          <Link href={`/quizzes/${id}`}>
            <Button variant="secondary">Retour</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="game-panel animate-in-up rounded-[1.4rem] border border-[var(--line)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link href={`/quizzes/${id}`} className="rounded-[0.9rem] border border-[var(--line)] bg-[var(--surface-soft)] p-2 text-[var(--text-muted)] transition hover:border-[var(--line-strong)] hover:text-[var(--foreground)]">
              <ArrowLeft size={20} />
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--text-muted)]">
              <ListChecks size={12} />
              Question {currentIndex + 1}/{questions.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isRankedMode ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--line-strong)] bg-[rgba(245,158,11,0.16)] px-2.5 py-1 text-xs font-semibold text-amber-300">
                <Swords size={12} />
                Classé · {rankedScopeLabel}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--text-muted)]">
              <Flame size={12} className={streak > 0 ? "text-rose-300" : "text-[var(--text-muted)]"} />
              Série {streak}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--line-strong)] bg-[rgba(0,255,255,0.12)] px-2.5 py-1 text-xs font-semibold text-[var(--secondary)]">
              {scorePoints} pts
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1"><Clock3 size={12} /> Temps restant</span>
          <span>{countdownActive ? `Prêt dans ${countdown > 0 ? countdown : "GO"}` : `${timerSeconds}s`}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--line)]">
          <div
            className={clsx(
              "h-2 rounded-full transition-all",
              countdownActive
                ? "bg-[linear-gradient(90deg,#b7cde0,#95b7d8)]"
                : timerRatio > 0.5
                  ? "bg-[linear-gradient(90deg,#22a56a,#6dcf95)]"
                  : timerRatio > 0.22
                    ? "bg-[linear-gradient(90deg,#e9ad3f,#d98b1f)]"
                    : "bg-[linear-gradient(90deg,#df576c,#bb3048)]"
            )}
            style={{ width: `${(countdownActive ? 1 : timerRatio) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence>
        {streak > 0 && (
          <motion.div
            key={`streak-${streak}`}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.24 }}
            className="game-panel rounded-[1rem] border border-[var(--line)] p-3"
          >
            <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)]">
              <span>Momentum</span>
              <span>{streak}/8</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--line)]">
              <motion.div
                className="h-2 rounded-full bg-[linear-gradient(90deg,#df576c,#1f6f9d)]"
                initial={{ width: 0 }}
                animate={{ width: `${streakRatio * 100}%` }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            {streakLabel ? (
              <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--secondary)]">{streakLabel}</p>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 16, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-4"
      >
        <div className="game-panel rounded-[1.6rem] border border-[var(--line)] p-5 text-center lg:p-7">
          {currentQuestion.image_url && (
            <Image
              src={currentQuestion.image_url}
              alt="Illustration de la question"
              width={960}
              height={560}
              className="mx-auto mb-4 max-h-56 rounded-xl border border-[var(--line)] object-contain"
            />
          )}
          <p className="text-xl font-bold text-[var(--foreground)] lg:text-2xl">{currentQuestion.question_text}</p>
        </div>

        {countdownActive ? (
          <div className="countdown-stage game-panel relative overflow-hidden rounded-[1.6rem] border border-[var(--line)] p-8 text-center lg:p-10">
            <div className="countdown-fx-ring" />
            <div className="countdown-fx-orb countdown-fx-orb-a" />
            <div className="countdown-fx-orb countdown-fx-orb-b" />
            <div className="countdown-fx-orb countdown-fx-orb-c" />

            <p className="relative z-10 text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Reponses verrouillees</p>
            <motion.p
              key={countdown}
              initial={{ opacity: 0, scale: 0.82, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 mt-2 text-6xl font-black text-[var(--secondary)] lg:text-7xl"
            >
              {countdown > 0 ? countdown : "GO"}
            </motion.p>
            <p className="relative z-10 mt-2 text-sm text-[var(--text-muted)]">Lis la question, puis clique ta reponse a GO.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {questionAnswers.map((answer, index) => {
              const theme = ANSWER_THEMES[index % ANSWER_THEMES.length];
              const isSelected = selectedAnswer === answer.id;
              const isCorrect = Boolean(answer.is_correct);
              const revealCorrect = answered && isCorrect;
              const revealWrongSelected = answered && isSelected && !isCorrect;

              let style = `border ${theme.idle}`;
              if (answered) {
                if (revealCorrect) {
                  style = "border-2 border-emerald-400 bg-[linear-gradient(135deg,rgba(16,185,129,.22),rgba(6,78,59,.34))] text-emerald-100";
                } else if (revealWrongSelected) {
                  style = "border-2 border-rose-400 bg-[linear-gradient(135deg,rgba(244,63,94,.2),rgba(127,29,29,.3))] text-rose-100";
                } else {
                  style = "border border-[var(--line)] bg-[var(--surface-soft)] text-[var(--text-muted)] opacity-80";
                }
              } else if (isSelected) {
                style = `${theme.idle} ring-4 ring-cyan-400/35`;
              }

              return (
                <button
                  key={answer.id}
                  onClick={() => handleSelect(answer.id)}
                  disabled={answered || !roundReady}
                  className={clsx(
                    "interactive-card min-h-24 w-full rounded-[1.25rem] px-4 py-3 text-left transition",
                    style
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className={clsx(
                      "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black",
                      answered ? "bg-[var(--surface)] text-[var(--foreground)]" : "bg-black/25 text-white"
                    )}>
                      {theme.key}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold lg:text-base">{answer.answer_text}</p>
                      <p className={clsx("mt-1 text-[11px]", answered ? "text-[var(--text-muted)]" : "text-white/85")}>Clique pour choisir</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className={clsx(
                "game-panel rounded-[1.2rem] border p-4",
                currentOutcome?.correct
                  ? "border-emerald-400 bg-[linear-gradient(160deg,rgba(16,185,129,.18),rgba(6,78,59,.3))]"
                  : "border-rose-400 bg-[linear-gradient(160deg,rgba(244,63,94,.16),rgba(127,29,29,.28))]"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={clsx("text-sm font-bold", currentOutcome?.correct ? "text-emerald-200" : "text-rose-200")}>
                  {currentOutcome?.correct ? "Bonne réponse" : currentOutcome?.timedOut ? "Temps écoulé" : "Mauvaise réponse"}
                </p>
                <p className="text-sm font-black text-[var(--primary)]">+{roundGain} pts</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center">
          {!answered ? (
            <Button disabled={!selectedAnswer || !roundReady} onClick={handleConfirm}>Valider</Button>
          ) : (
            <Button onClick={() => void handleNext()}>
              {currentIndex < questions.length - 1 ? "Question suivante" : "Voir le bilan"}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
