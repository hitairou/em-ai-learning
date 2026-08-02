import "server-only";
import { z } from "zod";
import type { Problem } from "@prisma/client";
import { AI_MODEL, getAiClient } from "@/lib/ai/client";
import { gradeAnswerPrompt } from "@/lib/ai/prompts/grade-answer";
import { parseAiJson } from "@/lib/ai/helpers";
import { MISTAKE_TYPES, type GradeResult } from "@/types/learning";
import { parseJson } from "@/lib/json";
import { contradictoryDerivationGrade, gradeDeterministically, pendingDerivationGrade } from "@/lib/grading";

const schema = z.object({
  isCorrect: z.boolean(),
  score: z.number().min(0).max(100),
  mistakeType: z.enum(MISTAKE_TYPES),
  lawSelection: z.string(),
  correction: z.string(),
  explanation: z.string(),
  nextStep: z.string(),
});

export async function gradeAnswer(problem: Problem, userAnswer: string): Promise<GradeResult> {
  if (problem.answerKind !== "derivation") return gradeDeterministically(problem, userAnswer);
  const contradiction = contradictoryDerivationGrade(problem, userAnswer);
  if (contradiction) return contradiction;
  const client = getAiClient();
  if (!client) return pendingDerivationGrade(problem.topic);
  try {
    const rubric = {
      question: problem.questionText,
      conciseAnswer: problem.correctAnswer,
      solution: problem.solution,
      explanation: problem.explanation,
      requiredFormulas: parseJson<string[]>(problem.requiredFormulasJson, []),
      keyConcepts: parseJson<string[]>(problem.keyConceptsJson, []),
      commonMistakes: parseJson<string[]>(problem.commonMistakesJson, []),
      studentAnswer: userAnswer,
    };
    const response = await client.responses.create({
      model: AI_MODEL,
      store: false,
      input: `${gradeAnswerPrompt()}\n保存済み採点基準:\n${JSON.stringify(rubric)}`,
    });
    return { status: "completed", ...schema.parse(parseAiJson(response.output_text)) };
  } catch {
    return pendingDerivationGrade(problem.topic);
  }
}
