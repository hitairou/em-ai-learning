import "server-only";
import { z } from "zod";
import type { Problem } from "@prisma/client";
import { AI_MODEL, getAiClient } from "@/lib/ai/client";
import { gradeAnswerPrompt } from "@/lib/ai/prompts/grade-answer";
import { parseAiJson } from "@/lib/ai/helpers";
import { MISTAKE_TYPES, type GradeResult, type MisconceptionType } from "@/types/learning";
import { parseJson } from "@/lib/json";

const schema = z.object({
  isCorrect: z.boolean(),
  score: z.number().min(0).max(100),
  mistakeType: z.enum(MISTAKE_TYPES),
  lawSelection: z.string(),
  correction: z.string(),
  explanation: z.string(),
  nextStep: z.string(),
});

function normalize(value: string) {
  return value.toLowerCase().replace(/[\s　.,、。=＝]/g, "");
}

function fallback(problem: Problem, userAnswer: string): GradeResult {
  const choices = parseJson<Array<{ id: string; misconceptionType?: MisconceptionType }>>(
    problem.choicesJson,
    [],
  );
  const normalizedAnswer = normalize(userAnswer);
  const normalizedCorrect = normalize(problem.correctAnswer);
  const isCorrect =
    normalizedAnswer === normalizedCorrect ||
    (choices.length === 0 && normalizedAnswer.includes(normalizedCorrect));
  const selected = choices.find((item) => item.id === userAnswer);
  const mistakeType = isCorrect ? "correct" : selected?.misconceptionType ?? "concept_error";
  return {
    isCorrect,
    score: isCorrect ? 100 : 35,
    mistakeType,
    lawSelection: isCorrect ? "必要な法則を適切に使えています。" : `まず「${problem.topic}」で使う法則を明示してください。`,
    correction: isCorrect ? "修正はありません。" : `正答は「${problem.correctAnswer}」です。符号・向き・単位を順に照合してください。`,
    explanation: problem.explanation,
    nextStep: isCorrect ? "同じ構造の標準問題へ進みましょう。" : `${problem.topic}の基礎問題をもう1問解きましょう。`,
  };
}

export async function gradeAnswer(problem: Problem, userAnswer: string): Promise<GradeResult> {
  const client = getAiClient();
  if (!client) return fallback(problem, userAnswer);
  try {
    const response = await client.responses.create({
      model: AI_MODEL,
      input: `${gradeAnswerPrompt()}\n問題: ${problem.questionText}\n模範解答: ${problem.solution}\n学生解答: ${userAnswer}`,
    });
    return schema.parse(parseAiJson(response.output_text));
  } catch {
    return fallback(problem, userAnswer);
  }
}
