import type { z } from "zod";
import type { problemSchema } from "@/lib/validation";

export function problemData(data: z.infer<typeof problemSchema>) {
  return {
    course: data.course,
    unit: data.unit,
    topic: data.topic,
    subtopic: data.subtopic ?? null,
    difficulty: data.difficulty,
    sourceType: data.sourceType,
    sourceYear: data.sourceYear ?? null,
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
  };
}
