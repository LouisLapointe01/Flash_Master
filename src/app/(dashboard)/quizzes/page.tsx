"use client";

import { useQuizzes } from "@/lib/hooks/use-quizzes";
import { QuizCard } from "@/components/quizzes/quiz-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, HelpCircle, Swords, ShieldCheck, Layers, Users, Sparkles } from "lucide-react";
import { CapyQuiz } from "@/components/illustrations/capi-illustrations";

export default function QuizzesPage() {
  const { quizzes, loading, deleteQuiz } = useQuizzes();

  const rubriques = [
    { href: "/decks", label: "Decks", icon: Layers },
    { href: "/quizzes", label: "Quiz", icon: HelpCircle, active: true },
    { href: "/ranked", label: "Ranked", icon: Swords },
    { href: "/check", label: "Check", icon: ShieldCheck },
    { href: "/social", label: "Social", icon: Users },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#115f89]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="game-panel animate-in-up rounded-[1.45rem] border border-[#d9cfbd] p-5 lg:p-6">
        <div className="section-hero">
          <div className="space-y-4">
            <div>
              <p className="hud-chip">Quiz Arena</p>
              <h1 className="mt-3 text-2xl font-semibold text-[#2b303a]">Mes Quizzes</h1>
              <p className="mt-1 text-sm text-[#676258]">
                {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""} avec categorisation et modes classes.
              </p>
            </div>

            <div className="rubric-strip">
              {rubriques.map((item) => (
                <Link key={item.href} href={item.href} className={item.active ? "rubric-link rubric-link-active" : "rubric-link"}>
                  <item.icon size={13} />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/ranked">
                <Button variant="secondary"><Swords size={16} />Mode classe</Button>
              </Link>
              <Link href="/check">
                <Button variant="secondary"><ShieldCheck size={16} />Check communaute</Button>
              </Link>
              <Link href="/quizzes/new">
                <Button><Plus size={16} />Nouveau Quiz</Button>
              </Link>
            </div>
          </div>

          <div className="section-hero-visual">
            <div className="cover-art-meta">
              <span className="cover-art-tag">Quiz flow</span>
              <span className="cover-art-chip">
                <Sparkles size={14} />
              </span>
            </div>
            <div className="relative z-[1] mt-2 flex items-end justify-center">
              <CapyQuiz className="h-36 drop-shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="game-panel animate-in-up rounded-[1.45rem] border border-[#d9cfbd] py-16 text-center" style={{ animationDelay: "80ms" }}>
          <HelpCircle size={48} className="mx-auto mb-4 text-[#8c8576]" />
          <h3 className="text-lg font-semibold text-[#2b303a]">Aucun quiz</h3>
          <p className="mt-1 text-sm text-[#676258]">Creez votre premier parcours de questions.</p>
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
