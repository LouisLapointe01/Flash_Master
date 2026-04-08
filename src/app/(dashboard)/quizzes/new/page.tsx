"use client";

import { useRouter } from "next/navigation";
import { useQuizzes } from "@/lib/hooks/use-quizzes";
import { QuizForm } from "@/components/quizzes/quiz-form";
import { ArrowLeft, Layers, HelpCircle, Swords, ShieldCheck, Users, Sparkles } from "lucide-react";
import Link from "next/link";
import { FlashMasterLogo } from "@/components/branding/flash-master-logo";

export default function NewQuizPage() {
  const router = useRouter();
  const { createQuiz } = useQuizzes();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/quizzes" className="rounded-xl border border-[#d6cab8] bg-white/85 p-2 text-[#7a7262] hover:text-[#4b453a]">
          <ArrowLeft size={20} />
        </Link>
        <p className="text-sm font-medium text-[#726a5b]">Retour aux quizzes</p>
      </div>

      <div className="game-panel animate-in-up rounded-[1.5rem] border border-[#d9cfbd] p-5 lg:p-6">
        <div className="section-hero">
          <div className="space-y-4">
            <div>
              <p className="hud-chip">Quiz Studio</p>
              <h1 className="mt-3 text-2xl font-semibold text-[#2b303a]">Nouveau Quiz</h1>
              <p className="mt-1 text-sm text-[#676258]">Creer un nouveau parcours de questions avec categorie hierarchique.</p>
            </div>

            <div className="rubric-strip">
              <Link href="/decks" className="rubric-link"><Layers size={13} />Decks</Link>
              <Link href="/quizzes" className="rubric-link rubric-link-active"><HelpCircle size={13} />Quiz</Link>
              <Link href="/ranked" className="rubric-link"><Swords size={13} />Ranked</Link>
              <Link href="/check" className="rubric-link"><ShieldCheck size={13} />Check</Link>
              <Link href="/social" className="rubric-link"><Users size={13} />Social</Link>
            </div>
          </div>

          <div className="section-hero-visual">
            <div className="cover-art-meta">
              <span className="cover-art-tag">Quiz setup</span>
              <span className="cover-art-chip">
                <Sparkles size={14} />
              </span>
            </div>
            <div className="relative z-[1] mt-4 space-y-3">
              <FlashMasterLogo size="md" className="rounded-2xl bg-white/70 px-3 py-2" />
              <div className="mind-note rounded-[1rem] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#706a5d]">Rubrique active</p>
                <p className="mt-1 text-sm text-[#3d3a33]">Preparer un quiz public, prive ou partageable par lien</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="game-panel rounded-xl border border-[#d9cfbd] p-6">
        <QuizForm
          onSubmit={async (values) => {
            const quiz = await createQuiz(values);
            router.push(`/quizzes/${quiz.id}/edit`);
          }}
          onCancel={() => router.push("/quizzes")}
        />
      </div>
    </div>
  );
}
