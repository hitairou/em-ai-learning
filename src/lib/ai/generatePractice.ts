import "server-only";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { AI_MODEL, getAiClient } from "@/lib/ai/client";
import { generatePracticePrompt } from "@/lib/ai/prompts/generate-practice";
import { MISTAKE_TYPES, type Course, type PracticeMode } from "@/types/learning";

const schema = z.object({
  title: z.string(),
  unit: z.string(),
  topic: z.string(),
  difficulty: z.number().int().min(1).max(5),
  questionText: z.string(),
  choices: z.array(z.object({ id: z.string(), text: z.string(), misconceptionType: z.enum(MISTAKE_TYPES) })),
  correctAnswer: z.string(),
  solution: z.string(),
  explanation: z.string(),
  requiredFormulas: z.array(z.string()),
  commonMistakes: z.array(z.string()),
});

export type GeneratedPractice = z.infer<typeof schema>;
export type PracticeGenerationResult =
  | { status: "generated"; problem: GeneratedPractice }
  | { status: "not_configured" }
  | { status: "failed" };

export async function generatePractice(input: {
  course: Course;
  mode: PracticeMode;
  weakTopics: string[];
}): Promise<PracticeGenerationResult> {
  const client = getAiClient();
  if (!client) return { status: "not_configured" };
  try {
    const response = await client.responses.parse({
      model: AI_MODEL,
      input: `${generatePracticePrompt()}\n科目:${input.course}\nモード:${input.mode}\n苦手単元:${input.weakTopics.join("、")}`,
      text: { format: zodTextFormat(schema, "generated_practice") },
    });
    if (!response.output_parsed) return { status: "failed" };
    return { status: "generated", problem: response.output_parsed };
  } catch (error) {
    console.error("OpenAI practice generation failed", error instanceof Error ? error.message : error);
    return { status: "failed" };
  }
}
