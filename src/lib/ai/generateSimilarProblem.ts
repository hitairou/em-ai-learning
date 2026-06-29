import "server-only";
import { z } from "zod";
import type { Problem } from "@prisma/client";
import { AI_MODEL, getAiClient } from "@/lib/ai/client";
import { generateSimilarPrompt } from "@/lib/ai/prompts/generate-similar";
import { parseAiJson } from "@/lib/ai/helpers";

const schema = z.object({
  question: z.string(),
  solution: z.string(),
  difficulty: z.number().int().min(1).max(5),
  topic: z.string(),
});

export async function generateSimilarProblem(problem: Problem) {
  const client = getAiClient();
  if (client) {
    try {
      const response = await client.responses.create({
        model: AI_MODEL,
        input: `${generateSimilarPrompt()}\n元問題:${problem.questionText}\n元解答:${problem.solution}`,
      });
      return schema.parse(parseAiJson(response.output_text));
    } catch {
      // Use the deterministic variant below.
    }
  }
  return {
    question: `${problem.questionText}\n条件を一つ変えた場合について、使う法則と解法の流れも説明してください。`,
    solution: `${problem.explanation}\nまず条件差を整理し、${problem.topic}の定義式へ反映します。最後に単位と向きを確認します。`,
    difficulty: Math.min(5, problem.difficulty + 1),
    topic: problem.topic,
  };
}
