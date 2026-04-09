"use client";

import Link from "next/link";
import { Layers, MoreVertical, Pencil, Trash2, Play } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Deck } from "@/lib/types";
import { normalizeCategoryScope } from "@/lib/utils/ranked";
import { FlashMasterLogo } from "@/components/branding/flash-master-logo";

interface DeckCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deck: Deck & { flashcards?: any[] };
  onDelete?: (id: string) => void;
}

export function DeckCard({ deck, onDelete }: DeckCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const categoryLabel = normalizeCategoryScope(deck.category_path, deck.category);
  const cardCount =
    Array.isArray(deck.flashcards) && deck.flashcards.length > 0 && typeof deck.flashcards[0] === "object" && "count" in deck.flashcards[0]
      ? (deck.flashcards[0] as { count: number }).count
      : Array.isArray(deck.flashcards)
        ? deck.flashcards.length
        : 0;

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
        <Link href={`/decks/${deck.id}`} className="flex-1 min-w-0">
          <div className="cover-art cover-art-deck mb-3 rounded-[0.95rem]">
            <div className="cover-art-meta">
              <span className="cover-art-tag">Deck</span>
              <FlashMasterLogo size="sm" withWordmark={false} className="rounded-[0.8rem] bg-[var(--surface-strong)] p-1" />
            </div>
            <p className="relative z-[1] mt-3 max-w-[16rem] truncate text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
              {categoryLabel}
            </p>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-[0.8rem] border border-[var(--line)] bg-[var(--surface-soft)] p-2 text-[var(--secondary)]">
              <Layers size={18} />
            </div>
            <h3 className="truncate font-mono text-sm font-black uppercase tracking-[0.06em] text-[var(--foreground)]">{deck.title}</h3>
          </div>
          {deck.description && (
            <p className="mb-3 line-clamp-2 text-sm text-[var(--text-muted)]">{deck.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
            <span>{cardCount} carte{cardCount !== 1 ? "s" : ""}</span>
            {deck.visibility !== "private" && (
              <span className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-2 py-0.5 text-[var(--foreground)]">
                {deck.visibility === "public" ? "Public" : "Lien"}
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
                href={`/decks/${deck.id}/study`}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
              >
                <Play size={14} /> Étudier
              </Link>
              <Link
                href={`/decks/${deck.id}/edit`}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
              >
                <Pencil size={14} /> Modifier
              </Link>
              {onDelete && (
                <button
                  onClick={() => { onDelete(deck.id); setMenuOpen(false); }}
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
