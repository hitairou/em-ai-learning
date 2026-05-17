import type {
  DiagnosisResult,
  MisconceptionType,
  Question,
} from "@/types/learning";

const MISCONCEPTION_MESSAGES: Record<MisconceptionType, string> = {
  field_potential_confusion:
    "電場と電位の関係（E = −∇V）を混同している可能性があります。",
  vector_scalar_confusion:
    "ベクトル量とスカラー量の区別が曖昧になっている可能性があります。",
  charge_direction_confusion:
    "正電荷・負電荷による電場の向きの理解に誤りがある可能性があります。",
  distance_dependence_confusion:
    "距離依存性（1/r と 1/r²）の対応を取り違えている可能性があります。",
  equipotential_field_relation_confusion:
    "等電位面と電場の関係（直交）を誤解している可能性があります。",
  no_misconception: "特に誤解は見られません（この設問では理解できています）。",
};

export function diagnoseAnswer(
  question: Question,
  selectedChoiceId: string
): DiagnosisResult {
  const selected = question.choices.find((c) => c.id === selectedChoiceId);
  const isCorrect = selectedChoiceId === question.correctChoiceId;

  const misconceptionType: MisconceptionType = isCorrect
    ? "no_misconception"
    : (selected?.misconceptionType ?? "field_potential_confusion");

  const diagnosisText = isCorrect
    ? "正解です。良い理解ができています。"
    : MISCONCEPTION_MESSAGES[misconceptionType];

  return {
    questionId: question.id,
    selectedChoiceId,
    correctChoiceId: question.correctChoiceId,
    isCorrect,
    misconceptionType,
    diagnosisText,
  };
}

