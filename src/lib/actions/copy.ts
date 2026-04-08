"use server";

import { createClient } from "@/lib/supabase/server";

export async function copyDeck(deckId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  // Fetch original deck + cards
  const { data: original } = await supabase
    .from("decks")
    .select("*, flashcards(*)")
    .eq("id", deckId)
    .single();

  if (!original) throw new Error("Deck introuvable");

  // Create copy
  const { data: newDeck, error: deckError } = await supabase
    .from("decks")
    .insert({
      owner_id: user.id,
      title: `${original.title} (copie)`,
      description: original.description,
      tags: original.tags,
      category: original.category,
      visibility: "private",
      original_deck_id: original.id,
    })
    .select()
    .single();

  if (deckError) throw deckError;

  // Copy all flashcards
  if (original.flashcards?.length > 0) {
    const cards = original.flashcards.map((c: { front_text: string; back_text: string; explanation: string; front_image_url: string | null; back_image_url: string | null; position: number }) => ({
      deck_id: newDeck.id,
      front_text: c.front_text,
      back_text: c.back_text,
      explanation: c.explanation,
      front_image_url: c.front_image_url,
      back_image_url: c.back_image_url,
      position: c.position,
    }));
    await supabase.from("flashcards").insert(cards);
  }

  // Increment copy count
  await supabase
    .from("decks")
    .update({ copy_count: (original.copy_count ?? 0) + 1 })
    .eq("id", deckId);

  // Notify original owner
  if (original.owner_id !== user.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    await supabase.from("notifications").insert({
      user_id: original.owner_id,
      type: "deck_copied",
      title: "Deck copié",
      body: `${profile?.display_name ?? "Quelqu'un"} a copié votre deck "${original.title}"`,
      data: { deck_id: deckId, copier_id: user.id },
    });
  }

  return newDeck.id;
}

export async function copyQuiz(quizId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: original } = await supabase
    .from("quizzes")
    .select("*, quiz_questions(*, quiz_answers(*))")
    .eq("id", quizId)
    .single();

  if (!original) throw new Error("Quiz introuvable");

  const { data: newQuiz, error: quizError } = await supabase
    .from("quizzes")
    .insert({
      owner_id: user.id,
      title: `${original.title} (copie)`,
      description: original.description,
      tags: original.tags,
      category: original.category,
      visibility: "private",
      original_quiz_id: original.id,
    })
    .select()
    .single();

  if (quizError) throw quizError;

  // Copy questions + answers
  for (const q of original.quiz_questions ?? []) {
    const { data: newQ } = await supabase
      .from("quiz_questions")
      .insert({
        quiz_id: newQuiz.id,
        question_text: q.question_text,
        image_url: q.image_url,
        position: q.position,
      })
      .select()
      .single();

    if (newQ && q.quiz_answers?.length > 0) {
      const answers = q.quiz_answers.map((a: { answer_text: string; is_correct: boolean; position: number }) => ({
        question_id: newQ.id,
        answer_text: a.answer_text,
        is_correct: a.is_correct,
        position: a.position,
      }));
      await supabase.from("quiz_answers").insert(answers);
    }
  }

  // Notify
  if (original.owner_id !== user.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    await supabase.from("notifications").insert({
      user_id: original.owner_id,
      type: "quiz_copied",
      title: "Quiz copié",
      body: `${profile?.display_name ?? "Quelqu'un"} a copié votre quiz "${original.title}"`,
      data: { quiz_id: quizId, copier_id: user.id },
    });
  }

  return newQuiz.id;
}
