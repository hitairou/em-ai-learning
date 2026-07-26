const electromagnetismPatterns = [
  /電磁気|電磁場|電磁波|静電|電場|電位|電荷|点電荷|電束|電気力線|クーロン|ガウス|誘電|分極|コンデンサ|静電容量|導体|接地|鏡像|電流|電流密度|抵抗|オーム|RC/,
  /磁場|磁束|磁束密度|ローレンツ|アンペール|ビオ.?サバール|ファラデー|レンツ|誘導起電力|インダクタンス|コイル|ソレノイド|トロイド|マクスウェル|変位電流|透磁率|磁性/,
  /\b(?:electric|electrostatic|electromagnetic|charge|coulomb|gauss|potential|voltage|capacitor|dielectric|conductor|current|resistance|magnetic|magnet|flux|lorentz|ampere|biot|savart|faraday|lenz|inductance|maxwell)\b/i,
  /\\(?:mathbf|vec)?\{?[EBHDVIQqJ]\}?|\\varepsilon|\\epsilon|\\mu_0|\\Phi|\\nabla|\\oint|\\cdot|\\times/,
  /\b(?:E|B|D|H|V|Q|q|I|J|C|R|L)\s*=/,
] as const;

const offTopicPatterns = [
  /料理|レシピ|献立|天気|旅行|ホテル|株価|投資|野球|サッカー|映画|音楽|小説|歴史|英作文|翻訳|プログラミング|コード|React|Next\.?js|Python|JavaScript|SQL/,
  /\b(?:recipe|weather|hotel|travel|stock|baseball|soccer|movie|music|novel|history|translate|programming|code|python|javascript|sql|react|nextjs)\b/i,
] as const;

const contextualFollowUpPatterns = [
  /この|ここ|それ|上の|前の|式|符号|単位|向き|法則|途中式|解き方|答え|解説|なぜ|どうして|どこ|計算|代入|積分|微分|境界条件|図/,
] as const;

export const ELECTROMAGNETISM_ONLY_MESSAGE = "電磁気学に関係する質問だけ受け付けます。電場・電位・電流・磁場・電磁誘導などに関する問題文や質問を入力してください。";

export function hasElectromagnetismSignal(text: string) {
  const normalized = text.normalize("NFKC");
  return electromagnetismPatterns.some((pattern) => pattern.test(normalized));
}

export function isClearlyOffTopic(text: string) {
  const normalized = text.normalize("NFKC");
  return offTopicPatterns.some((pattern) => pattern.test(normalized)) && !hasElectromagnetismSignal(normalized);
}

export function shouldAcceptInitialQuestion(text: string) {
  const normalized = text.normalize("NFKC").trim();
  return normalized.length > 0 && hasElectromagnetismSignal(normalized) && !isClearlyOffTopic(normalized);
}

export function shouldAcceptFollowUpQuestion(text: string) {
  const normalized = text.normalize("NFKC").trim();
  if (!normalized) return false;
  if (hasElectromagnetismSignal(normalized)) return true;
  if (isClearlyOffTopic(normalized)) return false;
  return contextualFollowUpPatterns.some((pattern) => pattern.test(normalized));
}
