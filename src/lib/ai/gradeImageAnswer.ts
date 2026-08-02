import "server-only";
import { z } from "zod";
import type { Problem } from "@prisma/client";
import { AI_MODEL, getAiClient } from "@/lib/ai/client";
import { parseAiJson } from "@/lib/ai/helpers";
import { parseJson } from "@/lib/json";
import { pendingDerivationGrade } from "@/lib/grading";
import { MISTAKE_TYPES, type GradeResult } from "@/types/learning";

const schema = z.object({
  isCorrect: z.boolean(),
  score: z.number().min(0).max(100),
  mistakeType: z.enum(MISTAKE_TYPES),
  lawSelection: z.string(),
  correction: z.string(),
  explanation: z.string(),
  nextStep: z.string(),
});

export async function gradeImageAnswer(problem: Problem, image: File, note?: string): Promise<GradeResult> {
  const client = getAiClient();
  if (!client) return pendingDerivationGrade(problem.topic);
  try {
    const bytes = Buffer.from(await image.arrayBuffer());
    const imageUrl = `data:${image.type || "image/jpeg"};base64,${bytes.toString("base64")}`;
    const rubric = {
      question: problem.questionText,
      answerKind: problem.answerKind,
      conciseAnswer: problem.correctAnswer,
      solution: problem.solution,
      explanation: problem.explanation,
      requiredFormulas: parseJson<string[]>(problem.requiredFormulasJson, []),
      keyConcepts: parseJson<string[]>(problem.keyConceptsJson, []),
      commonMistakes: parseJson<string[]>(problem.commonMistakesJson, []),
      learnerNote: note ?? "",
    };
    const response = await client.responses.create({
      model: AI_MODEL,
      store: false,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                "手書き画像の回答を採点してください。",
                "画像内の回答を読んだうえで、保存済み採点基準に照らして判定します。",
                "JSONのみを返してください。形式:",
                '{"isCorrect":true,"score":0から100,"mistakeType":"指定分類","lawSelection":"法則評価","correction":"修正箇所","explanation":"考え方からの解説","nextStep":"次に確認すること"}',
                `指定分類:${MISTAKE_TYPES.join(",")}`,
                `保存済み採点基準:${JSON.stringify(rubric)}`,
              ].join("\n"),
            },
            { type: "input_image", image_url: imageUrl, detail: "auto" },
          ],
        },
      ],
    });
    return { status: "completed", ...schema.parse(parseAiJson(response.output_text)) };
  } catch {
    return pendingDerivationGrade(problem.topic);
  }
}
