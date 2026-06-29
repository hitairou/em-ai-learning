import "server-only";

export function parseAiJson<T>(text: string): T {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned) as T;
}

export function detectElectromagnetismTopic(text: string) {
  const rules = [
    ["マクスウェル", "マクスウェル方程式", "em2"],
    ["誘導|磁束|ファラデー|レンツ", "電磁誘導", "em2"],
    ["インダクタンス|コイル", "インダクタンス", "em2"],
    ["磁場|磁束密度|ローレンツ|アンペール|ビオ", "静磁場", "em2"],
    ["コンデンサ|誘電", "誘電体", "em1"],
    ["ガウス", "ガウスの法則", "em1"],
    ["電位", "電位", "em1"],
    ["電流|抵抗|オーム|RC", "電流・回路", "em1"],
  ] as const;
  const match = rules.find(([pattern]) => new RegExp(pattern, "i").test(text));
  return { topic: match?.[1] ?? "静電場", course: (match?.[2] ?? "em1") as "em1" | "em2" };
}
