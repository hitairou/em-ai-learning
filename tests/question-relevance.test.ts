import assert from "node:assert/strict";
import test from "node:test";
import {
  hasElectromagnetismSignal,
  isClearlyOffTopic,
  shouldAcceptFollowUpQuestion,
  shouldAcceptInitialQuestion,
} from "../src/lib/question-relevance";

test("detects electromagnetism questions before AI analysis", () => {
  assert.equal(shouldAcceptInitialQuestion("点電荷 Q が作る電場 E をガウスの法則で求めたい"), true);
  assert.equal(shouldAcceptInitialQuestion("コイルを貫く磁束が変化するときの誘導起電力を求めよ"), true);
  assert.equal(hasElectromagnetismSignal("\\(E = Q/(4\\pi\\varepsilon_0 r^2)\\)"), true);
});

test("rejects clearly unrelated initial questions", () => {
  assert.equal(shouldAcceptInitialQuestion("今日の夕飯のレシピを教えてください"), false);
  assert.equal(shouldAcceptInitialQuestion("React の useEffect の使い方を説明して"), false);
  assert.equal(isClearlyOffTopic("PythonでCSVを読むコードを書いて"), true);
});

test("allows contextual follow-up but rejects unrelated follow-up", () => {
  assert.equal(shouldAcceptFollowUpQuestion("この式のマイナス符号はなぜですか"), true);
  assert.equal(shouldAcceptFollowUpQuestion("単位はどこで確認すればよいですか"), true);
  assert.equal(shouldAcceptFollowUpQuestion("明日の天気を教えて"), false);
});
