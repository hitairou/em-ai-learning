import "server-only";
import { z } from "zod";
import type { Problem } from "@prisma/client";
import { AI_MODEL, getAiClient } from "@/lib/ai/client";
import { gradeAnswerPrompt } from "@/lib/ai/prompts/grade-answer";
import { parseAiJson } from "@/lib/ai/helpers";
import { MISTAKE_TYPES, type GradeResult } from "@/types/learning";
import { parseJson } from "@/lib/json";
import { finalNumericAnswerMatches, gradeDeterministically, pendingDerivationGrade } from "@/lib/grading";

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
  if (problem.answerKind === "choice") throw new Error("Choice answers must use deterministic grading.");
  if (problem.answerKind === "numeric") {
    const numericGrade = gradeDeterministically(problem, userAnswer);
    if (numericGrade.isCorrect) return numericGrade;
  }
  const client = getAiClient();
  if (!client) return pendingDerivationGrade(problem.topic);
  try {
    const rubric = {
      question: problem.questionText,
      answerKind: problem.answerKind,
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
    const aiGrade = schema.parse(parseAiJson(response.output_text));
    if (!aiGrade.isCorrect && ["calculation_error", "unit_error"].includes(aiGrade.mistakeType) && finalNumericAnswerMatches(problem, userAnswer)) {
      return {
        status: "completed",
        isCorrect: true,
        score: 100,
        mistakeType: "correct",
        lawSelection: aiGrade.lawSelection,
        correction: "数値は丸め誤差の範囲内です。正答として扱います。",
        explanation: aiGrade.explanation,
        nextStep: aiGrade.nextStep,
      };
    }
    return { status: "completed", ...aiGrade };
  } catch {
    return pendingDerivationGrade(problem.topic);
  }
}
