"use client";

import type { LearningScore } from "@/types/learning";

const LABELS: Record<keyof LearningScore, string> = {
  field_direction: "電場の向き",
  field_vs_potential: "電場と電位の違い",
  distance_dependence: "距離依存性",
  equipotential_relation: "等電位面",
  vector_scalar: "ベクトル量とスカラー量",
};

export default function LearningScorePanel({
  score,
}: {
  score: LearningScore;
}) {
  return (
    <section className="card">
      <h3 className="h3">理解度（分野別スコア）</h3>
      <div className="scoreGrid">
        {Object.entries(score).map(([key, domain]) => {
          const label = LABELS[key as keyof LearningScore];
          return (
            <div key={key} className="scoreRow">
              <div className="scoreLabel">{label}</div>
              <div className="scoreBar">
                <div
                  className="scoreBarFill"
                  style={{ width: `${domain.score}%` }}
                />
              </div>
              <div className="scoreValue">
                {domain.score}%{" "}
                <span className="muted">
                  ({domain.correct}/{domain.attempted})
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="muted">
        スコアは「正答率（正解/回答）」を0〜100で表示しています（ローカル保存）。
      </p>
    </section>
  );
}

