"use server";

import { createClient } from "@/lib/supabase/server";
import type { DiffPayload } from "@/lib/types";

export async function submitSuggestion(params: {
  targetDeckId?: string;
  targetQuizId?: string;
  title: string;
  description: string;
  diffPayload: DiffPayload;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  // Check if target allows suggestions
  if (params.targetDeckId) {
    const { data: deck } = await supabase
      .from("decks")
      .select("owner_id, block_suggestions, title, profiles(block_suggestions)")
      .eq("id", params.targetDeckId)
      .single();

    if (!deck) throw new Error("Deck introuvable");
    if (deck.block_suggestions) throw new Error("Ce deck n'accepte pas les suggestions");
    const ownerProfile = Array.isArray(deck.profiles) ? deck.profiles[0] : deck.profiles;
    if (ownerProfile?.block_suggestions) throw new Error("Ce créateur n'accepte pas les suggestions");

    const { error } = await supabase.from("suggestions").insert({
      author_id: user.id,
      target_deck_id: params.targetDeckId,
      title: params.title,
      description: params.description,
      diff_payload: params.diffPayload,
    });
    if (error) throw error;

    // Notify deck owner
    const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();
    await supabase.from("notifications").insert({
      user_id: deck.owner_id,
      type: "suggestion_received",
      title: "Nouvelle suggestion",
      body: `${profile?.display_name ?? "Quelqu'un"} a soumis une suggestion pour "${deck.title}"`,
      data: { deck_id: params.targetDeckId },
    });
  }

  if (params.targetQuizId) {
    const { data: quiz } = await supabase
      .from("quizzes")
      .select("owner_id, block_suggestions, title, profiles(block_suggestions)")
      .eq("id", params.targetQuizId)
      .single();

    if (!quiz) throw new Error("Quiz introuvable");
    if (quiz.block_suggestions) throw new Error("Ce quiz n'accepte pas les suggestions");

    const { error } = await supabase.from("suggestions").insert({
      author_id: user.id,
      target_quiz_id: params.targetQuizId,
      title: params.title,
      description: params.description,
      diff_payload: params.diffPayload,
    });
    if (error) throw error;
  }
}

export async function acceptSuggestion(suggestionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: suggestion } = await supabase
    .from("suggestions")
    .select("*")
    .eq("id", suggestionId)
    .single();

  if (!suggestion) throw new Error("Suggestion introuvable");

  const diff = suggestion.diff_payload as DiffPayload;
  const deckId = suggestion.target_deck_id;

  if (deckId) {
    // Apply deck-level changes
    if (diff.deck_changes) {
      const updates: Record<string, string> = {};
      for (const [field, change] of Object.entries(diff.deck_changes)) {
        updates[field] = change.new;
      }
      await supabase.from("decks").update(updates).eq("id", deckId);
    }

    // Apply card modifications
    if (diff.modified_cards) {
      for (const mod of diff.modified_cards) {
        const updates: Record<string, string> = {};
        for (const [field, change] of Object.entries(mod.changes)) {
          updates[field] = change.new;
        }
        await supabase.from("flashcards").update(updates).eq("id", mod.id);
      }
    }

    // Add new cards
    if (diff.added_cards) {
      const cards = diff.added_cards.map((c) => ({ ...c, deck_id: deckId }));
      await supabase.from("flashcards").insert(cards);
    }

    // Remove cards
    if (diff.removed_card_ids?.length) {
      await supabase.from("flashcards").delete().in("id", diff.removed_card_ids);
    }
  }

  // Mark as accepted
  await supabase.from("suggestions").update({ status: "accepted" }).eq("id", suggestionId);

  // Notify author
  await supabase.from("notifications").insert({
    user_id: suggestion.author_id,
    type: "suggestion_accepted",
    title: "Suggestion acceptée",
    body: `Votre suggestion "${suggestion.title}" a été acceptée !`,
    data: { suggestion_id: suggestionId },
  });
}

export async function rejectSuggestion(suggestionId: string) {
  const supabase = await createClient();

  const { data: suggestion } = await supabase
    .from("suggestions")
    .select("*")
    .eq("id", suggestionId)
    .single();

  if (!suggestion) throw new Error("Suggestion introuvable");

  await supabase.from("suggestions").update({ status: "rejected" }).eq("id", suggestionId);

  await supabase.from("notifications").insert({
    user_id: suggestion.author_id,
    type: "suggestion_rejected",
    title: "Suggestion refusée",
    body: `Votre suggestion "${suggestion.title}" a été refusée.`,
    data: { suggestion_id: suggestionId },
  });
}
