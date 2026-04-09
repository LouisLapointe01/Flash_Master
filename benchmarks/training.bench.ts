import { bench, describe } from "vitest";
import { buildTrainingScopeOptions, type TrainingQuizSource } from "@/lib/utils/training";

const ROOTS = ["Science", "History", "Math", "Geography", "Literature", "Art", "Physics", "Biology"];
const BRANCHES = ["Basics", "Intermediate", "Advanced", "Practice", "Theory", "Case study"];
const LEAVES = ["Set A", "Set B", "Set C", "Set D", "Set E"];

function makeQuiz(index: number, depth: number): TrainingQuizSource {
  const root = ROOTS[index % ROOTS.length];
  const branch = BRANCHES[index % BRANCHES.length];
  const leaf = LEAVES[index % LEAVES.length];
  const path = [root, branch, leaf].slice(0, Math.max(1, Math.min(3, depth)));

  return {
    id: `quiz-${index}`,
    category: path[0],
    category_path: path,
    quiz_questions: [{ count: 5 + (index % 26) }],
  };
}

function buildDataset(size: number, depth = 3): TrainingQuizSource[] {
  return Array.from({ length: size }, (_, i) => makeQuiz(i, depth));
}

const quizzes100 = buildDataset(100, 2);
const quizzes1000 = buildDataset(1000, 3);
const quizzes5000 = buildDataset(5000, 3);

describe("Training scope generation", () => {
  bench("build options from 100 quizzes", () => {
    buildTrainingScopeOptions(quizzes100);
  });

  bench("build options from 1,000 quizzes", () => {
    buildTrainingScopeOptions(quizzes1000);
  });

  bench("build options from 5,000 quizzes", () => {
    buildTrainingScopeOptions(quizzes5000);
  });

  bench("simulate 80 incremental recomputations (1,000 quizzes)", () => {
    for (let i = 0; i < 80; i += 1) {
      const rotated = quizzes1000.slice(i).concat(quizzes1000.slice(0, i));
      buildTrainingScopeOptions(rotated);
    }
  });
});
