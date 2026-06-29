import "server-only";
import { z } from "zod";
import { AI_MODEL, getAiClient } from "@/lib/ai/client";
import { generatePracticePrompt } from "@/lib/ai/prompts/generate-practice";
import { parseAiJson } from "@/lib/ai/helpers";
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

export async function generatePractice(input: {
  course: Course;
  mode: PracticeMode;
  weakTopics: string[];
}): Promise<GeneratedPractice | null> {
  const client = getAiClient();
  if (!client) return null;
  try {
    const response = await client.responses.create({
      model: AI_MODEL,
      input: `${generatePracticePrompt()}\n科目:${input.course}\nモード:${input.mode}\n苦手単元:${input.weakTopics.join("、")}`,
    });
    return schema.parse(parseAiJson(response.output_text));
  } catch {
    return null;
  }
}
