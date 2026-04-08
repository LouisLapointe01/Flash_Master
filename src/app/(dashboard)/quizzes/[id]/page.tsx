"use client";

import { use } from "react";
import { useQuiz } from "@/lib/hooks/use-quizzes";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Pencil, Play, Lock, ListChecks, Clock3, Swords, Layers, HelpCircle, ShieldCheck, Users, Sparkles } from "lucide-react";
import { normalizeCategoryScope } from "@/lib/utils/ranked";
import { FlashMasterLogo } from "@/components/branding/flash-master-logo";

export default function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { quiz, loading } = useQuiz(id);

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#1f6f9d]" /></div>;
  }

  if (!quiz) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-lg font-medium text-[#102c43]">Quiz introuvable</h2>
        <Link href="/quizzes" className="mt-2 inline-block text-[#1f6f9d] hover:text-[#134a6a]">
          Retour
        </Link>
      </div>
    );
  }

  const questions = quiz.quiz_questions ?? [];
  const estimatedMinutes = Math.max(1, Math.round(questions.length * 0.6));
  const categoryLabel = normalizeCategoryScope(quiz.category_path, quiz.category);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/quizzes" className="rounded-xl border border-[#d6cab8] bg-white/85 p-2 text-[#7a7262] hover:text-[#4b453a]">
          <ArrowLeft size={20} />
        </Link>
        <p className="text-sm font-medium text-[#726a5b]">Retour a la liste des quizzes</p>
      </div>

      <div className="game-panel animate-in-up rounded-[1.5rem] border border-[#d9cfbd] p-5 lg:p-6">
        <div className="section-hero">
          <div className="space-y-4">
            <div>
              <p className="hud-chip">Parcours quiz</p>
              <h1 className="mt-3 truncate text-2xl font-semibold text-[#2b303a]">{quiz.title}</h1>
              {quiz.description && <p className="mt-1 text-sm text-[#676258]">{quiz.description}</p>}
            </div>

            <div className="rubric-strip">
              <Link href="/decks" className="rubric-link"><Layers size={13} />Decks</Link>
              <Link href="/quizzes" className="rubric-link rubric-link-active"><HelpCircle size={13} />Quiz</Link>
              <Link href="/ranked" className="rubric-link"><Swords size={13} />Ranked</Link>
              <Link href="/check" className="rubric-link"><ShieldCheck size={13} />Check</Link>
              <Link href="/social" className="rubric-link"><Users size={13} />Social</Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#6e6759]">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#d6cab8] bg-white/88 px-2.5 py-1">
                <ListChecks size={12} />
                {questions.length} question{questions.length !== 1 ? "s" : ""}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#d6cab8] bg-white/88 px-2.5 py-1">
                <Clock3 size={12} />
                ~{estimatedMinutes} min
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#d6cab8] bg-white/88 px-2.5 py-1">
                {categoryLabel}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#cbb992] bg-[#f8f1de] px-2.5 py-1 text-[#6f5622]">
                <Lock size={12} />
                Reponses masquees avant lancement
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={`/quizzes/${id}/edit`}>
                <Button variant="secondary" size="sm"><Pencil size={14} /> Modifier</Button>
              </Link>
              <Link href={`/quizzes/${id}/play?mode=ranked&scope=general`}>
                <Button variant="secondary" size="sm"><Swords size={14} /> Classe general</Button>
              </Link>
              {quiz.category_path?.length ? (
                <Link href={`/quizzes/${id}/play?mode=ranked&scope=category`}>
                  <Button variant="secondary" size="sm"><Swords size={14} /> Classe categorie</Button>
                </Link>
              ) : null}
              <Link href={`/quizzes/${id}/play`}>
                <Button size="sm"><Play size={14} /> Lancer</Button>
              </Link>
            </div>
          </div>

          <div className="section-hero-visual">
            <div className="cover-art-meta">
              <span className="cover-art-tag">Quiz preview</span>
              <span className="cover-art-chip">
                <Sparkles size={14} />
              </span>
            </div>
            <div className="relative z-[1] mt-4 space-y-3">
              <FlashMasterLogo size="md" className="rounded-2xl bg-white/70 px-3 py-2" />
              <div className="mind-note rounded-[1rem] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#706a5d]">Rubrique active</p>
                <p className="mt-1 text-sm text-[#3d3a33]">Les reponses restent masquees jusqu&apos;au lancement du mode jeu</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="game-panel animate-in-up rounded-[1.4rem] border border-[#d9cfbd] p-4" style={{ animationDelay: "80ms" }}>
        <p className="text-sm text-[#676258]">
          Pour eviter tout biais, les choix et bonnes reponses restent invisibles ici. Le detail complet apparait uniquement en mode jeu ou en edition.
        </p>
      </div>

      <div className="game-panel animate-in-up divide-y divide-[#e5ddce] overflow-hidden rounded-[1.4rem] border border-[#d9cfbd]" style={{ animationDelay: "120ms" }}>
        {questions.length === 0 ? (
          <div className="py-12 text-center text-[#676258]">Aucune question.</div>
        ) : (
          questions.map((q, i) => {
            const answerCount = q.quiz_answers?.length ?? 0;
            return (
              <div key={q.id} className="flex flex-wrap items-start justify-between gap-3 p-4 lg:p-5">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#7b7466]">Question {i + 1}</p>
                  <p className="mt-1 text-sm font-semibold text-[#2b303a] lg:text-base">{q.question_text}</p>
                  {q.image_url && <p className="mt-2 text-xs text-[#7b7466]">Image incluse dans la question</p>}
                </div>

                <div className="inline-flex items-center gap-1 rounded-full border border-[#d6cab8] bg-white/85 px-2.5 py-1 text-xs font-semibold text-[#676258]">
                  <Lock size={12} />
                  {answerCount} choix masques
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex justify-end">
        <Link href={`/quizzes/${id}/play`}>
          <Button size="lg"><Play size={16} /> Commencer le quiz</Button>
        </Link>
      </div>
    </div>
  );
}
