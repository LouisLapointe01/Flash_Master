"use client";

import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import type { Quiz, QuizQuestion, QuizAnswer } from "@/lib/types";

const supabase = createClient();

async function fetchMyQuizzes(): Promise<Quiz[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data } = await supabase
    .from("quizzes")
    .select("*, quiz_questions(count)")
    .eq("owner_id", session.user.id)
    .order("updated_at", { ascending: false });

  return (data as Quiz[]) ?? [];
}

export function useQuizzes() {
  const { data: quizzes = [], isLoading: loading, mutate } = useSWR("quizzes", fetchMyQuizzes, {
    revalidateOnFocus: false,
  });

  async function createQuiz(values: {
    title: string;
    description: string;
    tags: string[];
    category: string;
    category_path?: string[];
    visibility: string;
  }) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Non authentifié");

    const { data, error } = await supabase
      .from("quizzes")
      .insert({ ...values, owner_id: session.user.id })
      .select()
      .single();

    if (error) throw error;
    await mutate([data as Quiz, ...quizzes], false);
    return data as Quiz;
  }

  async function updateQuiz(id: string, values: Partial<Quiz>) {
    const optimistic = quizzes.map((q) => (q.id === id ? { ...q, ...values } : q));
    await mutate(optimistic, false);
    try {
      const { error } = await supabase.from("quizzes").update(values).eq("id", id);
      if (error) throw error;
    } catch (err) {
      await mutate();
      throw err;
    }
  }

  async function deleteQuiz(id: string) {
    await mutate(quizzes.filter((q) => q.id !== id), false);
    try {
      const { error } = await supabase.from("quizzes").delete().eq("id", id);
      if (error) throw error;
    } catch (err) {
      await mutate();
      throw err;
    }
  }

  return { quizzes, loading, fetchQuizzes: mutate, createQuiz, updateQuiz, deleteQuiz };
}

async function fetchQuiz(id: string): Promise<Quiz | null> {
  const { data } = await supabase
    .from("quizzes")
    .select("*, quiz_questions(*, quiz_answers(*)), profiles(display_name, avatar_url)")
    .eq("id", id)
    .single();

  if (data?.quiz_questions) {
    data.quiz_questions.sort((a: QuizQuestion, b: QuizQuestion) => a.position - b.position);
    data.quiz_questions.forEach((q: QuizQuestion) => {
      if (q.quiz_answers) {
        q.quiz_answers.sort((a: QuizAnswer, b: QuizAnswer) => a.position - b.position);
      }
    });
  }

  return (data as Quiz) ?? null;
}

export function useQuiz(id: string) {
  const { data: quiz = null, isLoading: loading, mutate } = useSWR(
    ["quiz", id],
    ([, quizId]) => fetchQuiz(quizId),
    { revalidateOnFocus: false }
  );

  return { quiz, loading, setQuiz: (q: Quiz | null) => mutate(q ?? undefined, false) };
}
