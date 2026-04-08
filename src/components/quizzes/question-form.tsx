"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Trash2, Check, ImagePlus } from "lucide-react";
import Image from "next/image";

interface AnswerInput {
  answer_text: string;
  is_correct: boolean;
}

interface QuestionFormProps {
  initialValues?: {
    question_text: string;
    answers: AnswerInput[];
  };
  onSubmit: (
    values: { question_text: string; answers: AnswerInput[] },
    image?: File | null
  ) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function QuestionForm({ initialValues, onSubmit, onCancel, submitLabel = "Ajouter" }: QuestionFormProps) {
  const [questionText, setQuestionText] = useState(initialValues?.question_text ?? "");
  const [answers, setAnswers] = useState<AnswerInput[]>(
    initialValues?.answers ?? [
      { answer_text: "", is_correct: true },
      { answer_text: "", is_correct: false },
    ]
  );
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const imagePreviewUrl = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  function addAnswer() {
    setAnswers((prev) => [...prev, { answer_text: "", is_correct: false }]);
  }

  function removeAnswer(index: number) {
    if (answers.length <= 2) return;
    setAnswers((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAnswer(index: number, field: keyof AnswerInput, value: string | boolean) {
    setAnswers((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  }

  function toggleCorrect(index: number) {
    setAnswers((prev) =>
      prev.map((a, i) => (i === index ? { ...a, is_correct: !a.is_correct } : a))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!questionText.trim()) return;
    const validAnswers = answers.filter((a) => a.answer_text.trim());
    if (validAnswers.length < 2) return;
    if (!validAnswers.some((a) => a.is_correct)) return;

    setLoading(true);
    try {
      await onSubmit({ question_text: questionText.trim(), answers: validAnswers }, image);
      if (!initialValues) {
        setQuestionText("");
        setAnswers([
          { answer_text: "", is_correct: true },
          { answer_text: "", is_correct: false },
        ]);
        setImage(null);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="game-panel space-y-4 rounded-2xl border border-[#d9cfbd] p-4">
      <Textarea
        id="question"
        label="Question *"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        placeholder="Posez votre question..."
        rows={2}
        required
      />

      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#d6cab8] bg-white/85 px-3 py-1.5 text-xs font-semibold text-[#5e5647] hover:border-[#b9aa90] hover:text-[#4f4a3f]">
        <ImagePlus size={14} />
        {image ? image.name : "Image (optionnel)"}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
      </label>

      {imagePreviewUrl ? (
        <div className="overflow-hidden rounded-xl border border-[#e5ddce] bg-white/90 p-2">
          <Image
            src={imagePreviewUrl}
            alt="Apercu question"
            width={720}
            height={352}
            unoptimized
            className="h-44 w-full rounded-lg object-cover"
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#5a5549]">Réponses *</label>
        {answers.map((answer, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleCorrect(i)}
              className={`rounded-lg p-1.5 transition ${answer.is_correct ? "border border-[#b7d4bb] bg-[#e7f2e8] text-[#3f6a46]" : "border border-[#ddd4c5] bg-[#f4f0e8] text-[#7b7466] hover:text-[#5f584d]"}`}
              title={answer.is_correct ? "Correcte" : "Marquer comme correcte"}
            >
              <Check size={14} />
            </button>
            <Input
              value={answer.answer_text}
              onChange={(e) => updateAnswer(i, "answer_text", e.target.value)}
              placeholder={`Réponse ${i + 1}`}
              className="flex-1"
            />
            {answers.length > 2 && (
              <button type="button" onClick={() => removeAnswer(i)} className="rounded p-1.5 text-[#8c8576] hover:text-red-600">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
        {answers.length < 6 && (
          <button type="button" onClick={addAnswer} className="flex items-center gap-1 text-sm text-[#6f5d42] hover:text-[#4f422e]">
            <Plus size={14} /> Ajouter une réponse
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} size="sm">
          <Plus size={14} /> {loading ? "..." : submitLabel}
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
