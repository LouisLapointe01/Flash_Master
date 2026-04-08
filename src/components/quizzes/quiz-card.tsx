"use client";

import Link from "next/link";
import { HelpCircle, MoreVertical, Pencil, Trash2, Play } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Quiz } from "@/lib/types";
import { normalizeCategoryScope } from "@/lib/utils/ranked";
import { FlashMasterLogo } from "@/components/branding/flash-master-logo";

interface QuizCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  quiz: Quiz & { quiz_questions?: any[] };
  onDelete?: (id: string) => void;
}

export function QuizCard({ quiz, onDelete }: QuizCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const questionCount =
    Array.isArray(quiz.quiz_questions) && quiz.quiz_questions.length > 0 && typeof quiz.quiz_questions[0] === "object" && "count" in quiz.quiz_questions[0]
      ? (quiz.quiz_questions[0] as { count: number }).count
      : Array.isArray(quiz.quiz_questions)
        ? quiz.quiz_questions.length
        : 0;
  const categoryLabel = normalizeCategoryScope(quiz.category_path, quiz.category);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="game-panel interactive-card group relative rounded-[1.45rem] border border-[#d9cfbd] p-5">
      <div className="flex items-start justify-between">
        <Link href={`/quizzes/${quiz.id}`} className="flex-1 min-w-0">
          <div className="cover-art cover-art-quiz mb-3">
            <div className="cover-art-meta">
              <span className="cover-art-tag">Quiz</span>
              <FlashMasterLogo size="sm" withWordmark={false} className="rounded-[0.8rem] bg-white/72 p-1" />
            </div>
            <p className="relative z-[1] mt-3 max-w-[16rem] truncate text-xs font-semibold uppercase tracking-[0.08em] text-[#4a5d61]">
              {categoryLabel}
            </p>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-[1rem] border border-[#d6d0c4] bg-white/85 p-2 text-[#5a6072]">
              <HelpCircle size={18} />
            </div>
            <h3 className="truncate font-semibold text-[#2b303a]">{quiz.title}</h3>
          </div>
          {quiz.description && (
            <p className="mb-3 line-clamp-2 text-sm text-[#676258]">{quiz.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-[#797364]">
            <span>{questionCount} question{questionCount !== 1 ? "s" : ""}</span>
            <span className="max-w-[10rem] truncate rounded-full bg-[#ece9e0] px-2 py-0.5 text-[#5e5647]" title={categoryLabel}>
              {categoryLabel}
            </span>
            {quiz.visibility !== "private" && (
              <span className="rounded-full bg-[#ece9e0] px-2 py-0.5 text-[#5e5647]">
                {quiz.visibility === "public" ? "Public" : "Lien"}
              </span>
            )}
          </div>
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-1.5 text-[#7d7a70] hover:bg-[#f2ede4] hover:text-[#4f4a3f]"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-10 w-40 rounded-[1rem] border border-[#d5ccbb] bg-white/96 py-1 shadow-lg">
              <Link
                href={`/quizzes/${quiz.id}/play`}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#413e36] hover:bg-[#f4f0e8]"
              >
                <Play size={14} /> Jouer
              </Link>
              <Link
                href={`/quizzes/${quiz.id}/edit`}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#413e36] hover:bg-[#f4f0e8]"
              >
                <Pencil size={14} /> Modifier
              </Link>
              {onDelete && (
                <button
                  onClick={() => { onDelete(quiz.id); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
