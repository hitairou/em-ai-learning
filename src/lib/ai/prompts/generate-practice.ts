export function generatePracticePrompt() {
  return `大学レベルの電磁気学1・2を学ぶ利用者向けに、過去問をコピーせず新しい演習を1問作成してください。答えより法則選択と考え方を重視します。
必ず次のJSONだけを返してください。
{"title":"題名","unit":"大単元","topic":"小単元","difficulty":1から5,"questionText":"問題文","choices":[{"id":"a","text":"選択肢","misconceptionType":"誤答分類"}],"correctAnswer":"正答","solution":"途中式を含む解答","explanation":"考え方","requiredFormulas":["公式"],"commonMistakes":["ミス"]}`;
}
