export type TrainingQuizSource = {
  id: string;
  category?: string | null;
  category_path?: string[] | null;
  quiz_questions?: Array<{ count?: number }>;
};

export type TrainingScopeOption = {
  key: string;
  label: string;
  path: string[];
  depth: number;
  questionCount: number;
  quizCount: number;
  sampleQuizId: string | null;
};

type MutableScope = TrainingScopeOption & {
  quizIds: Set<string>;
};

function getQuestionCount(quiz: TrainingQuizSource) {
  if (!Array.isArray(quiz.quiz_questions) || quiz.quiz_questions.length === 0) return 0;
  const first = quiz.quiz_questions[0];
  return typeof first?.count === "number" ? first.count : 0;
}

function getCategoryPath(quiz: TrainingQuizSource) {
  if (Array.isArray(quiz.category_path) && quiz.category_path.length > 0) {
    return quiz.category_path.map((item) => item.trim()).filter(Boolean);
  }
  if (quiz.category && quiz.category.trim()) {
    return [quiz.category.trim()];
  }
  return [] as string[];
}

export function buildTrainingScopeOptions(quizzes: TrainingQuizSource[]) {
  const scopes = new Map<string, MutableScope>();

  const globalScope: MutableScope = {
    key: "global",
    label: "Global",
    path: [],
    depth: 0,
    questionCount: 0,
    quizCount: 0,
    sampleQuizId: null,
    quizIds: new Set<string>(),
  };

  for (const quiz of quizzes) {
    const questionCount = getQuestionCount(quiz);
    if (questionCount <= 0) continue;

    if (!globalScope.quizIds.has(quiz.id)) {
      globalScope.quizIds.add(quiz.id);
      globalScope.quizCount += 1;
      if (!globalScope.sampleQuizId) globalScope.sampleQuizId = quiz.id;
    }
    globalScope.questionCount += questionCount;

    const path = getCategoryPath(quiz);
    for (let depth = 1; depth <= path.length; depth += 1) {
      const segmentPath = path.slice(0, depth);
      const key = segmentPath.join(" > ").toLowerCase();
      const label = segmentPath.join(" > ");

      const existing = scopes.get(key) ?? {
        key,
        label,
        path: segmentPath,
        depth,
        questionCount: 0,
        quizCount: 0,
        sampleQuizId: null,
        quizIds: new Set<string>(),
      };

      if (!existing.quizIds.has(quiz.id)) {
        existing.quizIds.add(quiz.id);
        existing.quizCount += 1;
        if (!existing.sampleQuizId) existing.sampleQuizId = quiz.id;
      }
      existing.questionCount += questionCount;
      scopes.set(key, existing);
    }
  }

  const orderedScopes = Array.from(scopes.values())
    .sort((a, b) => a.depth - b.depth || a.label.localeCompare(b.label))
    .map((scope) => ({
      key: scope.key,
      label: scope.label,
      path: scope.path,
      depth: scope.depth,
      questionCount: scope.questionCount,
      quizCount: scope.quizCount,
      sampleQuizId: scope.sampleQuizId,
    }));

  if (globalScope.questionCount <= 0) return orderedScopes;

  const global: TrainingScopeOption = {
    key: globalScope.key,
    label: globalScope.label,
    path: globalScope.path,
    depth: globalScope.depth,
    questionCount: globalScope.questionCount,
    quizCount: globalScope.quizCount,
    sampleQuizId: globalScope.sampleQuizId,
  };
  return [global, ...orderedScopes];
}
