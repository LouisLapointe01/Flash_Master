"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Quiz, QuizQuestion, QuizAnswer } from "@/lib/types";

export function useQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("quizzes")
      .select("*, quiz_questions(count)")
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false });

    setQuizzes((data as Quiz[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchQuizzes();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchQuizzes]);

  async function createQuiz(values: {
    title: string;
    description: string;
    tags: string[];
    category: string;
    category_path?: string[];
    visibility: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");

    const { data, error } = await supabase
      .from("quizzes")
      .insert({ ...values, owner_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data as Quiz;
  }

  async function updateQuiz(id: string, values: Partial<Quiz>) {
    const { error } = await supabase.from("quizzes").update(values).eq("id", id);
    if (error) throw error;
    await fetchQuizzes();
  }

  async function deleteQuiz(id: string) {
    const { error } = await supabase.from("quizzes").delete().eq("id", id);
    if (error) throw error;
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
  }

  return { quizzes, loading, fetchQuizzes, createQuiz, updateQuiz, deleteQuiz };
}

export function useQuiz(id: string) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("quizzes")
        .select("*, quiz_questions(*, quiz_answers(*)), profiles(display_name, avatar_url)")
        .eq("id", id)
        .single();

      if (data) {
        if (data.quiz_questions) {
          data.quiz_questions.sort((a: QuizQuestion, b: QuizQuestion) => a.position - b.position);
          data.quiz_questions.forEach((q: QuizQuestion) => {
            if (q.quiz_answers) {
              q.quiz_answers.sort((a: QuizAnswer, b: QuizAnswer) => a.position - b.position);
            }
          });
        }
        setQuiz(data as Quiz);
      }
      setLoading(false);
    }
    fetch();
  }, [id, supabase]);

  return { quiz, loading, setQuiz };
}
