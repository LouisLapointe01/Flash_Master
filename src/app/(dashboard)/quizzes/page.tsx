"use client";

import { useQuizzes } from "@/lib/hooks/use-quizzes";
import { QuizCard } from "@/components/quizzes/quiz-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, HelpCircle } from "lucide-react";

export default function QuizzesPage() {
  const { quizzes, loading, deleteQuiz } = useQuizzes();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="game-panel animate-in-up p-5 lg:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="hud-chip">Quiz arena</p>
            <h1 className="page-title mt-3">Mes quizzes</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Choisis un mode, lance la partie et monte ton score.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/quizzes/new">
              <Button><Plus size={16} />Nouveau Quiz</Button>
            </Link>
          </div>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="game-panel animate-in-up py-16 text-center" style={{ animationDelay: "80ms" }}>
          <HelpCircle size={48} className="mx-auto mb-4 text-cyan-300" />
          <h3 className="font-mono text-lg font-black uppercase tracking-[0.08em] text-[var(--foreground)]">Aucun quiz</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Cree ton premier mode pour demarrer l&apos;arene.</p>
          <Link href="/quizzes/new"><Button className="mt-4"><Plus size={16} />Créer un quiz</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} onDelete={deleteQuiz} />
          ))}
        </div>
      )}
    </div>
  );
}
