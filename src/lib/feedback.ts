import type { DiagnosisResult, MisconceptionType, Question } from "@/types/learning";

const ADVICE_TEMPLATES: Record<MisconceptionType, (q: Question) => string> = {
  no_misconception: () =>
    [
      "この設問は理解できています。",
      "次の設問でも「定義 → 関係式 → 物理的意味」の順で確認していきましょう。",
    ].join("\n"),
  field_potential_confusion: (q) =>
    [
      "電場 E と電位 V は別の量です（E はベクトル、V はスカラー）。",
      "ポイント：E = −∇V（電位が最も下がる方向に電場が向く）。",
      `復習メモ：${q.explanation}`,
    ].join("\n"),
  vector_scalar_confusion: () =>
    [
      "ベクトル量は「大きさ＋向き」、スカラー量は「大きさ（符号）だけ」です。",
      "例：電場 E・力 F はベクトル、電位 V・電荷 Q・仕事 W はスカラー。",
      "まずは表にして分類し、次に式の中で“どれが向きを持つか”を意識しましょう。",
    ].join("\n"),
  charge_direction_confusion: () =>
    [
      "電場の向きは「正の試験電荷が受ける力の向き」です。",
      "正電荷：外向き、負電荷：内向き。",
      "図を描いて放射状の向きを確認すると定着しやすいです。",
    ].join("\n"),
  distance_dependence_confusion: () =>
    [
      "点電荷では、電位 V ∝ 1/r、電場 |E| ∝ 1/r² です。",
      "E は電位の空間変化（勾配）なので、距離依存が1段強くなります。",
      "1つの式だけ暗記せず、V→E の関係（微分）でつなげて覚えましょう。",
    ].join("\n"),
  equipotential_field_relation_confusion: () =>
    [
      "等電位面上では電位が変化しないため、接線方向の電場成分は0です。",
      "したがって電場は等電位面に垂直（法線方向）になります。",
      "等電位線（面）を描いたら、必ず“直交する矢印”として電場を描く練習をしましょう。",
    ].join("\n"),
};

export function generateLearningAdvice(
  diagnosis: DiagnosisResult,
  question: Question
): string {
  const template = ADVICE_TEMPLATES[diagnosis.misconceptionType];
  return template(question);
}

