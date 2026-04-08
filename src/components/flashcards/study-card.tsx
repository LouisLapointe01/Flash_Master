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
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Card */}
      <div
        className="relative h-[31rem] cursor-pointer"
        onClick={() => setFlipped(!flipped)}
        style={{ perspective: "1200px" }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 30 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col rounded-3xl border border-[#d9cfbd] bg-[linear-gradient(165deg,#fffdf8,#f4efe5)] p-6 text-center shadow-[0_20px_50px_-28px_rgba(71,59,39,.46)]"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="cover-art-tag">Recto</span>
              <FlashMasterLogo size="sm" withWordmark={false} className="rounded-[0.8rem] bg-white/72 p-1" />
            </div>

            {card.front_image_url && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage(card.front_image_url ?? null);
                }}
                className="group relative mb-4 block overflow-hidden rounded-2xl border border-[#e2daca] bg-[#f8f4eb]"
              >
                <Image
                  src={card.front_image_url}
                  alt="Illustration recto"
                  width={900}
                  height={420}
                  className="h-56 w-full object-cover md:h-64"
                />
                <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-xs text-white">
                  <Maximize2 size={12} /> Agrandir
                </span>
              </button>
            )}
            <p className="mt-auto text-xl font-semibold text-[#2b303a] md:text-2xl">{card.front_text}</p>
            <p className="mt-4 flex items-center justify-center gap-1 text-xs text-[#7b7466]">
              <RotateCcw size={12} /> Cliquer pour retourner
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col rounded-3xl border border-[#d9cfbd] bg-[linear-gradient(170deg,#f7f2e8,#efe6d6)] p-6 text-center shadow-[0_20px_50px_-28px_rgba(71,59,39,.46)]"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="cover-art-tag">Verso</span>
              <FlashMasterLogo size="sm" withWordmark={false} className="rounded-[0.8rem] bg-white/72 p-1" />
            </div>

            {card.back_image_url && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage(card.back_image_url ?? null);
                }}
                className="group relative mb-4 block overflow-hidden rounded-2xl border border-[#e2daca] bg-[#f8f4eb]"
              >
                <Image
                  src={card.back_image_url}
                  alt="Illustration verso"
                  width={900}
                  height={420}
                  className="h-56 w-full object-cover md:h-64"
                />
                <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-xs text-white">
                  <Maximize2 size={12} /> Agrandir
                </span>
              </button>
            )}
            <p className="mt-auto text-xl font-semibold text-[#2b303a] md:text-2xl">{card.back_text}</p>
            {card.explanation && (
              <p className="mt-3 rounded-xl border border-[#e5ddce] bg-white/75 px-3 py-2 text-sm italic text-[#676258]">
                {card.explanation}
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Rating buttons — only show when flipped */}
      {flipped && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex flex-wrap justify-center gap-3"
        >
          {[
            { key: "again" as const, label: "A revoir", color: "border-[#e6c7c7] bg-[#f9e6e6] text-[#8a3d3d] hover:bg-[#f7dada]" },
            { key: "hard" as const, label: "Difficile", color: "border-[#e6d3b8] bg-[#f8efde] text-[#7a5e2f] hover:bg-[#f5e6cb]" },
            { key: "good" as const, label: "Bien", color: "border-[#b7d4bb] bg-[#e7f2e8] text-[#3f6a46] hover:bg-[#dcecdc]" },
            { key: "easy" as const, label: "Facile", color: "border-[#cdbfa9] bg-[#f3ece0] text-[#5f584d] hover:bg-[#eee4d5]" },
          ].map((btn) => (
            <button
              key={btn.key}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFlipped(false);
                onRate(btn.key);
              }}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${btn.color}`}
            >
              {btn.label}
            </button>
          ))}
        </motion.div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-h-[90vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-2 top-2 z-10 rounded-full bg-black/70 p-2 text-white hover:bg-black"
            >
              <X size={18} />
            </button>
            <Image
              src={previewImage}
              alt="Apercu"
              width={1600}
              height={1000}
              className="max-h-[90vh] w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
