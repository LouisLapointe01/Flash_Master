import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { HelpCircle, ArrowRight } from "lucide-react";
import { canReadSharedContent } from "@/lib/utils/access";
import type { Visibility } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ShareQuizPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("*, quiz_questions(count), profiles(display_name)")
    .eq("share_token", token)
    .single();

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Lien invalide</h1>
          <p className="mt-2 text-[var(--text-muted)]">Ce lien de partage n&apos;existe pas ou a expiré.</p>
        </div>
      </div>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === quiz.owner_id;
  const canRead = canReadSharedContent({
    visibility: (quiz.visibility as Visibility) ?? "private",
    isOwner,
    hasValidShareToken: true,
  });

  if (!canRead) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Acces indisponible</h1>
          <p className="mt-2 text-[var(--text-muted)]">Ce contenu n&apos;est pas partageable via lien.</p>
        </div>
      </div>
    );
  }

  if (user) {
    redirect(`/quizzes/${quiz.id}`);
  }

  const questionCount = Array.isArray(quiz.quiz_questions) && quiz.quiz_questions.length > 0 && "count" in quiz.quiz_questions[0]
    ? (quiz.quiz_questions[0] as { count: number }).count : 0;

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "linear-gradient(145deg,var(--background),#05060a)" }}>
      <div className="game-panel w-full max-w-md rounded-2xl border border-[var(--line)] p-8 text-center space-y-6">
        <div className="inline-block rounded-2xl border border-[var(--line-strong)] bg-[rgba(0,255,255,0.1)] p-4 text-[var(--secondary)]">
          <HelpCircle size={48} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{quiz.title}</h1>
          {quiz.description && <p className="mt-2 text-[var(--text-muted)]">{quiz.description}</p>}
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Par {(quiz as { profiles?: { display_name: string } }).profiles?.display_name ?? "—"} · {questionCount} questions
          </p>
        </div>
        <div className="space-y-3">
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--line-strong)] bg-[linear-gradient(145deg,#00d6d6,#38ff8a)] py-3 font-medium text-black transition hover:brightness-105"
          >
            Connectez-vous pour copier <ArrowRight size={16} />
          </Link>
          <Link href="/register" className="block text-sm text-[var(--secondary)] hover:text-[var(--primary)]">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
