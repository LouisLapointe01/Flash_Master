import { createClient } from "@/lib/supabase/server";
import { getUserPremiumStatus } from "@/lib/actions/action-points";
import { buildTrainingScopeOptions, type TrainingQuizSource } from "@/lib/utils/training";
import { TrainingLaunchHub, type TrainingHotspot } from "@/components/training/training-launch-hub";

type QuizRow = {
  id: string;
  category: string | null;
  category_path: string[];
  quiz_questions?: Array<{ count: number }>;
};

type SessionQuiz = {
  category: string | null;
  category_path: string[];
};

type QuizSessionRow = {
  score: number;
  total_questions: number;
  quizzes?: SessionQuiz | SessionQuiz[] | null;
};

function getSessionCategoryPath(session: QuizSessionRow) {
  const quiz = Array.isArray(session.quizzes) ? session.quizzes[0] : session.quizzes;
  const path = quiz?.category_path ?? [];

  if (Array.isArray(path) && path.length > 0) {
    return path.map((item) => item.trim()).filter(Boolean);
  }

  if (quiz?.category?.trim()) return [quiz.category.trim()];
  return [] as string[];
}

function buildHotspots(sessions: QuizSessionRow[], scopes: ReturnType<typeof buildTrainingScopeOptions>) {
  const scoreByScope = new Map<string, { label: string; mistakes: number; sessions: number }>();

  for (const session of sessions) {
    const mistakes = Math.max(0, (session.total_questions ?? 0) - (session.score ?? 0));
    if (mistakes <= 0) continue;

    const path = getSessionCategoryPath(session);
    if (path.length === 0) continue;

    for (let depth = 1; depth <= path.length; depth += 1) {
      const label = path.slice(0, depth).join(" > ");
      const key = label.toLowerCase();
      const existing = scoreByScope.get(key) ?? { label, mistakes: 0, sessions: 0 };
      existing.mistakes += mistakes;
      existing.sessions += 1;
      scoreByScope.set(key, existing);
    }
  }

  const scopeByKey = new Map(scopes.map((scope) => [scope.key, scope]));

  return Array.from(scoreByScope.entries())
    .map(([key, value]) => {
      const scope = scopeByKey.get(key);
      return {
        key,
        label: value.label,
        mistakes: value.mistakes,
        sessions: value.sessions,
        questionCount: scope?.questionCount ?? 0,
        quizCount: scope?.quizCount ?? 0,
        sampleQuizId: scope?.sampleQuizId ?? null,
      };
    })
    .sort((a, b) => b.mistakes - a.mistakes || b.sessions - a.sessions)
    .slice(0, 8) as TrainingHotspot[];
}

export const dynamic = "force-dynamic";

export default async function TrainingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const premiumStatus = await getUserPremiumStatus();
  const isPremium = premiumStatus?.isPremium ?? false;
  const actionBalance = premiumStatus?.actionPoints?.balance ?? 0;
  const canLaunchTraining = true; // throttling desactive temporairement

  const [{ data: quizData }, { data: sessionsData }] = await Promise.all([
    supabase
      .from("quizzes")
      .select("id, category, category_path, quiz_questions(count), visibility, owner_id")
      .or(`visibility.eq.public,owner_id.eq.${user?.id ?? ""}`)
      .order("updated_at", { ascending: false })
      .limit(300),
    supabase
      .from("quiz_sessions")
      .select("score, total_questions, quizzes(category, category_path)")
      .eq("user_id", user?.id ?? "")
      .order("completed_at", { ascending: false })
      .limit(140),
  ]);

  const quizzes = ((quizData as QuizRow[]) ?? []).map((quiz) => ({
    id: quiz.id,
    category: quiz.category,
    category_path: quiz.category_path,
    quiz_questions: quiz.quiz_questions,
  })) as TrainingQuizSource[];

  const scopes = buildTrainingScopeOptions(quizzes);
  const hotspots = buildHotspots((sessionsData as QuizSessionRow[]) ?? [], scopes);

  return (
    <div className="space-y-5">
      <section className="game-panel precision-hud-panel animate-in-up p-5 lg:p-6">
        <p className="hud-chip">Training</p>
        <h1 className="page-title mt-2">Precision Lab</h1>
        {!isPremium ? (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
            ⚡ Points d&apos;action restants: {actionBalance}
          </p>
        ) : null}
      </section>

      <TrainingLaunchHub scopes={scopes} hotspots={hotspots} canLaunchTraining={canLaunchTraining} />
    </div>
  );
}
