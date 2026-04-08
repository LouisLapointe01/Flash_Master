"use client";

import { createClient } from "@/lib/supabase/client";
import type { Flashcard } from "@/lib/types";
import { compressImage } from "@/lib/utils/image-compression";
import { uploadImageWithApi } from "@/lib/utils/storage-upload";

const supabase = createClient();

export async function createFlashcard(
  deckId: string,
  values: { front_text: string; back_text: string; explanation: string; position: number },
  frontImage?: File | null,
  backImage?: File | null
) {
  const insertData: Record<string, unknown> = { ...values, deck_id: deckId };

  if (frontImage) {
    insertData.front_image_url = await uploadCardImage(frontImage);
  }
  if (backImage) {
    insertData.back_image_url = await uploadCardImage(backImage);
  }

  const { data, error } = await supabase
    .from("flashcards")
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  return data as Flashcard;
}

export async function updateFlashcard(
  id: string,
  values: Partial<Flashcard>,
  frontImage?: File | null,
  backImage?: File | null
) {
  const updateData: Record<string, unknown> = { ...values };

  if (frontImage) {
    updateData.front_image_url = await uploadCardImage(frontImage);
  }
  if (backImage) {
    updateData.back_image_url = await uploadCardImage(backImage);
  }

  const { error } = await supabase.from("flashcards").update(updateData).eq("id", id);
  if (error) throw error;
}

export async function deleteFlashcard(id: string) {
  const { error } = await supabase.from("flashcards").delete().eq("id", id);
  if (error) throw error;
}

async function uploadCardImage(file: File): Promise<string> {
  const compressed = await compressImage(file);
  return uploadImageWithApi("card-images", compressed);
}
