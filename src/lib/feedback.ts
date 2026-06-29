import type { DiagnosisResult, Question } from "@/types/learning";
import { MISTAKE_LABELS } from "@/lib/constants";

export function generateLearningAdvice(diagnosis: DiagnosisResult, question: Question): string {
  if (diagnosis.isCorrect) {
    return `使った法則を言葉で説明し、単位まで確認できれば十分です。\n${question.explanation}`;
  }
  return [
    `今回の主な原因: ${MISTAKE_LABELS[diagnosis.misconceptionType]}`,
    "既知量と求める量を分け、使う法則を先に書いてください。",
    "符号・ベクトル方向・単位を最後に一つずつ照合してください。",
    `復習: ${question.explanation}`,
  ].join("\n");
}
