"use client";

import { useDecks } from "@/lib/hooks/use-decks";
import { DeckCard } from "@/components/flashcards/deck-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Layers } from "lucide-react";

export default function DecksPage() {
  const { decks, loading, deleteDeck } = useDecks();

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
            <p className="hud-chip">Deck forge</p>
            <h1 className="page-title mt-3">Mes decks</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Selectionne un niveau, etudie ou modifie en un clic.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/decks/new">
              <Button>
                <Plus size={16} />
                Nouveau Deck
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {decks.length === 0 ? (
        <div className="game-panel animate-in-up py-16 text-center" style={{ animationDelay: "80ms" }}>
          <Layers size={48} className="mx-auto mb-4 text-cyan-300" />
          <h3 className="font-mono text-lg font-black uppercase tracking-[0.08em] text-[var(--foreground)]">Aucun deck</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Cree ton premier deck pour lancer ton run.</p>
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
