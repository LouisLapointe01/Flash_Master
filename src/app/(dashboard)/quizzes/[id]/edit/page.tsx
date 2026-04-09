"use client";

import { use, useState } from "react";
import { useQuiz } from "@/lib/hooks/use-quizzes";
import { QuestionForm } from "@/components/quizzes/question-form";
import { QuizForm } from "@/components/quizzes/quiz-form";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/utils/image-compression";
import { uploadImageWithApi } from "@/lib/utils/storage-upload";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Pencil, GripVertical, Check, Layers, HelpCircle, Swords, ShieldCheck, Users, Sparkles } from "lucide-react";
import type { QuizQuestion } from "@/lib/types";
import { FlashMasterLogo } from "@/components/branding/flash-master-logo";
import { normalizeCategoryScope } from "@/lib/utils/ranked";

export default function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { quiz, loading, setQuiz } = useQuiz(id);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editingQuiz, setEditingQuiz] = useState(false);
  const supabase = createClient();

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" /></div>;
  if (!quiz) return <div className="text-center py-16 text-gray-500">Quiz introuvable</div>;

  const questions = quiz.quiz_questions ?? [];
  const categoryLabel = normalizeCategoryScope(quiz.category_path, quiz.category);

  async function uploadImage(file: File): Promise<string> {
    const compressed = await compressImage(file);
    return uploadImageWithApi("card-images", compressed);
  }

  async function handleAddQuestion(
    values: { question_text: string; answers: { answer_text: string; is_correct: boolean }[] },
    image?: File | null
  ) {
    let image_url: string | null = null;
    if (image) image_url = await uploadImage(image);

    const { data: question, error } = await supabase
      .from("quiz_questions")
      .insert({ quiz_id: id, question_text: values.question_text, image_url, position: questions.length })
      .select()
      .single();

    if (error) throw error;

    const answersData = values.answers.map((a, i) => ({
      question_id: question.id,
      answer_text: a.answer_text,
      is_correct: a.is_correct,
      position: i,
    }));

    const { data: answers } = await supabase.from("quiz_answers").insert(answersData).select();

    setQuiz({
      ...quiz!,
      quiz_questions: [...(quiz!.quiz_questions ?? []), { ...question, quiz_answers: answers ?? [] } as QuizQuestion],
    });
    setShowAddQuestion(false);
  }

  async function handleDeleteQuestion(questionId: string) {
    await supabase.from("quiz_questions").delete().eq("id", questionId);
    setQuiz({ ...quiz!, quiz_questions: quiz!.quiz_questions?.filter((q) => q.id !== questionId) });
  }

  async function handleUpdateQuiz(values: Record<string, unknown>) {
    await supabase.from("quizzes").update(values).eq("id", id);
    setQuiz({ ...quiz!, ...values } as typeof quiz);
    setEditingQuiz(false);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/quizzes/${id}`} className="rounded-xl border border-[#d6cab8] bg-white/85 p-2 text-[#7a7262] hover:text-[#4b453a]"><ArrowLeft size={20} /></Link>
        <p className="text-sm font-medium text-[#726a5b]">Retour au detail du quiz</p>
      </div>

      <div className="game-panel animate-in-up rounded-[1.5rem] border border-[#d9cfbd] p-5 lg:p-6">
        <div className="section-hero">
          <div className="space-y-4">
            <div>
              <p className="hud-chip">Quiz Editor</p>
              <h1 className="mt-3 text-2xl font-semibold text-[#2b303a]">Modifier: {quiz.title}</h1>
              <p className="mt-1 text-sm text-[#676258]">Edition des metadonnees, questions et choix de reponse.</p>
            </div>

            <div className="rubric-strip">
              <Link href="/decks" className="rubric-link"><Layers size={13} />Decks</Link>
              <Link href="/quizzes" className="rubric-link rubric-link-active"><HelpCircle size={13} />Quiz</Link>
              <Link href="/ranked" className="rubric-link"><Swords size={13} />Ranked</Link>
              <Link href="/check" className="rubric-link"><ShieldCheck size={13} />Check</Link>
              <Link href="/social" className="rubric-link"><Users size={13} />Social</Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#6e6759]">
              <span className="rounded-full border border-[#d6cab8] bg-white/88 px-2.5 py-1">{questions.length} question{questions.length !== 1 ? "s" : ""}</span>
              <span className="rounded-full border border-[#d6cab8] bg-white/88 px-2.5 py-1">{categoryLabel}</span>
            </div>

            <div>
              <Button variant="secondary" size="sm" onClick={() => setEditingQuiz(!editingQuiz)}>
                <Pencil size={14} /> {editingQuiz ? "Fermer" : "Infos du quiz"}
              </Button>
            </div>
          </div>

          <div className="section-hero-visual">
            <div className="cover-art-meta">
              <span className="cover-art-tag">Question studio</span>
              <span className="cover-art-chip">
                <Sparkles size={14} />
              </span>
            </div>
            <div className="relative z-[1] mt-4 space-y-3">
              <FlashMasterLogo size="md" className="rounded-2xl bg-white/70 px-3 py-2" />
              <div className="mind-note rounded-[1rem] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#706a5d]">Rubrique active</p>
                <p className="mt-1 text-sm text-[#3d3a33]">Creation de quiz en mode editorial avec controle des reponses</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editingQuiz && (
        <div className="game-panel rounded-xl border border-[#d9cfbd] p-6">
          <QuizForm initialValues={quiz} onSubmit={handleUpdateQuiz} onCancel={() => setEditingQuiz(false)} submitLabel="Sauvegarder" />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#2b303a]">Questions ({questions.length})</h2>
          <Button size="sm" onClick={() => setShowAddQuestion(!showAddQuestion)}><Plus size={14} /> Ajouter</Button>
        </div>

        {showAddQuestion && <QuestionForm onSubmit={handleAddQuestion} onCancel={() => setShowAddQuestion(false)} />}

        {questions.map((q: QuizQuestion, i: number) => (
          <div key={q.id}>
            {editingQuestion === q.id ? (
              <QuestionForm
                initialValues={{ question_text: q.question_text, answers: q.quiz_answers?.map((a) => ({ answer_text: a.answer_text, is_correct: a.is_correct })) ?? [] }}
                onSubmit={async (values) => {
                  await supabase.from("quiz_questions").update({ question_text: values.question_text }).eq("id", q.id);
                  await supabase.from("quiz_answers").delete().eq("question_id", q.id);
                  const answersData = values.answers.map((a, j) => ({ question_id: q.id, answer_text: a.answer_text, is_correct: a.is_correct, position: j }));
                  const { data: newAnswers } = await supabase.from("quiz_answers").insert(answersData).select();
                  setQuiz({
                    ...quiz!,
                    quiz_questions: quiz!.quiz_questions?.map((qq) =>
                      qq.id === q.id ? { ...qq, question_text: values.question_text, quiz_answers: newAnswers ?? [] } : qq
                    ),
                  });
                  setEditingQuestion(null);
                }}
                onCancel={() => setEditingQuestion(null)}
                submitLabel="Sauvegarder"
              />
            ) : (
              <div className="game-panel flex items-start gap-3 rounded-xl border border-[#d9cfbd] p-4">
                <GripVertical size={16} className="mt-1 flex-shrink-0 text-[#a09683]" />
                <span className="mt-1 w-6 flex-shrink-0 text-right font-mono text-xs text-[#8c8576]">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="mb-1 text-sm font-medium text-[#2b303a]">{q.question_text}</p>
                  <div className="flex flex-wrap gap-1">
                    {q.quiz_answers?.map((a) => (
                      <span key={a.id} className={`rounded px-2 py-0.5 text-xs ${a.is_correct ? "bg-[#e7f2e8] text-[#3f6a46]" : "bg-[#f3efe7] text-[#6f6759]"}`}>
                        {a.is_correct && <Check size={10} className="inline mr-1" />}{a.answer_text}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => setEditingQuestion(q.id)} className="rounded p-1.5 text-[#7f7868] hover:text-[#4f4a3f]"><Pencil size={14} /></button>
                  <button onClick={() => handleDeleteQuestion(q.id)} className="rounded p-1.5 text-[#7f7868] hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
