import type { DiagnosisResult, MisconceptionType, Question } from "@/types/learning";
import { MISTAKE_LABELS } from "@/lib/constants";

export function diagnoseAnswer(question: Question, selectedChoiceId: string): DiagnosisResult {
  const selected = question.choices.find((choice) => choice.id === selectedChoiceId);
  const isCorrect = selectedChoiceId === question.correctChoiceId;
  const misconceptionType: MisconceptionType = isCorrect
    ? "correct"
    : selected?.misconceptionType ?? "concept_error";
  return {
    questionId: question.id,
    selectedChoiceId,
    correctChoiceId: question.correctChoiceId,
    isCorrect,
    misconceptionType,
    diagnosisText: isCorrect
      ? "正解です。法則と向きの確認手順も維持しましょう。"
      : `${MISTAKE_LABELS[misconceptionType]}を確認する必要があります。`,
  };
}
