"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { parseCategoryPath, normalizeCategoryScope } from "@/lib/utils/ranked";
import type { QuestionReviewQueueItem, Quiz } from "@/lib/types";
import { CheckCircle2, PencilLine, ThumbsDown, ThumbsUp, Timer, Layers, HelpCircle, Swords, ShieldCheck, Users, Sparkles } from "lucide-react";
import { CapyCheck } from "@/components/illustrations/capi-illustrations";

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
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#1f6f9d]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="game-panel animate-in-up rounded-[1.5rem] border border-[#d9cfbd] p-5 lg:p-6">
        <div className="section-hero">
          <div>
            <p className="hud-chip">Community Check</p>
            <h1 className="page-title mt-2">Check</h1>
          </div>

          <div className="section-hero-visual">
            <div className="cover-art-meta">
              <span className="cover-art-tag">Review flow</span>
              <span className="cover-art-chip">
                <Sparkles size={14} />
              </span>
            </div>
            <div className="relative z-[1] mt-2 flex items-end justify-center">
              <CapyCheck className="h-36 drop-shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-[1rem] border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      {currentItem ? (
        <div className="game-panel animate-in-up space-y-4 rounded-[1.4rem] border border-[#c6d8e8] p-4" style={{ animationDelay: "70ms" }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6788a0]">
                Quiz cible: {currentItem.quizzes?.title ?? "-"}
              </p>
              <p className="mt-1 text-xs text-[#5a7b92]">
                Categorie: {normalizeCategoryScope(currentItem.category_path, currentItem.quizzes?.category)}
              </p>
            </div>
            <div className="rounded-full border border-[#c7d9e9] bg-white/82 px-3 py-1 text-xs font-semibold text-[#4d6f87]">
              Item 1 / {queueItems.length}
            </div>
          </div>

          <div className="rounded-[1rem] border border-[#d3e2ef] bg-white/78 p-4">
            <p className="text-sm font-semibold text-[#18384f]">{currentItem.question_text}</p>
            <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-2">
              {currentItem.answers.map((answer, index) => (
                <div key={`${currentItem.id}-${index}`} className="rounded-[0.9rem] border border-[#d5e3ef] bg-white/90 px-3 py-2 text-sm text-[#33566f]">
                  {index + 1}. {answer.text}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#56788f]">
              <span className="inline-flex items-center gap-1"><Timer size={12} /> Progression des checks</span>
              <span>{currentItem.likes + currentItem.dislikes + currentItem.modifications}/{currentItem.checks_required}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#d7e5f1]">
              <div className="h-2 rounded-full bg-[linear-gradient(90deg,#1f6f9d,#31a9d1)]" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">Like: {currentItem.likes}</span>
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-rose-700">Dislike: {currentItem.dislikes}</span>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">Modifs: {currentItem.modifications}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
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
        </div>
      ) : (
        <div className="game-panel animate-in-up rounded-[1.35rem] border border-[#c6d8e8] py-14 text-center" style={{ animationDelay: "70ms" }}>
          <CheckCircle2 size={42} className="mx-auto text-emerald-600" />
          <p className="mt-2 text-sm text-[#53758d]">Aucune question en attente de check.</p>
        </div>
      )}

      <div className="game-panel animate-in-up space-y-4 rounded-[1.4rem] border border-[#c6d8e8] p-4" style={{ animationDelay: "120ms" }}>
        <h2 className="text-lg font-bold text-[#102c43]">Soumettre une question a verifier</h2>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#355770]">Quiz cible</label>
          <select
            value={targetQuizId}
            onChange={(event) => setTargetQuizId(event.target.value)}
            className="w-full rounded-[0.95rem] border border-[#c9d9e8] bg-white/90 px-3 py-2 text-sm text-[#1f3f5a]"
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
            <div key={`answer-edit-${index}`} className="rounded-[1rem] border border-[#d3e2ef] bg-white/78 p-3">
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
              <label className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-[#4f7088]">
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
      </div>
    </div>
  );
}
