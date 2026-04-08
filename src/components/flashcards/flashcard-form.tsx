"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, ImagePlus } from "lucide-react";
import Image from "next/image";

interface FlashcardFormProps {
  initialValues?: {
    front_text: string;
    back_text: string;
    explanation: string;
  };
  onSubmit: (
    values: { front_text: string; back_text: string; explanation: string },
    frontImage?: File | null,
    backImage?: File | null
  ) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function FlashcardForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Ajouter",
}: FlashcardFormProps) {
  const [frontText, setFrontText] = useState(initialValues?.front_text ?? "");
  const [backText, setBackText] = useState(initialValues?.back_text ?? "");
  const [explanation, setExplanation] = useState(initialValues?.explanation ?? "");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const frontPreviewUrl = useMemo(
    () => (frontImage ? URL.createObjectURL(frontImage) : null),
    [frontImage]
  );
  const backPreviewUrl = useMemo(
    () => (backImage ? URL.createObjectURL(backImage) : null),
    [backImage]
  );

  useEffect(() => {
    return () => {
      if (frontPreviewUrl) URL.revokeObjectURL(frontPreviewUrl);
    };
  }, [frontPreviewUrl]);

  useEffect(() => {
    return () => {
      if (backPreviewUrl) URL.revokeObjectURL(backPreviewUrl);
    };
  }, [backPreviewUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!frontText.trim() || !backText.trim()) return;

    setLoading(true);
    try {
      await onSubmit(
        { front_text: frontText.trim(), back_text: backText.trim(), explanation: explanation.trim() },
        frontImage,
        backImage
      );
      if (!initialValues) {
        setFrontText("");
        setBackText("");
        setExplanation("");
        setFrontImage(null);
        setBackImage(null);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="game-panel space-y-4 rounded-2xl border border-[#d9cfbd] p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Textarea
            id="front"
            label="Recto *"
            value={frontText}
            onChange={(e) => setFrontText(e.target.value)}
            placeholder="Question ou terme"
            rows={3}
            required
          />
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#d6cab8] bg-white/85 px-3 py-1.5 text-xs font-semibold text-[#5e5647] hover:border-[#b9aa90] hover:text-[#4f4a3f]">
            <ImagePlus size={14} />
            {frontImage ? "Modifier image recto" : "Ajouter image recto"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFrontImage(e.target.files?.[0] ?? null)}
            />
          </label>
          {frontImage && (
            <p className="mt-1 text-xs text-[#7b7466]">{frontImage.name}</p>
          )}
          {frontPreviewUrl && (
            <div className="mt-3 overflow-hidden rounded-xl border border-[#e5ddce] bg-white/90 p-2">
              <Image
                src={frontPreviewUrl}
                alt="Apercu recto"
                width={640}
                height={320}
                unoptimized
                className="h-40 w-full rounded-lg object-cover"
              />
            </div>
          )}
        </div>

        <div>
          <Textarea
            id="back"
            label="Verso *"
            value={backText}
            onChange={(e) => setBackText(e.target.value)}
            placeholder="Réponse ou définition"
            rows={3}
            required
          />
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#d6cab8] bg-white/85 px-3 py-1.5 text-xs font-semibold text-[#5e5647] hover:border-[#b9aa90] hover:text-[#4f4a3f]">
            <ImagePlus size={14} />
            {backImage ? "Modifier image verso" : "Ajouter image verso"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setBackImage(e.target.files?.[0] ?? null)}
            />
          </label>
          {backImage && (
            <p className="mt-1 text-xs text-[#7b7466]">{backImage.name}</p>
          )}
          {backPreviewUrl && (
            <div className="mt-3 overflow-hidden rounded-xl border border-[#e5ddce] bg-white/90 p-2">
              <Image
                src={backPreviewUrl}
                alt="Apercu verso"
                width={640}
                height={320}
                unoptimized
                className="h-40 w-full rounded-lg object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <Textarea
        id="explanation"
        label="Explication (optionnel)"
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
        placeholder="Détails ou astuce mnémotechnique"
        rows={2}
      />

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} size="sm">
          <Plus size={14} />
          {loading ? "..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            <X size={14} /> Annuler
          </Button>
        )}
      </div>
    </form>
  );
}
