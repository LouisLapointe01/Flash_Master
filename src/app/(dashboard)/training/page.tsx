import { createClient } from "@/lib/supabase/server";
import { getUserPremiumStatus } from "@/lib/actions/action-points";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buildTrainingScopeOptions, type TrainingQuizSource } from "@/lib/utils/training";
import { Layers, Play, Target } from "lucide-react";

export const dynamic = "force-dynamic";

type QuizRow = {
  id: string;
  category: string | null;
  category_path: string[];
  quiz_questions?: Array<{ count: number }>;
};

export default async function TrainingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const premiumStatus = await getUserPremiumStatus();
  const isPremium = premiumStatus?.isPremium ?? false;
  const actionBalance = premiumStatus?.actionPoints?.balance ?? 0;
  const canLaunchTraining = isPremium || actionBalance > 0;

  const { data } = await supabase
    .from("quizzes")
    .select("id, category, category_path, quiz_questions(count), visibility, owner_id")
    .or(`visibility.eq.public,owner_id.eq.${user?.id ?? ""}`)
    .order("updated_at", { ascending: false })
    .limit(200);

  const quizzes = ((data as QuizRow[]) ?? []).map((quiz) => ({
    id: quiz.id,
    category: quiz.category,
    category_path: quiz.category_path,
    quiz_questions: quiz.quiz_questions,
  })) as TrainingQuizSource[];

  const scopes = buildTrainingScopeOptions(quizzes);

  return (
    <div className="space-y-5">
      <section className="game-panel animate-in-up p-5 lg:p-6">
        <p className="hud-chip">Mode entrainement</p>
        <h1 className="page-title mt-3">Entrainement</h1>
        <p className="mt-2 max-w-3xl text-sm text-[var(--text-muted)]">
          Choisis un scope de revision (global, categorie, sous-categorie) et lance une manche. Chaque ligne affiche le volume disponible.
        </p>
        {!isPremium ? (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
            ⚡ Points d&apos;action restants: {actionBalance}
          </p>
        ) : null}
        {!isPremium && !canLaunchTraining ? (
          <p className="mt-2 text-sm text-[#a34d4d]">
            Solde epuise: impossible de lancer une manche training pour le moment.
          </p>
        ) : null}
      </section>

      <section className="game-panel p-4 lg:p-5">
        {scopes.length === 0 ? (
          <div className="py-12 text-center">
            <Layers size={40} className="mx-auto text-cyan-300" />
            <p className="mt-3 text-sm text-[var(--text-muted)]">Aucune question disponible pour l&apos;entrainement.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {scopes.map((scope) => (
              <article
                key={scope.key}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[0.9rem] border border-[var(--line)] bg-[var(--surface-soft)] p-3"
              >
                <div style={{ paddingLeft: `${scope.depth * 0.75}rem` }} className="min-w-0">
                  <p className="truncate font-mono text-sm font-black uppercase tracking-[0.07em] text-[var(--foreground)]">
                    {scope.label}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {scope.questionCount} questions · {scope.quizCount} quiz
                  </p>
                </div>

                {scope.sampleQuizId ? (
                  canLaunchTraining ? (
                    <Link href={`/quizzes/${scope.sampleQuizId}/play?mode=training&scope=${encodeURIComponent(scope.key)}`}>
                      <Button size="sm">
                        <Play size={14} /> Lancer
                      </Button>
                    </Link>
                  ) : (
                    <Button size="sm" variant="secondary" disabled title="Points d'action insuffisants">
                      <Play size={14} /> Points insuffisants
                    </Button>
                  )
                ) : (
                  <Button size="sm" variant="secondary" disabled>
                    <Target size={14} /> Indisponible
                  </Button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
