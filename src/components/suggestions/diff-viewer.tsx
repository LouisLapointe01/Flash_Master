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
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Pencil size={14} /> Modifications du deck
          </h4>
          <div className="space-y-2">
            {Object.entries(diff.deck_changes).map(([field, change]) => (
              <div key={field} className="text-sm">
                <span className="font-medium text-gray-600 capitalize">{field} :</span>
                <div className="ml-4">
                  <div className="bg-red-50 text-red-700 px-3 py-1 rounded line-through">{change.old}</div>
                  <div className="bg-green-50 text-green-700 px-3 py-1 rounded mt-1">{change.new}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modified cards */}
      {diff.modified_cards && diff.modified_cards.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Pencil size={14} /> Cartes modifiées ({diff.modified_cards.length})
          </h4>
          <div className="space-y-3">
            {diff.modified_cards.map((mod) => (
              <div key={mod.id} className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                {Object.entries(mod.changes).map(([field, change]) => (
                  <div key={field}>
                    <span className="text-xs text-gray-500 capitalize">{field.replace("_", " ")} :</span>
                    <div className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs line-through">{change.old}</div>
                    <div className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs mt-0.5">{change.new}</div>
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
          <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
            <Plus size={14} /> Cartes ajoutées ({diff.added_cards.length})
          </h4>
          <div className="space-y-2">
            {diff.added_cards.map((card, i) => (
              <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                <p><span className="text-gray-500">Recto :</span> {card.front_text}</p>
                <p><span className="text-gray-500">Verso :</span> {card.back_text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Removed cards */}
      {diff.removed_card_ids && diff.removed_card_ids.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
            <Minus size={14} /> Cartes supprimées ({diff.removed_card_ids.length})
          </h4>
          <p className="text-sm text-red-600">{diff.removed_card_ids.length} carte(s) sera/seront supprimée(s)</p>
        </div>
      )}
    </div>
  );
}
