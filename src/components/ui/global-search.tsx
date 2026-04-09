"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { clsx } from "clsx";
import { HelpCircle, Layers, Search, X } from "lucide-react";

const CATEGORIES = [
  "Jeux Vidéo & E-Sport",
  "Cinéma & Septième Art",
  "Mangas, Comics & Animés",
  "Sciences Exactes & Nature",
  "Informatique, Tech & Web",
  "Histoire & Civilisations",
  "Géographie & Atlas",
  "Musique & Audio",
  "Sports & Compétitions",
  "Littérature, Arts & Philosophie",
  "Gastronomie & Cuisine",
  "Automobile & Transports",
  "Santé & Médecine",
  "Économie & Business",
  "Mythes, Paranormal & Mystères",
  "Télévision & Séries TV",
  "Langues & Linguistique",
  "Mode, Beauté & Design",
  "Architecture & Ingénierie",
  "Armement & Militaire",
  "Droit, Politique & Société",
  "Psychologie & Sociologie",
  "Écologie & Environnement",
  "Arts de la Scène",
  "Faune Sauvage & Animaux",
  "Jeux de Société & Jouets",
  "True Crime & Faits Divers",
  "Culture Web & Réseaux Sociaux",
  "Savoir-Faire & Vie Quotidienne",
  "Croyances, Religions & Spiritualité",
] as const;

type ResultItem = {
  id: string;
  type: "quiz" | "deck";
  title: string;
  category: string | null;
  count: number;
};

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(0);

  // Auto-focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
      setQuery("");
      setActiveCategory(null);
      setResults([]);
      setFocused(0);
    }
  }, [open]);

  // Escape key closes
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Search
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      if (!query.trim() && !activeCategory) {
        setResults([]);
        return;
      }
      setLoading(true);

      const [quizzesRes, decksRes] = await Promise.all([
        (() => {
          let q = supabase
            .from("quizzes")
            .select("id, title, category, quiz_questions(count)")
            .eq("visibility", "public")
            .order("copy_count", { ascending: false })
            .limit(12);
          if (query.trim()) q = q.ilike("title", `%${query}%`);
          if (activeCategory) q = q.or(`category.eq.${activeCategory},category_path.cs.{"${activeCategory}"}`);
          return q;
        })(),
        (() => {
          let q = supabase
            .from("decks")
            .select("id, title, category, flashcards(count)")
            .eq("visibility", "public")
            .order("copy_count", { ascending: false })
            .limit(8);
          if (query.trim()) q = q.ilike("title", `%${query}%`);
          if (activeCategory) q = q.or(`category.eq.${activeCategory},category_path.cs.{"${activeCategory}"}`);
          return q;
        })(),
      ]);

      const quizItems: ResultItem[] = (quizzesRes.data ?? []).map((q: { id: string; title: string; category: string | null; quiz_questions: Array<{ count: number }> | null }) => ({
        id: q.id,
        type: "quiz" as const,
        title: q.title,
        category: q.category,
        count: q.quiz_questions?.[0]?.count ?? 0,
      }));

      const deckItems: ResultItem[] = (decksRes.data ?? []).map((d: { id: string; title: string; category: string | null; flashcards: Array<{ count: number }> | null }) => ({
        id: d.id,
        type: "deck" as const,
        title: d.title,
        category: d.category,
        count: d.flashcards?.[0]?.count ?? 0,
      }));

      setResults([...quizItems, ...deckItems]);
      setFocused(0);
      setLoading(false);
    }, 280);
    return () => clearTimeout(t);
  }, [query, activeCategory, open, supabase]);

  const navigate = useCallback(
    (item: ResultItem) => {
      onClose();
      router.push(item.type === "quiz" ? `/quizzes/${item.id}` : `/decks/${item.id}`);
    },
    [onClose, router]
  );

  // Keyboard navigation on results
  useEffect(() => {
    if (!open || results.length === 0) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocused((f) => Math.min(f + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocused((f) => Math.max(f - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results[focused]) navigate(results[focused]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, focused, navigate]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-2xl rounded-[1.4rem] border border-[var(--line-strong)] bg-[var(--surface)] shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input row */}
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3">
          <Search size={18} className="shrink-0 text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un quiz, un deck…"
            className="min-w-0 flex-1 bg-transparent font-mono text-sm font-semibold uppercase tracking-[0.06em] text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none"
          />
          {(query || activeCategory) && (
            <button
              onClick={() => { setQuery(""); setActiveCategory(null); }}
              className="shrink-0 rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--foreground)]"
            >
              <X size={14} />
            </button>
          )}
          <kbd className="hidden rounded border border-[var(--line)] bg-[var(--surface-soft)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-muted)] sm:block">
            ESC
          </kbd>
        </div>

        {/* Category chips */}
        <div className="flex gap-1.5 overflow-x-auto px-4 py-2.5 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={clsx(
                "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.07em] transition whitespace-nowrap",
                activeCategory === cat
                  ? "border-[var(--primary)] bg-[rgba(57,255,20,0.12)] text-[var(--primary)]"
                  : "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--text-muted)] hover:border-[var(--line-strong)] hover:text-[var(--foreground)]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-[54vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-[var(--primary)]" />
            </div>
          ) : results.length > 0 ? (
            <ul className="divide-y divide-[var(--line)] px-2 py-1">
              {results.map((item, i) => (
                <li key={`${item.type}-${item.id}`}>
                  <button
                    onClick={() => navigate(item)}
                    onMouseEnter={() => setFocused(i)}
                    className={clsx(
                      "flex w-full items-center gap-3 rounded-[0.85rem] px-3 py-2.5 text-left transition",
                      focused === i ? "bg-[var(--surface-soft)]" : "hover:bg-[var(--surface-soft)]"
                    )}
                  >
                    <span className={clsx(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.65rem] border",
                      item.type === "quiz"
                        ? "border-green-400/30 bg-green-400/10 text-[var(--primary)]"
                        : "border-cyan-400/30 bg-cyan-400/10 text-cyan-400"
                    )}>
                      {item.type === "quiz" ? <HelpCircle size={14} /> : <Layers size={14} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {item.type === "quiz" ? "Quiz" : "Deck"} · {item.category ?? "—"} · {item.count} {item.type === "quiz" ? "questions" : "cartes"}
                      </p>
                    </div>
                    <span className="shrink-0 rounded border border-[var(--line)] bg-[var(--surface-soft)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">
                      ENTER
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (query || activeCategory) && !loading ? (
            <p className="py-10 text-center text-xs text-[var(--text-muted)]">Aucun résultat trouvé</p>
          ) : (
            <p className="py-10 text-center text-xs text-[var(--text-muted)]">
              Tape un terme ou sélectionne une catégorie
            </p>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between border-t border-[var(--line)] px-4 py-2">
          <p className="text-[10px] text-[var(--text-muted)]">
            <kbd className="rounded border border-[var(--line)] bg-[var(--surface-soft)] px-1 py-0.5 font-mono">↑↓</kbd>{" "}
            Naviguer &nbsp;
            <kbd className="rounded border border-[var(--line)] bg-[var(--surface-soft)] px-1 py-0.5 font-mono">⏎</kbd>{" "}
            Ouvrir
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">Flash Master Search</p>
        </div>
      </div>
    </div>
  );
}
