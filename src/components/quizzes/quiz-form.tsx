"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Visibility } from "@/lib/types";
import { parseCategoryPath } from "@/lib/utils/ranked";
import { Save, X } from "lucide-react";

interface QuizFormProps {
  initialValues?: {
    title: string;
    description: string;
    tags: string[];
    category: string;
    category_path?: string[];
    visibility: Visibility;
  };
  onSubmit: (values: {
    title: string;
    description: string;
    tags: string[];
    category: string;
    category_path: string[];
    visibility: string;
  }) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function QuizForm({ initialValues, onSubmit, onCancel, submitLabel = "Créer" }: QuizFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [tagsInput, setTagsInput] = useState(initialValues?.tags.join(", ") ?? "");
  const [category, setCategory] = useState(initialValues?.category ?? "");
  const [categoryPathInput, setCategoryPathInput] = useState(initialValues?.category_path?.join(" > ") ?? "");
  const [visibility, setVisibility] = useState<Visibility>(initialValues?.visibility ?? "private");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError("");
    try {
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
      const categoryPath = parseCategoryPath(categoryPathInput);
      const resolvedCategory = category.trim() || categoryPath[0] || "";
      await onSubmit({
        title: title.trim(),
        description,
        tags,
        category: resolvedCategory,
        category_path: categoryPath,
        visibility,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      <Input id="title" label="Titre *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nom du quiz" required />
      <Textarea id="description" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description du quiz" rows={3} />
      <Input id="tags" label="Tags (séparés par des virgules)" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="histoire, géographie" />
      <Input id="category" label="Catégorie" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Sciences, Langues, etc." />
      <Input
        id="category_path"
        label="Catégorie hiérarchique"
        value={categoryPathInput}
        onChange={(e) => setCategoryPathInput(e.target.value)}
        placeholder="Science > Biologie > Ornithologie"
      />
      <div>
        <label className="mb-2 block text-sm font-medium text-[#5a5549]">Visibilité</label>
        <div className="flex gap-3">
          {(["private", "public", "link_only"] as const).map((v) => (
            <button key={v} type="button" onClick={() => setVisibility(v)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${visibility === v ? "border border-[#54462f] bg-[linear-gradient(140deg,#655438,#4f422e)] text-[#fff9ef]" : "border border-[#d4cab8] bg-white text-[#585042] hover:border-[#b9aa90]"}`}>
              {v === "private" ? "Privé" : v === "public" ? "Public" : "Lien privé"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}><Save size={16} />{loading ? "..." : submitLabel}</Button>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}><X size={16} />Annuler</Button>}
      </div>
    </form>
  );
}
