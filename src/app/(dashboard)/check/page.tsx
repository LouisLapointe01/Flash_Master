"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { parseCategoryPath, normalizeCategoryScope } from "@/lib/utils/ranked";
import type { QuestionReviewQueueItem, Quiz } from "@/lib/types";
import { CheckCircle2, PencilLine, ShieldCheck, ThumbsDown, ThumbsUp, Timer } from "lucide-react";
import { FlashMasterLogo } from "@/components/branding/flash-master-logo";

type QueueRow = QuestionReviewQueueItem & {
  quizzes?: Pick<Quiz, "id" | "title" | "category" | "category_path">;
  profiles?: { display_name: string };
};

function parseAnswers(value: unknown) {
  if (!Array.isArray(value)) return [] as Array<{ text: string; is_correct: boolean }>;
  return value.map((item) => {
    const source = item as { text?: string; is_correct?: boolean };
    return {
      text: source.text ?? "",
      is_correct: Boolean(source.is_correct),
    };
  });
}

const EMPTY_ANSWERS = [
  { text: "", is_correct: true },
  { text: "", is_correct: false },
  { text: "", is_correct: false },
  { text: "", is_correct: false },
];

export default function CheckPage() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [queueItems, setQueueItems] = useState<QueueRow[]>([]);
  const [myQuizzes, setMyQuizzes] = useState<Array<Pick<Quiz, "id" | "title" | "category" | "category_path">>>([]);
  const [voteLoading, setVoteLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modificationText, setModificationText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [targetQuizId, setTargetQuizId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [categoryPathInput, setCategoryPathInput] = useState("");
  const [answers, setAnswers] = useState(EMPTY_ANSWERS);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const [{ data: queueData }, { data: quizzesData }] = await Promise.all([
        supabase
          .from("question_review_queue")
          .select("*, quizzes(id, title, category, category_path), profiles(display_name)")
          .eq("status", "pending")
          .order("created_at", { ascending: true })
          .limit(40),
        supabase
          .from("quizzes")
          .select("id, title, category, category_path")
          .eq("owner_id", user.id)
          .order("updated_at", { ascending: false }),
      ]);

      const mappedQueue = ((queueData as QueueRow[]) ?? []).map((item) => ({
        ...item,
        answers: parseAnswers((item as { answers?: unknown }).answers),
      }));

      setQueueItems(mappedQueue);
      setMyQuizzes((quizzesData as Array<Pick<Quiz, "id" | "title" | "category" | "category_path">>) ?? []);
      if (!targetQuizId && quizzesData && quizzesData.length > 0) {
        setTargetQuizId(quizzesData[0].id);
      }
      setLoading(false);
    }

    void load();
  }, [supabase, targetQuizId]);

  const currentItem = queueItems[0] ?? null;

  const progress = useMemo(() => {
    if (!currentItem) return 0;
    const total = currentItem.likes + currentItem.dislikes + currentItem.modifications;
    return Math.max(0, Math.min(1, total / currentItem.checks_required));
  }, [currentItem]);

  async function vote(action: "like" | "dislike" | "modify") {
    if (!currentItem) return;

    setVoteLoading(true);
    setError(null);
    const modificationPayload = action === "modify" ? { text: modificationText.trim() } : {};

    const { error: rpcError } = await supabase.rpc("apply_review_vote", {
      p_queue_id: currentItem.id,
      p_action: action,
      p_modification_payload: modificationPayload,
    });

    if (rpcError) {
      setError(rpcError.message);
      setVoteLoading(false);
      return;
    }

    const { data: queueData } = await supabase
      .from("question_review_queue")
      .select("*, quizzes(id, title, category, category_path), profiles(display_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(40);

    setQueueItems(
      ((queueData as QueueRow[]) ?? []).map((item) => ({
        ...item,
        answers: parseAnswers((item as { answers?: unknown }).answers),
      }))
    );
    setModificationText("");
    setVoteLoading(false);
  }

  async function submitQuestion() {
    if (!targetQuizId || !questionText.trim()) return;

    const hasCorrect = answers.some((answer) => answer.is_correct && answer.text.trim());
    if (!hasCorrect) {
      setError("Ajoute au moins une reponse correcte.");
      return;
    }

    if (answers.some((answer) => !answer.text.trim())) {
      setError("Toutes les reponses doivent etre renseignees.");
      return;
    }

    setSubmitLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Utilisateur non authentifie.");
      setSubmitLoading(false);
      return;
    }

    const categoryPath = parseCategoryPath(categoryPathInput);

    const { error: insertError } = await supabase.from("question_review_queue").insert({
      target_quiz_id: targetQuizId,
      author_id: user.id,
      question_text: questionText.trim(),
      category_path: categoryPath,
      answers: answers.map((answer) => ({
        text: answer.text.trim(),
        is_correct: answer.is_correct,
      })),
    });

    if (insertError) {
      setError(insertError.message);
      setSubmitLoading(false);
      return;
    }

    setQuestionText("");
    setCategoryPathInput("");
    setAnswers(EMPTY_ANSWERS);

    const { data: queueData } = await supabase
      .from("question_review_queue")
      .select("*, quizzes(id, title, category, category_path), profiles(display_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(40);

    setQueueItems(
      ((queueData as QueueRow[]) ?? []).map((item) => ({
        ...item,
        answers: parseAnswers((item as { answers?: unknown }).answers),
      }))
    );
    setSubmitLoading(false);
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
      <section className="game-panel animate-in-up p-5 lg:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="hud-chip">Community check</p>
            <h1 className="page-title">Check</h1>
            <p className="max-w-2xl text-sm text-[var(--text-muted)]">
              Soumets des questions, puis valide celles de la communaute avec un flux rapide et propre.
            </p>
          </div>

          <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3">
            <FlashMasterLogo size="md" />
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
              Review pipeline
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1rem] border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="game-panel animate-in-up space-y-4 p-4 lg:p-5" style={{ animationDelay: "70ms" }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 font-mono text-base font-black uppercase tracking-[0.08em] text-[var(--foreground)]">
              <ShieldCheck size={16} /> Soumettre une question
            </h2>
            <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
              Workflow communautaire
            </span>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Quiz cible</label>
            <select
              value={targetQuizId}
              onChange={(event) => setTargetQuizId(event.target.value)}
              className="w-full rounded-[0.9rem] border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition-all duration-150 ease-in-out focus:border-[var(--line-strong)] focus:ring-4 focus:ring-cyan-400/20"
            >
              {myQuizzes.length === 0 ? <option value="">Aucun quiz perso</option> : null}
              {myQuizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
              ))}
            </select>
          </div>

          <Textarea
            id="question_text"
            label="Question"
            value={questionText}
            onChange={(event) => setQuestionText(event.target.value)}
            placeholder="Saisis la question a soumettre"
            rows={3}
          />

          <Input
            id="category_path"
            label="Categorie hierarchique"
            value={categoryPathInput}
            onChange={(event) => setCategoryPathInput(event.target.value)}
            placeholder="Science > Biologie > Ornithologie"
          />

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {answers.map((answer, index) => (
              <div key={`answer-edit-${index}`} className="rounded-[0.95rem] border border-[var(--line)] bg-[var(--surface-soft)] p-3">
                <Input
                  id={`answer_${index}`}
                  label={`Reponse ${index + 1}`}
                  value={answer.text}
                  onChange={(event) => {
                    setAnswers((prev) =>
                      prev.map((item, answerIndex) =>
                        answerIndex === index ? { ...item, text: event.target.value } : item
                      )
                    );
                  }}
                  placeholder="Texte de la reponse"
                />
                <label className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
                  <input
                    type="checkbox"
                    checked={answer.is_correct}
                    onChange={(event) => {
                      setAnswers((prev) =>
                        prev.map((item, answerIndex) =>
                          answerIndex === index ? { ...item, is_correct: event.target.checked } : item
                        )
                      );
                    }}
                    className="h-4 w-4 rounded border-[var(--line)] bg-transparent text-green-400"
                  />
                  Bonne reponse
                </label>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button disabled={submitLoading || !targetQuizId} onClick={() => void submitQuestion()}>
              {submitLoading ? "Envoi..." : "Soumettre au check"}
            </Button>
          </div>
        </section>

        {currentItem ? (
          <section className="game-panel animate-in-up space-y-4 p-4 lg:p-5" style={{ animationDelay: "110ms" }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Quiz cible: {currentItem.quizzes?.title ?? "-"}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Categorie: {normalizeCategoryScope(currentItem.category_path, currentItem.quizzes?.category)}
                </p>
              </div>
              <div className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
                Item 1 / {queueItems.length}
              </div>
            </div>

            <div className="rounded-[0.95rem] border border-[var(--line)] bg-[var(--surface-soft)] p-4">
              <p className="text-sm font-semibold text-[var(--foreground)]">{currentItem.question_text}</p>
              <div className="mt-3 grid grid-cols-1 gap-2">
                {currentItem.answers.map((answer, index) => (
                  <div key={`${currentItem.id}-${index}`} className="rounded-[0.8rem] border border-[var(--line)] bg-black/20 px-3 py-2 text-sm text-[var(--foreground)]">
                    {index + 1}. {answer.text}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[var(--text-muted)]">
                <span className="inline-flex items-center gap-1"><Timer size={12} /> Progression des checks</span>
                <span>{currentItem.likes + currentItem.dislikes + currentItem.modifications}/{currentItem.checks_required}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-cyan-500/15">
                <div className="h-2 rounded-full bg-[linear-gradient(90deg,#00f5ff,#39ff14)]" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-emerald-300">Like: {currentItem.likes}</span>
                <span className="rounded-full border border-red-500/35 bg-red-500/10 px-2 py-0.5 text-red-300">Dislike: {currentItem.dislikes}</span>
                <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-amber-300">Modifs: {currentItem.modifications}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button disabled={voteLoading} onClick={() => void vote("like")}>
                <ThumbsUp size={14} /> Like
              </Button>
              <Button disabled={voteLoading} variant="secondary" onClick={() => void vote("dislike")}>
                <ThumbsDown size={14} /> Dislike
              </Button>
              <Button disabled={voteLoading} variant="secondary" onClick={() => void vote("modify")}>
                <PencilLine size={14} /> Proposer modif
              </Button>
            </div>

            <Textarea
              id="modification"
              label="Suggestion de modification"
              value={modificationText}
              onChange={(event) => setModificationText(event.target.value)}
              placeholder="Ex: reformuler la question ou corriger une reponse"
              rows={2}
            />
          </section>
        ) : (
          <section className="game-panel animate-in-up py-14 text-center" style={{ animationDelay: "110ms" }}>
            <CheckCircle2 size={42} className="mx-auto text-emerald-400" />
            <p className="mt-2 text-sm text-[var(--text-muted)]">Aucune question en attente de check.</p>
          </section>
        )}
      </div>
    </div>
  );
}
