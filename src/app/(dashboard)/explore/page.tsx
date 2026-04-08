"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { copyDeck, copyQuiz } from "@/lib/actions/copy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Layers, HelpCircle, Copy, Eye, User, ShieldCheck, Swords, Users, Sparkles, Compass } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Deck, Quiz } from "@/lib/types";
import { CapyExplore, StarBurst } from "@/components/illustrations/capi-illustrations";
import { normalizeCategoryScope } from "@/lib/utils/ranked";
import { clsx } from "clsx";

type ContentType = "decks" | "quizzes";

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<ContentType>("decks");
  const [decks, setDecks] = useState<Deck[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (tab === "decks") {
        let query = supabase
          .from("decks")
          .select("*, profiles(display_name, avatar_url), flashcards(count)")
          .eq("visibility", "public")
          .order("copy_count", { ascending: false })
          .limit(50);

        if (search.trim()) {
          query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data } = await query;
        setDecks((data as Deck[]) ?? []);
      } else {
        let query = supabase
          .from("quizzes")
          .select("*, profiles(display_name, avatar_url), quiz_questions(count)")
          .eq("visibility", "public")
          .order("copy_count", { ascending: false })
          .limit(50);

        if (search.trim()) {
          query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data } = await query;
        setQuizzes((data as Quiz[]) ?? []);
      }
      setLoading(false);
    }

    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
  }, [tab, search, supabase]);

  async function handleCopyDeck(deckId: string) {
    setCopying(deckId);
    try {
      const newId = await copyDeck(deckId);
      router.push(`/decks/${newId}`);
    } catch {
      alert("Erreur lors de la copie");
    } finally {
      setCopying(null);
    }
  }

  async function handleCopyQuiz(quizId: string) {
    setCopying(quizId);
    try {
      const newId = await copyQuiz(quizId);
      router.push(`/quizzes/${newId}`);
    } catch {
      alert("Erreur lors de la copie");
    } finally {
      setCopying(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="game-panel animate-in-up rounded-[1.5rem] border border-[#d9cfbd] p-5 lg:p-6">
        <div className="section-hero">
          <div className="space-y-4">
            <div>
              <p className="hud-chip">Community Explore</p>
              <h1 className="page-title mt-2">Explorer</h1>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888070]" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un titre ou une description..."
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setTab("decks")}
                  className={clsx(
                    "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition",
                    tab === "decks"
                      ? "border-[#54462f] bg-[linear-gradient(140deg,#655438,#4f422e)] text-[#fff9ef]"
                      : "border-[#d4cab8] bg-white text-[#585042] hover:border-[#b9aa90]"
                  )}
                >
                  <Layers size={14} /> Decks
                </button>
                <button
                  onClick={() => setTab("quizzes")}
                  className={clsx(
                    "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition",
                    tab === "quizzes"
                      ? "border-[#54462f] bg-[linear-gradient(140deg,#655438,#4f422e)] text-[#fff9ef]"
                      : "border-[#d4cab8] bg-white text-[#585042] hover:border-[#b9aa90]"
                  )}
                >
                  <HelpCircle size={14} /> Quizzes
                </button>
              </div>
            </div>
          </div>

          <div className="section-hero-visual">
            <div className="cover-art-meta">
              <span className="cover-art-tag">Trending content</span>
              <span className="cover-art-chip">
                <Sparkles size={14} />
              </span>
            </div>
            <div className="relative z-[1] mt-2 flex items-end justify-center">
              <CapyExplore className="h-36 drop-shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#8c7a5b]" />
        </div>
      ) : tab === "decks" ? (
        decks.length === 0 ? (
          <div className="game-panel rounded-[1.35rem] border border-[#d9cfbd] py-14 text-center">
            <Layers size={42} className="mx-auto text-[#8c8576]" />
            <p className="mt-2 text-sm text-[#676258]">Aucun deck public trouve</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {decks.map((deck) => (
              <div key={deck.id} className="game-panel interactive-card rounded-[1.35rem] border border-[#d9cfbd] p-4">
                <div className="cover-art cover-art-deck mb-3">
                  <div className="cover-art-meta">
                    <span className="cover-art-tag">Deck public</span>
                    <StarBurst className="h-7 w-7 opacity-80" />
                  </div>
                  <p className="relative z-[1] mt-3 max-w-[15rem] truncate text-xs font-semibold uppercase tracking-[0.08em] text-[#4a5d61]">
                    {normalizeCategoryScope(deck.category_path, deck.category)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-[0.8rem] border border-[#d6d0c4] bg-white/82 p-2 text-[#53606c]"><Layers size={18} /></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-[#2b303a]">{deck.title}</h3>
                    <p className="flex items-center gap-1 text-xs text-[#7b7364]">
                      <User size={10} /> {deck.profiles?.display_name ?? "—"}
                    </p>
                  </div>
                </div>
                {deck.description && <p className="line-clamp-2 text-sm text-[#676258]">{deck.description}</p>}
                {deck.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {deck.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full bg-[#ece9e0] px-2 py-0.5 text-xs text-[#5e5647]">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-[#7b7364]">
                  <span><Copy size={10} className="inline" /> {deck.copy_count} copies</span>
                  <div className="flex gap-2">
                    <Link href={`/decks/${deck.id}`}>
                      <Button variant="ghost" size="sm"><Eye size={12} /> Voir</Button>
                    </Link>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyDeck(deck.id)}
                      disabled={copying === deck.id}
                    >
                      <Copy size={12} /> {copying === deck.id ? "..." : "Copier"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        quizzes.length === 0 ? (
          <div className="game-panel rounded-[1.35rem] border border-[#d9cfbd] py-14 text-center">
            <HelpCircle size={42} className="mx-auto text-[#8c8576]" />
            <p className="mt-2 text-sm text-[#676258]">Aucun quiz public trouve</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="game-panel interactive-card rounded-[1.35rem] border border-[#d9cfbd] p-4">
                <div className="cover-art cover-art-quiz mb-3">
                  <div className="cover-art-meta">
                    <span className="cover-art-tag">Quiz public</span>
                    <StarBurst className="h-7 w-7 opacity-80" />
                  </div>
                  <p className="relative z-[1] mt-3 max-w-[15rem] truncate text-xs font-semibold uppercase tracking-[0.08em] text-[#4a5d61]">
                    {normalizeCategoryScope(quiz.category_path, quiz.category)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-[0.8rem] border border-[#d6d0c4] bg-white/82 p-2 text-[#53606c]"><HelpCircle size={18} /></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-[#2b303a]">{quiz.title}</h3>
                    <p className="flex items-center gap-1 text-xs text-[#7b7364]">
                      <User size={10} /> {quiz.profiles?.display_name ?? "—"}
                    </p>
                  </div>
                </div>
                {quiz.description && <p className="line-clamp-2 text-sm text-[#676258]">{quiz.description}</p>}
                <div className="flex items-center justify-between text-xs text-[#7b7364]">
                  <span><Copy size={10} className="inline" /> {quiz.copy_count} copies</span>
                  <div className="flex gap-2">
                    <Link href={`/quizzes/${quiz.id}`}>
                      <Button variant="ghost" size="sm"><Eye size={12} /> Voir</Button>
                    </Link>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyQuiz(quiz.id)}
                      disabled={copying === quiz.id}
                    >
                      <Copy size={12} /> {copying === quiz.id ? "..." : "Copier"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
