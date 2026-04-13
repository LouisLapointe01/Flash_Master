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
    <div className="game-panel interactive-card group relative p-4">
      <div className="flex items-start justify-between">
        <Link href={`/quizzes/${quiz.id}`} className="flex-1 min-w-0">
          <div className="cover-art cover-art-quiz mb-3 rounded-[0.95rem]">
            <div className="cover-art-meta">
              <span className="cover-art-tag">Quiz</span>
              <FlashMasterLogo size="sm" withWordmark={false} className="rounded-[0.8rem] bg-[var(--surface-strong)] p-1" />
            </div>
            <p className="relative z-[1] mt-3 max-w-[16rem] truncate text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
              {categoryLabel}
            </p>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-[0.8rem] border border-[var(--line)] bg-[var(--surface-soft)] p-2 text-[var(--secondary)]">
              <HelpCircle size={18} />
            </div>
            <h3 className="truncate font-mono text-sm font-black uppercase tracking-[0.06em] text-[var(--foreground)]">{quiz.title}</h3>
          </div>
          {quiz.description && (
            <p className="mb-3 line-clamp-2 text-sm text-[var(--text-muted)]">{quiz.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
            <span>{questionCount} question{questionCount !== 1 ? "s" : ""}</span>
            <span className="max-w-[10rem] truncate rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-2 py-0.5 text-[var(--foreground)]" title={categoryLabel}>
              {categoryLabel}
            </span>
            {quiz.visibility !== "private" && (
              <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-2 py-0.5 text-[var(--foreground)]">
                {quiz.visibility === "public" ? "Public" : "Lien"}
              </span>
            )}
          </div>
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-transparent p-1.5 text-[var(--text-muted)] transition-all duration-150 ease-in-out hover:border-[var(--line)] hover:text-[var(--foreground)]"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-10 w-40 rounded-[1rem] border border-[var(--line)] bg-[var(--surface-strong)] py-1 shadow-lg">
              <Link
                href={`/quizzes/${quiz.id}/play`}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
              >
                <Play size={14} /> Jouer
              </Link>
              <Link
                href={`/quizzes/${quiz.id}/edit`}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
              >
                <Pencil size={14} /> Modifier
              </Link>
              {onDelete && (
                <button
                  onClick={() => { onDelete(quiz.id); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/15"
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
