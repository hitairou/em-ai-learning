import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { AI_MODEL, getAiClient } from "@/lib/ai/client";
import { analyzeQuestionPrompt } from "@/lib/ai/prompts/analyze-question";
import { detectElectromagnetismTopic, parseAiJson } from "@/lib/ai/helpers";
import type { Course, QuestionAnalysis } from "@/types/learning";

const schema = z.object({
  extractedText: z.string(),
  course: z.enum(["em1", "em2"]),
  topic: z.string(),
  laws: z.array(z.string()),
  approach: z.string(),
  steps: z.array(z.string()),
  finalAnswer: z.string(),
  commonMistakes: z.array(z.string()),
  similarQuestion: z.string(),
  similarSolution: z.string(),
});

function fallback(text: string, selectedCourse: Course): QuestionAnalysis {
  const detected = detectElectromagnetismTopic(text);
  const course = detected.course ?? selectedCourse;
  const topic = detected.topic;
  return {
    extractedText: text || "画像から問題文を読み取れませんでした。問題文をテキストで追加してください。",
    course,
    topic,
    laws: topic.includes("磁") ? ["右手則と対象単元の積分法則"] : ["定義式と対称性の確認"],
    approach: "既知量と求める量を分け、向きと単位を図に書き込んでから使う法則を選びます。",
    steps: [
      "座標軸、電荷または電流の向き、既知量を整理する",
      "対称性と境界条件を確認して法則を選ぶ",
      "符号・積分範囲を保ったまま式を立てる",
      "最後に次元とベクトル方向を確認する",
    ],
    finalAnswer: "問題文の数値・図の条件を確認して上の手順に代入してください。",
    commonMistakes: ["向きを決める前にスカラー式へ代入する", "単位と符号の確認を省く"],
    similarQuestion: `${topic}について、条件を一つ変えた場合に使う法則と解法方針を説明してください。`,
    similarSolution: "対称性、法則、式、向き、単位の順で確認します。",
  };
}

export async function analyzeQuestion(input: {
  text: string;
  selectedCourse: Course;
  imagePath?: string | null;
  learnerContext?: string;
}): Promise<QuestionAnalysis> {
  const client = getAiClient();
  if (!client) return fallback(input.text, input.selectedCourse);

  try {
    const content: Array<
      | { type: "input_text"; text: string }
      | { type: "input_image"; image_url: string; detail: "auto" }
    > = [
      { type: "input_text", text: `${analyzeQuestionPrompt(input.learnerContext ?? "履歴なし")}\n\n入力内容:\n${input.text}` },
    ];
    if (input.imagePath) {
      const bytes = await fs.readFile(input.imagePath);
      const extension = path.extname(input.imagePath).toLowerCase().replace(".jpg", ".jpeg");
      content.push({
        type: "input_image",
        image_url: `data:image/${extension.slice(1)};base64,${bytes.toString("base64")}`,
        detail: "auto",
      });
    }
    const response = await client.responses.create({
      model: AI_MODEL,
      input: [{ role: "user", content }],
    });
    return schema.parse(parseAiJson(response.output_text));
  } catch {
    return fallback(input.text, input.selectedCourse);
  }
}
