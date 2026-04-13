"use client";

import type { DiffPayload } from "@/lib/types";
import { Plus, Minus, Pencil } from "lucide-react";

interface DiffViewerProps {
  diff: DiffPayload;
}

export function DiffViewer({ diff }: DiffViewerProps) {
  return (
    <div className="space-y-4">
      {/* Deck-level changes */}
      {diff.deck_changes && Object.keys(diff.deck_changes).length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1 text-sm font-medium text-[var(--foreground)]">
            <Pencil size={14} /> Modifications du deck
          </h4>
          <div className="space-y-2">
            {Object.entries(diff.deck_changes).map(([field, change]) => (
              <div key={field} className="text-sm">
                <span className="font-medium capitalize text-[var(--text-muted)]">{field} :</span>
                <div className="ml-4">
                  <div className="rounded bg-red-500/15 px-3 py-1 text-red-200 line-through">{change.old}</div>
                  <div className="mt-1 rounded bg-emerald-500/15 px-3 py-1 text-emerald-200">{change.new}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modified cards */}
      {diff.modified_cards && diff.modified_cards.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1 text-sm font-medium text-[var(--foreground)]">
            <Pencil size={14} /> Cartes modifiées ({diff.modified_cards.length})
          </h4>
          <div className="space-y-3">
            {diff.modified_cards.map((mod) => (
              <div key={mod.id} className="space-y-1 rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] p-3 text-sm">
                {Object.entries(mod.changes).map(([field, change]) => (
                  <div key={field}>
                    <span className="text-xs capitalize text-[var(--text-muted)]">{field.replace("_", " ")} :</span>
                    <div className="rounded bg-red-500/15 px-2 py-0.5 text-xs text-red-200 line-through">{change.old}</div>
                    <div className="mt-0.5 rounded bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-200">{change.new}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Added cards */}
      {diff.added_cards && diff.added_cards.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1 text-sm font-medium text-emerald-300">
            <Plus size={14} /> Cartes ajoutées ({diff.added_cards.length})
          </h4>
          <div className="space-y-2">
            {diff.added_cards.map((card, i) => (
              <div key={i} className="rounded-lg border border-emerald-400/35 bg-emerald-500/15 p-3 text-sm text-emerald-100">
                <p><span className="text-emerald-300">Recto :</span> {card.front_text}</p>
                <p><span className="text-emerald-300">Verso :</span> {card.back_text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Removed cards */}
      {diff.removed_card_ids && diff.removed_card_ids.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1 text-sm font-medium text-red-300">
            <Minus size={14} /> Cartes supprimées ({diff.removed_card_ids.length})
          </h4>
          <p className="text-sm text-red-200">{diff.removed_card_ids.length} carte(s) sera/seront supprimée(s)</p>
        </div>
      )}
    </div>
  );
}
