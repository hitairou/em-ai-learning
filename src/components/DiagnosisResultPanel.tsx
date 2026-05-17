"use client";

import type { DiagnosisResult, Question } from "@/types/learning";

export default function DiagnosisResultPanel({
  question,
  diagnosis,
  advice,
}: {
  question: Question;
  diagnosis: DiagnosisResult;
  advice: string;
}) {
  return (
    <section className="card">
      <h3 className="h3">診断結果</h3>

      <div className={diagnosis.isCorrect ? "resultOk" : "resultNg"}>
        <div className="resultLine">
          <span className="resultLabel">判定</span>
          <span className="resultValue">
            {diagnosis.isCorrect ? "正解" : "不正解"}
          </span>
        </div>
        <div className="resultLine">
          <span className="resultLabel">誤解タイプ</span>
          <span className="resultValue">{diagnosis.misconceptionType}</span>
        </div>
        <p className="resultText">{diagnosis.diagnosisText}</p>
      </div>

      <details className="details">
        <summary>解説を見る</summary>
        <p className="detailsBody">{question.explanation}</p>
      </details>

      <div className="advice">
        <h4 className="h4">学習アドバイス</h4>
        <pre className="adviceText">{advice}</pre>
      </div>
    </section>
  );
}

