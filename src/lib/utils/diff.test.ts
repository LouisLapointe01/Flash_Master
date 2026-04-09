import { describe, expect, it } from "vitest";
import type { Deck, Flashcard } from "@/lib/types";
import { computeDeckDiff, isDiffEmpty } from "@/lib/utils/diff";

function makeCard(id: string, position: number, overrides: Partial<Flashcard> = {}): Flashcard {
  return {
    id,
    deck_id: "deck-1",
    front_text: `Front ${id}`,
    back_text: `Back ${id}`,
    explanation: `Explain ${id}`,
    front_image_url: null,
    back_image_url: null,
    category_path: ["science"],
    position,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeDeck(overrides: Partial<Deck & { flashcards: Flashcard[] }> = {}): Deck & { flashcards: Flashcard[] } {
  return {
    id: "deck-1",
    owner_id: "owner-1",
    title: "Deck title",
    description: "Deck description",
    tags: ["tag"],
    category: "science",
    category_path: ["science"],
    visibility: "public",
    share_token: null,
    block_suggestions: false,
    original_deck_id: null,
    copy_count: 0,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    flashcards: [makeCard("c1", 0), makeCard("c2", 1)],
    ...overrides,
  };
}

describe("computeDeckDiff", () => {
  it("returns empty diff for identical deck", () => {
    const original = makeDeck();
    const diff = computeDeckDiff(original, original);

    expect(diff).toEqual({});
    expect(isDiffEmpty(diff)).toBe(true);
  });

  it("detects deck-level field changes", () => {
    const original = makeDeck();
    const modified = makeDeck({
      title: "New title",
      description: "New description",
      category: "history",
    });

    const diff = computeDeckDiff(original, modified);
    expect(diff.deck_changes).toEqual({
      title: { old: "Deck title", new: "New title" },
      description: { old: "Deck description", new: "New description" },
      category: { old: "science", new: "history" },
    });
    expect(isDiffEmpty(diff)).toBe(false);
  });

  it("detects modified card fields", () => {
    const original = makeDeck();
    const modified = makeDeck({
      flashcards: [
        makeCard("c1", 0, { front_text: "Front changed", explanation: "Explain changed" }),
        makeCard("c2", 1),
      ],
    });

    const diff = computeDeckDiff(original, modified);
    expect(diff.modified_cards).toEqual([
      {
        id: "c1",
        changes: {
          front_text: { old: "Front c1", new: "Front changed" },
          explanation: { old: "Explain c1", new: "Explain changed" },
        },
      },
    ]);
  });

  it("detects removed cards and added cards", () => {
    const original = makeDeck({ flashcards: [makeCard("c1", 0), makeCard("c2", 1)] });
    const modified = makeDeck({
      flashcards: [
        makeCard("c2", 0),
        makeCard("c3", 1, {
          front_text: "Front c3",
          back_text: "Back c3",
          explanation: "Explain c3",
          category_path: ["science", "biology"],
        }),
      ],
    });

    const diff = computeDeckDiff(original, modified);

    expect(diff.removed_card_ids).toEqual(["c1"]);
    expect(diff.added_cards).toEqual([
      {
        front_text: "Front c3",
        back_text: "Back c3",
        explanation: "Explain c3",
        front_image_url: null,
        back_image_url: null,
        category_path: ["science", "biology"],
        position: 1,
      },
    ]);
  });
});

describe("isDiffEmpty", () => {
  it("treats empty arrays and missing values as empty", () => {
    expect(isDiffEmpty({})).toBe(true);
    expect(isDiffEmpty({ modified_cards: [] })).toBe(true);
    expect(isDiffEmpty({ added_cards: [] })).toBe(true);
    expect(isDiffEmpty({ removed_card_ids: [] })).toBe(true);
  });

  it("returns false when at least one non-empty diff section exists", () => {
    expect(isDiffEmpty({ deck_changes: { title: { old: "a", new: "b" } } })).toBe(false);
    expect(isDiffEmpty({ modified_cards: [{ id: "1", changes: { front_text: { old: "x", new: "y" } } }] })).toBe(false);
    expect(isDiffEmpty({ added_cards: [{ front_text: "f", back_text: "b", explanation: "e", front_image_url: null, back_image_url: null, category_path: [], position: 0 }] })).toBe(false);
    expect(isDiffEmpty({ removed_card_ids: ["c1"] })).toBe(false);
  });
});
