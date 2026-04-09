"use client";

import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import type { Deck } from "@/lib/types";

const supabase = createClient();

async function fetchMyDecks(): Promise<Deck[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data } = await supabase
    .from("decks")
    .select("*, flashcards(count)")
    .eq("owner_id", session.user.id)
    .order("updated_at", { ascending: false });

  return (data as Deck[]) ?? [];
}

export function useDecks() {
  const { data: decks = [], isLoading: loading, mutate } = useSWR("decks", fetchMyDecks, {
    revalidateOnFocus: false,
  });

  async function createDeck(values: {
    title: string;
    description: string;
    tags: string[];
    category: string;
    category_path?: string[];
    visibility: string;
  }) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Non authentifié");

    const { data, error } = await supabase
      .from("decks")
      .insert({ ...values, owner_id: session.user.id })
      .select()
      .single();

    if (error) throw error;
    await mutate([data as Deck, ...decks], false);
    return data as Deck;
  }

  async function updateDeck(id: string, values: Partial<Deck>) {
    const optimistic = decks.map((d) => (d.id === id ? { ...d, ...values } : d));
    await mutate(optimistic, false);
    try {
      const { error } = await supabase.from("decks").update(values).eq("id", id);
      if (error) throw error;
    } catch (err) {
      await mutate();
      throw err;
    }
  }

  async function deleteDeck(id: string) {
    await mutate(decks.filter((d) => d.id !== id), false);
    try {
      const { error } = await supabase.from("decks").delete().eq("id", id);
      if (error) throw error;
    } catch (err) {
      await mutate();
      throw err;
    }
  }

  return { decks, loading, fetchDecks: mutate, createDeck, updateDeck, deleteDeck };
}

async function fetchDeck(id: string): Promise<Deck | null> {
  const { data } = await supabase
    .from("decks")
    .select("*, flashcards(*), profiles(display_name, avatar_url)")
    .eq("id", id)
    .single();

  if (data?.flashcards) {
    data.flashcards.sort(
      (a: { position: number }, b: { position: number }) => a.position - b.position
    );
  }

  return (data as Deck) ?? null;
}

export function useDeck(id: string) {
  const { data: deck = null, isLoading: loading, mutate } = useSWR(
    ["deck", id],
    ([, deckId]) => fetchDeck(deckId),
    { revalidateOnFocus: false }
  );

  return { deck, loading, setDeck: (d: Deck | null) => mutate(d ?? undefined, false) };
}
