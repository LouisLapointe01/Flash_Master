"use client";

import { useDecks } from "@/lib/hooks/use-decks";
import { DeckCard } from "@/components/flashcards/deck-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Layers, HelpCircle, Swords, ShieldCheck, Users, Sparkles } from "lucide-react";
import { FlashMasterLogo } from "@/components/branding/flash-master-logo";

export default function DecksPage() {
  const { decks, loading, deleteDeck } = useDecks();

  const rubriques = [
    { href: "/decks", label: "Collections", icon: Layers, active: true },
    { href: "/quizzes", label: "Quiz", icon: HelpCircle },
    { href: "/ranked", label: "Ranked", icon: Swords },
    { href: "/check", label: "Check", icon: ShieldCheck },
    { href: "/social", label: "Social", icon: Users },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#0e8f8f]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="game-panel animate-in-up rounded-[1.45rem] border border-[#d9cfbd] p-5 lg:p-6">
        <div className="section-hero">
          <div className="space-y-4">
            <div>
              <p className="hud-chip">Collection Studio</p>
              <h1 className="mt-3 text-2xl font-semibold text-[#2b303a]">Mes Decks</h1>
              <p className="mt-1 text-sm text-[#676258]">
                {decks.length} deck{decks.length !== 1 ? "s" : ""} organises par rubrique et progression.
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
              <Link href="/decks/new">
                <Button>
                  <Plus size={16} />
                  Nouveau Deck
                </Button>
              </Link>
              <Link href="/quizzes/new">
                <Button variant="secondary">
                  <HelpCircle size={16} />
                  Nouveau Quiz
                </Button>
              </Link>
            </div>
          </div>

          <div className="section-hero-visual">
            <div className="cover-art-meta">
              <span className="cover-art-tag">Deck library</span>
              <span className="cover-art-chip">
                <Sparkles size={14} />
              </span>
            </div>
            <div className="relative z-[1] mt-4 space-y-3">
              <FlashMasterLogo size="md" className="rounded-2xl bg-white/70 px-3 py-2" />
              <div className="mind-note rounded-[1rem] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#706a5d]">Rubrique active</p>
                <p className="mt-1 text-sm text-[#3d3a33]">Collections memo avec vue cartes + revision rapide</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {decks.length === 0 ? (
        <div className="game-panel animate-in-up rounded-[1.45rem] border border-[#d9cfbd] py-16 text-center" style={{ animationDelay: "80ms" }}>
          <Layers size={48} className="mx-auto mb-4 text-[#8c8576]" />
          <h3 className="text-lg font-semibold text-[#2b303a]">Aucun deck</h3>
          <p className="mt-1 text-sm text-[#676258]">Creez votre premiere collection de flashcards.</p>
          <Link href="/decks/new">
            <Button className="mt-4">
              <Plus size={16} />
              Créer un deck
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} onDelete={deleteDeck} />
          ))}
        </div>
      )}
    </div>
  );
}
