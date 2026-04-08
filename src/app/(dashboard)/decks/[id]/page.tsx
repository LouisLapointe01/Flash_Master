"use client";

import { use } from "react";
import { useDeck } from "@/lib/hooks/use-decks";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Pencil, Play, Layers, HelpCircle, Swords, ShieldCheck, Users, Sparkles, ListChecks, Clock3 } from "lucide-react";
import { FlashMasterLogo } from "@/components/branding/flash-master-logo";
import { normalizeCategoryScope } from "@/lib/utils/ranked";

export default function DeckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { deck, loading } = useDeck(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#0e8f8f]" />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-medium text-[#103f46]">Deck introuvable</h2>
        <Link href="/decks" className="mt-2 inline-block text-[#0e8f8f] hover:text-[#0a6767]">
          Retour aux decks
        </Link>
      </div>
    );
  }

  const cards = deck.flashcards ?? [];
  const categoryLabel = normalizeCategoryScope(deck.category_path, deck.category);
  const estimatedMinutes = Math.max(1, Math.round(cards.length * 0.45));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/decks" className="rounded-xl border border-[#d6cab8] bg-white/85 p-2 text-[#7a7262] hover:text-[#4b453a]">
          <ArrowLeft size={20} />
        </Link>
        <p className="text-sm font-medium text-[#726a5b]">Retour aux collections</p>
      </div>

      <div className="game-panel animate-in-up rounded-[1.5rem] border border-[#d9cfbd] p-5 lg:p-6">
        <div className="section-hero">
          <div className="space-y-4">
            <div>
              <p className="hud-chip">Deck Canvas</p>
              <h1 className="mt-3 truncate text-2xl font-semibold text-[#2b303a]">{deck.title}</h1>
              {deck.description ? <p className="mt-1 text-sm text-[#676258]">{deck.description}</p> : null}
            </div>

            <div className="rubric-strip">
              <Link href="/decks" className="rubric-link rubric-link-active"><Layers size={13} />Decks</Link>
              <Link href="/quizzes" className="rubric-link"><HelpCircle size={13} />Quiz</Link>
              <Link href="/ranked" className="rubric-link"><Swords size={13} />Ranked</Link>
              <Link href="/check" className="rubric-link"><ShieldCheck size={13} />Check</Link>
              <Link href="/social" className="rubric-link"><Users size={13} />Social</Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#6e6759]">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#d6cab8] bg-white/88 px-2.5 py-1">
                <ListChecks size={12} /> {cards.length} carte{cards.length !== 1 ? "s" : ""}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#d6cab8] bg-white/88 px-2.5 py-1">
                <Clock3 size={12} /> ~{estimatedMinutes} min de revision
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#d6cab8] bg-white/88 px-2.5 py-1">
                {categoryLabel}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={`/decks/${id}/edit`}>
                <Button variant="secondary" size="sm"><Pencil size={14} /> Modifier</Button>
              </Link>
              <Link href={`/decks/${id}/study`}>
                <Button size="sm"><Play size={14} /> Etudier</Button>
              </Link>
            </div>
          </div>

          <div className="section-hero-visual">
            <div className="cover-art-meta">
              <span className="cover-art-tag">Deck detail</span>
              <span className="cover-art-chip">
                <Sparkles size={14} />
              </span>
            </div>
            <div className="relative z-[1] mt-4 space-y-3">
              <FlashMasterLogo size="md" className="rounded-2xl bg-white/70 px-3 py-2" />
              <div className="mind-note rounded-[1rem] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#706a5d]">Rubrique active</p>
                <p className="mt-1 text-sm text-[#3d3a33]">Lecture detaillee des cartes avec media et explications</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {deck.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {deck.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-[#ece9e0] px-2.5 py-1 text-xs font-semibold text-[#5e5647]">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {cards.length === 0 ? (
          <div className="game-panel rounded-2xl border border-[#d9cfbd] py-12 text-center">
            <Layers size={36} className="mx-auto mb-3 text-[#8c8576]" />
            <p className="text-[#676258]">Aucune carte. Ajoute-en depuis l&apos;editeur.</p>
            <Link href={`/decks/${id}/edit`}>
              <Button className="mt-3" size="sm">
                <Pencil size={14} /> Ajouter des cartes
              </Button>
            </Link>
          </div>
        ) : (
          cards.map((card, i) => (
            <div key={card.id} className="game-panel rounded-2xl border border-[#d9cfbd] p-4">
              <div className="flex gap-4">
                <span className="mt-1 w-6 shrink-0 text-right font-mono text-xs text-[#8c8576]">
                  {i + 1}
                </span>
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-[#ded6c7] bg-white/80 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#7b7466]">Recto</p>
                    <p className="mt-1 text-sm text-[#2b303a]">{card.front_text}</p>
                    {card.front_image_url && (
                      <Image
                        src={card.front_image_url}
                        alt="Image recto"
                        width={760}
                        height={480}
                        className="mt-3 h-48 w-full rounded-lg border border-[#e5ddce] object-cover"
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
                        width={760}
                        height={480}
                        className="mt-3 h-48 w-full rounded-lg border border-[#e5ddce] object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>

              {card.explanation && (
                <p className="mt-3 rounded-xl border border-[#e5ddce] bg-white/70 px-3 py-2 text-xs text-[#676258]">
                  {card.explanation}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
