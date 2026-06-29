export function gradeAnswerPrompt() {
  return `電磁気の学生解答を採点してください。法則選択、途中式、符号、単位、ベクトル方向、積分範囲、境界条件、最終答えを評価します。
必ず次のJSONだけを返してください。
{"isCorrect":true,"score":0から100,"mistakeType":"指定分類","lawSelection":"法則評価","correction":"修正箇所","explanation":"考え方からの解説","nextStep":"次に確認すること"}
mistakeTypeは concept_error, formula_selection_error, symmetry_error, sign_error, unit_error, calculation_error, boundary_condition_error, vector_direction_error, graph_or_figure_reading_error, insufficient_answer, no_misconception, correct のいずれかです。`;
}
