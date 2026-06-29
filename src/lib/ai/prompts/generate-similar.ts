export function generateSimilarPrompt() {
  return `元問題と同じ学習構造を保ち、数値・配置・問い方を変えた電磁気の類題を1問作成してください。元問題の文章をコピーしないでください。
必ず次のJSONだけを返してください。
{"question":"類題本文","solution":"法則、途中式、単位を含む解説","difficulty":1から5,"topic":"単元"}`;
}
