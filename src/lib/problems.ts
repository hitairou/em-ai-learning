import type { Problem } from "@prisma/client";
import type { Choice, Course, ProblemView } from "@/types/learning";
import { parseJson } from "@/lib/json";

export function toProblemView(problem: Problem, includeAnswer = false): ProblemView & {
  correctAnswer?: string;
  solution?: string;
} {
  return {
    id: problem.id,
    course: problem.course as Course,
    unit: problem.unit,
    topic: problem.topic,
    subtopic: problem.subtopic,
    difficulty: problem.difficulty,
    sourceType: problem.sourceType,
    title: problem.title,
    questionText: problem.questionText,
    choices: parseJson<Choice[]>(problem.choicesJson, []),
    explanation: includeAnswer ? problem.explanation : undefined,
    requiredFormulas: includeAnswer
      ? parseJson<string[]>(problem.requiredFormulasJson, [])
      : undefined,
    commonMistakes: includeAnswer
      ? parseJson<string[]>(problem.commonMistakesJson, [])
      : undefined,
    ...(includeAnswer
      ? { correctAnswer: problem.correctAnswer, solution: problem.solution }
      : {}),
  };
}
