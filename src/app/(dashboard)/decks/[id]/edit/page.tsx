"use client";

import { use, useState } from "react";
import { useDeck } from "@/lib/hooks/use-decks";
import { createFlashcard, updateFlashcard, deleteFlashcard } from "@/lib/hooks/use-flashcards";
import { DeckForm } from "@/components/flashcards/deck-form";
import { FlashcardForm } from "@/components/flashcards/flashcard-form";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, Trash2, Pencil, GripVertical, Layers, HelpCircle, Swords, ShieldCheck, Users, Sparkles } from "lucide-react";
import type { Flashcard } from "@/lib/types";
import { FlashMasterLogo } from "@/components/branding/flash-master-logo";
import { normalizeCategoryScope } from "@/lib/utils/ranked";

export default function EditDeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { deck, loading, setDeck } = useDeck(id);
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editingDeck, setEditingDeck] = useState(false);
  const supabase = createClient();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#0e8f8f]" />
      </div>
    );
  }

  if (!deck) return <div className="py-16 text-center text-[#4a747a]">Deck introuvable</div>;

  const cards = deck.flashcards ?? [];
  const categoryLabel = normalizeCategoryScope(deck.category_path, deck.category);

  async function handleAddCard(
    values: { front_text: string; back_text: string; explanation: string },
    frontImage?: File | null,
    backImage?: File | null
  ) {
    const newCard = await createFlashcard(
      id,
      { ...values, position: cards.length },
      frontImage,
      backImage
    );
    setDeck({ ...deck!, flashcards: [...(deck!.flashcards ?? []), newCard] });
    setShowAddCard(false);
  }

  async function handleUpdateCard(
    cardId: string,
    values: { front_text: string; back_text: string; explanation: string },
    frontImage?: File | null,
    backImage?: File | null
  ) {
    await updateFlashcard(cardId, values, frontImage, backImage);
    setDeck({
      ...deck!,
      flashcards: deck!.flashcards?.map((c) => (c.id === cardId ? { ...c, ...values } : c)),
    });
    setEditingCard(null);
  }

  async function handleDeleteCard(cardId: string) {
    await deleteFlashcard(cardId);
    setDeck({ ...deck!, flashcards: deck!.flashcards?.filter((c) => c.id !== cardId) });
  }

  async function handleUpdateDeck(values: Record<string, unknown>) {
    await supabase.from("decks").update(values).eq("id", id);
    setDeck({ ...deck!, ...values } as typeof deck);
    setEditingDeck(false);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/decks/${id}`} className="rounded-xl border border-[#d6cab8] bg-white/85 p-2 text-[#7a7262] hover:text-[#4b453a]">
          <ArrowLeft size={20} />
        </Link>
        <p className="text-sm font-medium text-[#726a5b]">Retour au detail du deck</p>
      </div>

      <div className="game-panel animate-in-up rounded-[1.5rem] border border-[#d9cfbd] p-5 lg:p-6">
        <div className="section-hero">
          <div className="space-y-4">
            <div>
              <p className="hud-chip">Deck Editor</p>
              <h1 className="mt-3 text-2xl font-semibold text-[#2b303a]">Modifier: {deck.title}</h1>
              <p className="mt-1 text-sm text-[#676258]">Edition des metadonnees et des cartes de revision.</p>
            </div>

            <div className="rubric-strip">
              <Link href="/decks" className="rubric-link rubric-link-active"><Layers size={13} />Decks</Link>
              <Link href="/quizzes" className="rubric-link"><HelpCircle size={13} />Quiz</Link>
              <Link href="/ranked" className="rubric-link"><Swords size={13} />Ranked</Link>
              <Link href="/check" className="rubric-link"><ShieldCheck size={13} />Check</Link>
              <Link href="/social" className="rubric-link"><Users size={13} />Social</Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#6e6759]">
              <span className="rounded-full border border-[#d6cab8] bg-white/88 px-2.5 py-1">{cards.length} carte{cards.length !== 1 ? "s" : ""}</span>
              <span className="rounded-full border border-[#d6cab8] bg-white/88 px-2.5 py-1">{categoryLabel}</span>
            </div>

            <div>
              <Button variant="secondary" size="sm" onClick={() => setEditingDeck(!editingDeck)}>
                <Pencil size={14} /> {editingDeck ? "Fermer" : "Infos du deck"}
              </Button>
            </div>
          </div>

          <div className="section-hero-visual">
            <div className="cover-art-meta">
              <span className="cover-art-tag">Authoring zone</span>
              <span className="cover-art-chip">
                <Sparkles size={14} />
              </span>
            </div>
            <div className="relative z-[1] mt-4 space-y-3">
              <FlashMasterLogo size="md" className="rounded-2xl bg-white/70 px-3 py-2" />
              <div className="mind-note rounded-[1rem] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#706a5d]">Rubrique active</p>
                <p className="mt-1 text-sm text-[#3d3a33]">Ajout rapide de cartes et medias pour chaque face</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editingDeck && (
        <div className="game-panel rounded-2xl border border-[#d9cfbd] p-6">
          <DeckForm
            initialValues={deck}
            onSubmit={handleUpdateDeck}
            onCancel={() => setEditingDeck(false)}
            submitLabel="Sauvegarder"
          />
        </div>
      )}

      {/* Cards list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#2b303a]">
            Cartes ({cards.length})
          </h2>
          <Button size="sm" onClick={() => setShowAddCard(!showAddCard)}>
            <Plus size={14} /> Ajouter
          </Button>
        </div>

        {showAddCard && (
          <FlashcardForm
            onSubmit={handleAddCard}
            onCancel={() => setShowAddCard(false)}
          />
        )}

        {cards.map((card: Flashcard, i: number) => (
          <div key={card.id}>
            {editingCard === card.id ? (
              <FlashcardForm
                initialValues={card}
                onSubmit={(values, fi, bi) => handleUpdateCard(card.id, values, fi, bi)}
                onCancel={() => setEditingCard(null)}
                submitLabel="Sauvegarder"
              />
            ) : (
              <div className="game-panel rounded-2xl border border-[#d9cfbd] p-4">
                <div className="flex items-start gap-3">
                  <GripVertical size={16} className="mt-2 shrink-0 text-[#a09683]" />
                  <span className="mt-1 w-6 shrink-0 text-right font-mono text-xs text-[#8c8576]">
                    {i + 1}
                  </span>
                  <div className="grid flex-1 min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-[#ded6c7] bg-white/80 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#7b7466]">Recto</p>
                      <p className="mt-1 text-sm text-[#2b303a]">{card.front_text}</p>
                      {card.front_image_url && (
                        <Image
                          src={card.front_image_url}
                          alt="Image recto"
                          width={720}
                          height={420}
                          className="mt-3 h-44 w-full rounded-lg border border-[#e5ddce] object-cover"
                        />
                      )}
                    </div>

                    <div className="rounded-xl border border-[#ded6c7] bg-white/80 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#7b7466]">Verso</p>
                      <p className="mt-1 text-sm text-[#2b303a]">{card.back_text}</p>
                      {card.back_image_url && (
                        <Image
                          src={card.back_image_url}
                          alt="Image verso"
                          width={720}
                          height={420}
                          className="mt-3 h-44 w-full rounded-lg border border-[#e5ddce] object-cover"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => setEditingCard(card.id)}
                      className="rounded-lg p-1.5 text-[#7f7868] hover:bg-[#f2ede4] hover:text-[#4f4a3f]"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="rounded-lg p-1.5 text-[#5f858a] hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {card.explanation && (
                  <p className="mt-3 rounded-xl border border-[#e5ddce] bg-white/70 px-3 py-2 text-xs text-[#676258]">
                    {card.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
