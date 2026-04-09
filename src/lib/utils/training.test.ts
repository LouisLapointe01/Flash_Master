import { describe, expect, it } from "vitest";
import { buildTrainingScopeOptions, type TrainingQuizSource } from "@/lib/utils/training";

function quiz(overrides: Partial<TrainingQuizSource> = {}): TrainingQuizSource {
  return {
    id: "quiz-1",
    category: null,
    category_path: null,
    quiz_questions: [{ count: 0 }],
    ...overrides,
  };
}

describe("buildTrainingScopeOptions", () => {
  it("returns no scopes when there is no positive question count", () => {
    const result = buildTrainingScopeOptions([
      quiz({ id: "a", quiz_questions: [{ count: 0 }] }),
      quiz({ id: "b", quiz_questions: [] }),
      quiz({ id: "c" }),
    ]);

    expect(result).toEqual([]);
  });

  it("builds global and hierarchical scopes with aggregated counters", () => {
    const result = buildTrainingScopeOptions([
      quiz({ id: "q1", category_path: ["Science", "Biology"], quiz_questions: [{ count: 10 }] }),
      quiz({ id: "q2", category: "Science", quiz_questions: [{ count: 5 }] }),
      quiz({ id: "q3", category_path: ["Art"], quiz_questions: [{ count: 7 }] }),
    ]);

    expect(result[0]).toEqual({
      key: "global",
      label: "Global",
      path: [],
      depth: 0,
      questionCount: 22,
      quizCount: 3,
      sampleQuizId: "q1",
    });

    expect(result[1]).toEqual({
      key: "art",
      label: "Art",
      path: ["Art"],
      depth: 1,
      questionCount: 7,
      quizCount: 1,
      sampleQuizId: "q3",
    });

    expect(result[2]).toEqual({
      key: "science",
      label: "Science",
      path: ["Science"],
      depth: 1,
      questionCount: 15,
      quizCount: 2,
      sampleQuizId: "q1",
    });

    expect(result[3]).toEqual({
      key: "science > biology",
      label: "Science > Biology",
      path: ["Science", "Biology"],
      depth: 2,
      questionCount: 10,
      quizCount: 1,
      sampleQuizId: "q1",
    });
  });

  it("trims category values and ignores blank path fragments", () => {
    const result = buildTrainingScopeOptions([
      quiz({
        id: "q1",
        category_path: ["  History ", " ", " Medieval  "],
        quiz_questions: [{ count: 4 }],
      }),
    ]);

    const history = result.find((item) => item.key === "history");
    const medieval = result.find((item) => item.key === "history > medieval");

    expect(history).toBeDefined();
    expect(history?.label).toBe("History");

    expect(medieval).toBeDefined();
    expect(medieval?.label).toBe("History > Medieval");
  });

  it("deduplicates quizCount per scope by quiz id", () => {
    const result = buildTrainingScopeOptions([
      quiz({ id: "same", category: "Science", quiz_questions: [{ count: 3 }] }),
      quiz({ id: "same", category: "Science", quiz_questions: [{ count: 4 }] }),
    ]);

    const science = result.find((item) => item.key === "science");
    expect(science?.quizCount).toBe(1);
    expect(science?.questionCount).toBe(7);
  });
});
