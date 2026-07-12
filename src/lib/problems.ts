import type { Problem } from "@prisma/client";
import type { AdminProblemView, Choice, Course, ProblemView } from "@/types/learning";
import { parseJson } from "@/lib/json";

export function toProblemView(problem: Problem): ProblemView;
export function toProblemView(problem: Problem, includeAnswer: false): ProblemView;
export function toProblemView(problem: Problem, includeAnswer: true): AdminProblemView;
export function toProblemView(problem: Problem, includeAnswer = false): ProblemView | AdminProblemView {
  const learnerView: ProblemView = {
    id: problem.id,
    appQuestionId: problem.appQuestionId,
    course: problem.course as Course,
    unit: problem.unit,
    topic: problem.topic,
    subtopic: problem.subtopic,
    difficulty: problem.difficulty,
    answerKind: problem.answerKind,
    estimatedTimeSec: problem.estimatedTimeSec,
    title: problem.title,
    questionText: problem.questionText,
    choices: parseJson<Choice[]>(problem.choicesJson, []),
  };
  if (!includeAnswer) return learnerView;
  return {
    ...learnerView,
    sourceType: problem.sourceType,
    sourceYear: problem.sourceYear,
    questionType: problem.questionType,
    calculationMode: problem.calculationMode,
    parentId: problem.parentId,
    parentSourceId: problem.parentSourceId,
    humanReviewStatus: problem.humanReviewStatus,
    verificationStatus: problem.verificationStatus,
    appReadyStatus: problem.appReadyStatus,
    isActive: problem.isActive,
    correctAnswer: problem.correctAnswer,
    solution: problem.solution,
    explanation: problem.explanation,
    requiredFormulas: parseJson<string[]>(problem.requiredFormulasJson, []),
    commonMistakes: parseJson<string[]>(problem.commonMistakesJson, []),
    internalMetadata: parseJson<Record<string, unknown>>(problem.internalMetadataJson, {}),
  };
}
