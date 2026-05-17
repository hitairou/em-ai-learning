"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AnswerRecord, LearningScore } from "@/types/learning";
import { createEmptyLearningScore } from "@/lib/scoring";
import { readLocalStorageJson, writeLocalStorageJson } from "@/lib/storage";
import LearningScorePanel from "@/components/LearningScorePanel";

const STORAGE_KEYS = {
  score: "em_ai_learning_v1_score",
  answers: "em_ai_learning_v1_answers",
};

export default function ProgressClient() {
  const [score, setScore] = useState<LearningScore>(() => {
    return (
      readLocalStorageJson<LearningScore>(STORAGE_KEYS.score) ??
      createEmptyLearningScore()
    );
  });
  const [answers, setAnswers] = useState<AnswerRecord[]>(() => {
    return readLocalStorageJson<AnswerRecord[]>(STORAGE_KEYS.answers) ?? [];
  });

  const summary = useMemo(() => {
    const attempted = answers.length;
    const correct = answers.filter((a) => a.isCorrect).length;
    return { attempted, correct };
  }, [answers]);

  function handleReset() {
    const empty = createEmptyLearningScore();
    setScore(empty);
    setAnswers([]);
    writeLocalStorageJson(STORAGE_KEYS.score, empty);
    writeLocalStorageJson(STORAGE_KEYS.answers, []);
  }

  return (
    <div className="stack">
      <section className="card">
        <h1 className="titleSmall">理解度表示</h1>
        <p className="muted">
          分野別スコア（正答率）と、これまでの回答履歴の概要を表示します。
        </p>
        <div className="row">
          <Link className="buttonPrimary" href="/practice">
            問題演習へ
          </Link>
          <button
            className="buttonSecondary"
            type="button"
            onClick={handleReset}
          >
            学習データをリセット（ローカル）
          </button>
        </div>
      </section>

      <LearningScorePanel score={score} />

      <section className="card">
        <h3 className="h3">回答履歴（概要）</h3>
        <div className="stats">
          <div className="stat">
            <div className="statLabel">回答数</div>
            <div className="statValue">{summary.attempted}</div>
          </div>
          <div className="stat">
            <div className="statLabel">正解数</div>
            <div className="statValue">{summary.correct}</div>
          </div>
        </div>
        {answers.length === 0 ? (
          <p className="muted">
            まだ回答がありません。問題演習から始めてください。
          </p>
        ) : (
          <details className="details">
            <summary>履歴を一覧表示（最新20件）</summary>
            <ul className="history">
              {answers
                .slice(-20)
                .reverse()
                .map((a, idx) => (
                  <li key={`${a.answeredAt}-${idx}`} className="historyItem">
                    <span className="historyMain">
                      {a.questionId} / {a.isCorrect ? "正解" : "不正解"} /{" "}
                      {a.misconceptionType}
                    </span>
                    <span className="muted">
                      {new Date(a.answeredAt).toLocaleString()}
                    </span>
                  </li>
                ))}
            </ul>
          </details>
        )}
      </section>
    </div>
  );
}
