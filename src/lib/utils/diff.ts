import type { Flashcard, DiffPayload, Deck } from "@/lib/types";

export function computeDeckDiff(
  original: Deck & { flashcards: Flashcard[] },
  modified: Deck & { flashcards: Flashcard[] }
): DiffPayload {
  const diff: DiffPayload = {};

  // Deck-level changes
  const deckFields = ["title", "description", "category"] as const;
  const deckChanges: Record<string, { old: string; new: string }> = {};
  for (const field of deckFields) {
    const oldVal = String(original[field] ?? "");
    const newVal = String(modified[field] ?? "");
    if (oldVal !== newVal) {
      deckChanges[field] = { old: oldVal, new: newVal };
    }
  }
  if (Object.keys(deckChanges).length > 0) {
    diff.deck_changes = deckChanges;
  }

  // Card-level changes
  const originalCards = new Map(original.flashcards.map((c) => [c.id, c]));
  const modifiedCards = new Map(modified.flashcards.map((c) => [c.id, c]));

  // Modified cards (present in both)
  const modifiedList: DiffPayload["modified_cards"] = [];
  for (const [id, origCard] of originalCards) {
    const modCard = modifiedCards.get(id);
    if (!modCard) continue;

    const changes: Record<string, { old: string; new: string }> = {};
    for (const field of ["front_text", "back_text", "explanation"] as const) {
      if (origCard[field] !== modCard[field]) {
        changes[field] = { old: origCard[field], new: modCard[field] };
      }
    }
    if (Object.keys(changes).length > 0) {
      modifiedList.push({ id, changes });
    }
  }
  if (modifiedList.length > 0) diff.modified_cards = modifiedList;

  // Added cards (in modified but not in original, or cards without a matching original ID)
  const addedCards: DiffPayload["added_cards"] = [];
  for (const [id, card] of modifiedCards) {
    if (!originalCards.has(id)) {
      addedCards.push({
        front_text: card.front_text,
        back_text: card.back_text,
        explanation: card.explanation,
        front_image_url: card.front_image_url,
        back_image_url: card.back_image_url,
        category_path: card.category_path,
        position: card.position,
      });
    }
  }
  if (addedCards.length > 0) diff.added_cards = addedCards;

  // Removed cards (in original but not in modified)
  const removedIds: string[] = [];
  for (const id of originalCards.keys()) {
    if (!modifiedCards.has(id)) removedIds.push(id);
  }
  if (removedIds.length > 0) diff.removed_card_ids = removedIds;

  return diff;
}

export function isDiffEmpty(diff: DiffPayload): boolean {
  return (
    !diff.deck_changes &&
    !diff.modified_cards?.length &&
    !diff.added_cards?.length &&
    !diff.removed_card_ids?.length
  );
}
