import "server-only";
import type { Problem } from "@prisma/client";
import { AI_MODEL, getAiClient } from "@/lib/ai/client";

function fallbackHint(problem: Problem, hintNumber: number) {
  if (hintNumber <= 2) return `求める量を1つに決めて、「${problem.topic}」で使う基本式の左辺と右辺を対応させましょう。`;
  if (hintNumber === 3) return `対称性、向き、符号、単位のうち、まだ確認していないものを1つだけ見直しましょう。`;
  return "途中式の各項が何を表すかを言葉で確認し、不要な仮定を置いていないか見直しましょう。";
}

export async function generateHint(input: { problem: Problem; userAnswer?: string; hintNumber: number }) {
  const client = getAiClient();
  if (!client) return fallbackHint(input.problem, input.hintNumber);
  try {
    const response = await client.responses.create({
      model: AI_MODEL,
      input: [
        "あなたは電磁気学の演習問題の家庭教師です。",
        "答えや途中式の結論は直接出さず、学習者が次に確認すべき観点だけを日本語で1文、50字以内で返してください。",
        `ヒント回数:${input.hintNumber}`,
        `単元:${input.problem.unit} / ${input.problem.topic}`,
        `問題:${input.problem.questionText}`,
        `学習者の現在の回答:${input.userAnswer?.trim() || "未入力"}`,
      ].join("\n"),
    });
    const hint = response.output_text.trim().replace(/\s+/g, " ");
    return hint.slice(0, 90) || fallbackHint(input.problem, input.hintNumber);
  } catch {
    return fallbackHint(input.problem, input.hintNumber);
  }
}
