import { bench, describe } from "vitest";
import { computeDeckDiff, isDiffEmpty } from "@/lib/utils/diff";
import type { Deck, Flashcard } from "@/lib/types";

// ─── Générateurs de données ───────────────────────────────────────────────────

function makeCard(id: string, position: number): Flashcard {
  return {
    id,
    deck_id: "deck-1",
    front_text: `Question ${id} : quelle est la définition de ce concept ?`,
    back_text: `Réponse ${id} : la définition complète du concept.`,
    explanation: `Explication ${id} détaillée pour mieux comprendre.`,
    front_image_url: null,
    back_image_url: null,
    category_path: ["Catégorie", "Sous-catégorie"],
    position,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };
}

function makeDeck(id: string, cardCount: number): Deck & { flashcards: Flashcard[] } {
  return {
    id,
    owner_id: "user-1",
    title: `Deck ${id}`,
    description: "Description du deck",
    tags: ["tag1", "tag2"],
    category: "Sciences",
    category_path: ["Sciences"],
    visibility: "public",
    share_token: null,
    block_suggestions: false,
    original_deck_id: null,
    copy_count: 0,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    flashcards: Array.from({ length: cardCount }, (_, i) =>
      makeCard(`card-${i}`, i)
    ),
  };
}

// Decks préconstruits (non recréés à chaque itération)
const deckSmall = makeDeck("small", 5);
const deckMedium = makeDeck("medium", 50);
const deckLarge = makeDeck("large", 200);
const deckXLarge = makeDeck("xlarge", 1000);

// Versions modifiées : 20% des cartes modifiées, 10% supprimées, 10% ajoutées
function makeModifiedDeck(original: Deck & { flashcards: Flashcard[] }) {
  const cards = [...original.flashcards];
  const total = cards.length;
  const modified = cards.map((c, i) => {
    if (i < Math.floor(total * 0.2)) {
      return { ...c, front_text: `[MODIFIÉ] ${c.front_text}` };
    }
    return c;
  });
  const kept = modified.slice(0, Math.floor(total * 0.9));
  const added = Array.from({ length: Math.ceil(total * 0.1) }, (_, i) =>
    makeCard(`new-card-${i}`, total + i)
  );
  return {
    ...original,
    title: "[Modifié] " + original.title,
    flashcards: [...kept, ...added],
  };
}

const deckSmallModified = makeModifiedDeck(deckSmall);
const deckMediumModified = makeModifiedDeck(deckMedium);
const deckLargeModified = makeModifiedDeck(deckLarge);
const deckXLargeModified = makeModifiedDeck(deckXLarge);

// ─── Benchmarks diff ──────────────────────────────────────────────────────────

describe("Diff — deck identique (sans changement)", () => {
  bench("petit deck (5 cartes) — aucun changement", () => {
    computeDeckDiff(deckSmall, deckSmall);
  });

  bench("deck moyen (50 cartes) — aucun changement", () => {
    computeDeckDiff(deckMedium, deckMedium);
  });

  bench("grand deck (200 cartes) — aucun changement", () => {
    computeDeckDiff(deckLarge, deckLarge);
  });

  bench("deck xlarge (1000 cartes) — aucun changement", () => {
    computeDeckDiff(deckXLarge, deckXLarge);
  });
});

describe("Diff — deck avec modifications réalistes (20% mod, 10% sup, 10% ajout)", () => {
  bench("petit deck (5 cartes) — modifications réalistes", () => {
    computeDeckDiff(deckSmall, deckSmallModified);
  });

  bench("deck moyen (50 cartes) — modifications réalistes", () => {
    computeDeckDiff(deckMedium, deckMediumModified);
  });

  bench("grand deck (200 cartes) — modifications réalistes", () => {
    computeDeckDiff(deckLarge, deckLargeModified);
  });

  bench("deck xlarge (1000 cartes) — modifications réalistes", () => {
    computeDeckDiff(deckXLarge, deckXLargeModified);
  });
});

describe("Diff — cas extrêmes", () => {
  bench("toutes les cartes supprimées (50 cartes)", () => {
    computeDeckDiff(deckMedium, { ...deckMedium, flashcards: [] });
  });

  bench("toutes les cartes ajoutées (50 nouvelles cartes)", () => {
    computeDeckDiff({ ...deckMedium, flashcards: [] }, deckMedium);
  });

  bench("toutes les cartes modifiées (50 cartes)", () => {
    const allModified = {
      ...deckMedium,
      flashcards: deckMedium.flashcards.map((c) => ({
        ...c,
        front_text: "[MODIFIÉ] " + c.front_text,
        back_text: "[MODIFIÉ] " + c.back_text,
      })),
    };
    computeDeckDiff(deckMedium, allModified);
  });
});

describe("isDiffEmpty", () => {
  bench("diff vide", () => {
    isDiffEmpty({});
  });

  bench("diff avec modifications", () => {
    isDiffEmpty({
      deck_changes: { title: { old: "A", new: "B" } },
      modified_cards: [{ id: "1", changes: { front_text: { old: "x", new: "y" } } }],
    });
  });
});
