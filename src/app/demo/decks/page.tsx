"use client";

import { DEMO_DECKS } from "@/lib/demo/data";
import Link from "next/link";
import { Layers, Play, Eye } from "lucide-react";

export default function DemoDecksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes Decks</h1>
        <p className="text-gray-500 mt-1">{DEMO_DECKS.length} decks</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMO_DECKS.map((deck) => (
          <div key={deck.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Layers size={18} /></div>
              <h3 className="font-semibold text-gray-900 truncate">{deck.title}</h3>
            </div>
            {deck.description && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{deck.description}</p>}
            <div className="flex flex-wrap gap-1 mb-3">
              {deck.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">{tag}</span>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{deck.flashcards?.length ?? 0} cartes</span>
              <div className="flex gap-2">
                <Link href={`/demo/decks/${deck.id}`} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition text-xs font-medium">
                  <Eye size={12} /> Voir
                </Link>
                <Link href={`/demo/decks/${deck.id}/study`} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-xs font-medium">
                  <Play size={12} /> Étudier
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
