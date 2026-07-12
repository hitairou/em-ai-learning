import type { z } from "zod";
import type { problemSchema } from "@/lib/validation";
import { enforceReviewState } from "@/lib/problem-policy";

export function problemData(
  data: z.infer<typeof problemSchema>,
  current = { humanReviewStatus: "unreviewed", verificationStatus: "draft", isActive: false },
) {
  const reviewState = enforceReviewState(current, {
    humanReviewStatus: data.humanReviewStatus,
    verificationStatus: data.verificationStatus,
    isActive: data.isActive,
  });
  return {
    appQuestionId: data.appQuestionId || null,
    course: data.course,
    unit: data.unit,
    topic: data.topic,
    subtopic: data.subtopic ?? null,
    difficulty: data.difficulty,
    sourceType: data.sourceType,
    sourceYear: data.sourceYear ?? null,
    questionType: data.questionType,
    answerKind: data.answerKind,
    calculationMode: data.calculationMode,
    parentId: data.parentId || null,
    parentSourceId: data.parentSourceId || null,
    title: data.title,
    questionText: data.questionText,
    choicesJson: data.choices?.length ? JSON.stringify(data.choices) : null,
    correctAnswer: data.correctAnswer,
    solution: data.solution,
    explanation: data.explanation,
    keyConceptsJson: JSON.stringify(data.keyConcepts),
    requiredFormulasJson: JSON.stringify(data.requiredFormulas),
    commonMistakesJson: JSON.stringify(data.commonMistakes),
    figureUrlsJson: JSON.stringify(data.figureUrls),
    estimatedTimeSec: data.estimatedTimeSec,
    internalMetadataJson: JSON.stringify(data.internalMetadata),
    ...reviewState,
  };
}
