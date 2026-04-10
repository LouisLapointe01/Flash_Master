"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Flashcard } from "@/lib/types";
import { Maximize2, RotateCcw, X } from "lucide-react";
import { FlashMasterLogo } from "@/components/branding/flash-master-logo";
import Image from "next/image";

interface StudyCardProps {
  card: Flashcard;
  onRate: (difficulty: "again" | "hard" | "good" | "easy") => void;
}

export function StudyCard({ card, onRate }: StudyCardProps) {
  const [flipped, setFlipped] = useState(false);

  const intervals = [
    { key: "again" as const, label: "A revoir" },
    { key: "hard" as const, label: "Difficile" },
    { key: "good" as const, label: "Bien" },
    { key: "easy" as const, label: "Facile" },
  ];

  return (
    <div className="mx-auto w-full max-w-xl px-4">
      {/* Card Container */}
      <div 
        className="relative aspect-[4/3] w-full cursor-pointer"
        onClick={() => setFlipped(!flipped)}
        style={{ perspective: "1200px" }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front side */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            <FlashMasterLogo size="sm" withWordmark={false} className="absolute top-4 left-4 opacity-20" />
            <div className="text-center">
              {card.front_image_url && (
                <div className="mb-6 max-h-48 overflow-hidden rounded-lg">
                  <img src={card.front_image_url} alt="Flashcard front" className="h-full w-full object-contain" />
                </div>
              )}
              <p className="text-2xl font-black uppercase tracking-tighter text-white md:text-3xl">{card.front_text}</p>
            </div>
          </div>

          {/* Back side */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <FlashMasterLogo size="sm" withWordmark={false} className="absolute top-4 left-4 opacity-20" />
            <div className="text-center">
              {card.back_image_url && (
                <div className="mb-6 max-h-48 overflow-hidden rounded-lg">
                  <img src={card.back_image_url} alt="Flashcard back" className="h-full w-full object-contain" />
                </div>
              )}
              <p className="text-2xl font-black uppercase tracking-tighter text-secondary md:text-3xl">{card.back_text}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Info Panel Below Card */}
      <div className="min-h-[12rem] py-8">
        {flipped && card.explanation && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <h4 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Explications</h4>
            <div className="max-h-48 overflow-y-auto pr-2 text-sm leading-relaxed text-zinc-300">
              {card.explanation}
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-6">
        {!flipped ? (
          <button
            onClick={() => setFlipped(true)}
            className="w-full rounded-full bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-black transition-transform hover:scale-105 active:scale-95"
          >
            Révéler la réponse
          </button>
        ) : (
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
            {intervals.map((btn) => (
              <button
                key={btn.key}
                onClick={(e) => {
                  e.stopPropagation();
                  setFlipped(false);
                  onRate(btn.key);
                }}
                className="rounded-xl border border-zinc-800 bg-zinc-900 py-4 text-[10px] font-bold uppercase tracking-widest transition-all hover:border-white hover:bg-zinc-800"
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
