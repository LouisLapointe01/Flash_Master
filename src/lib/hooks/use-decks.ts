"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Deck } from "@/lib/types";

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchDecks = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("decks")
      .select("*, flashcards(count)")
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false });

    setDecks((data as Deck[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchDecks();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchDecks]);

  async function createDeck(values: {
    title: string;
    description: string;
    tags: string[];
    category: string;
    category_path?: string[];
    visibility: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");

    const { data, error } = await supabase
      .from("decks")
      .insert({ ...values, owner_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data as Deck;
  }

  async function updateDeck(id: string, values: Partial<Deck>) {
    const { error } = await supabase.from("decks").update(values).eq("id", id);
    if (error) throw error;
    await fetchDecks();
  }

  async function deleteDeck(id: string) {
    const { error } = await supabase.from("decks").delete().eq("id", id);
    if (error) throw error;
    setDecks((prev) => prev.filter((d) => d.id !== id));
  }

  return { decks, loading, fetchDecks, createDeck, updateDeck, deleteDeck };
}

export function useDeck(id: string) {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("decks")
        .select("*, flashcards(*), profiles(display_name, avatar_url)")
        .eq("id", id)
        .single();

      if (data) {
        // Sort flashcards by position
        if (data.flashcards) {
          data.flashcards.sort((a: { position: number }, b: { position: number }) => a.position - b.position);
        }
        setDeck(data as Deck);
      }
      setLoading(false);
    }
    fetch();
  }, [id, supabase]);

  return { deck, loading, setDeck };
}
