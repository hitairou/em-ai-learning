"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { QUESTIONS } from "@/data/questions";
import type {
  AnswerRecord,
  DiagnosisResult,
  LearningScore,
  Question,
} from "@/types/learning";
import { diagnoseAnswer } from "@/lib/diagnosis";
import { generateLearningAdvice } from "@/lib/feedback";
import {
  createEmptyLearningScore,
  updateLearningScoreWithQuestion,
} from "@/lib/scoring";
import { readLocalStorageJson, writeLocalStorageJson } from "@/lib/storage";
import QuestionViewer from "@/components/QuestionViewer";
import DiagnosisResultPanel from "@/components/DiagnosisResultPanel";
import LearningScorePanel from "@/components/LearningScorePanel";

const STORAGE_KEYS = {
  score: "em_ai_learning_v1_score",
  answers: "em_ai_learning_v1_answers",
};

function getQuestionByIndex(index: number): Question {
  return QUESTIONS[Math.max(0, Math.min(QUESTIONS.length - 1, index))]!;
}

export default function PracticeClient() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [advice, setAdvice] = useState<string>("");
  const [score, setScore] = useState<LearningScore>(() => {
    return (
      readLocalStorageJson<LearningScore>(STORAGE_KEYS.score) ??
      createEmptyLearningScore()
    );
  });

  const question = useMemo(
    () => getQuestionByIndex(currentIndex),
    [currentIndex]
  );

  const isLast = currentIndex >= QUESTIONS.length - 1;

  function handleSubmit() {
    if (!selectedChoiceId) return;

    const d = diagnoseAnswer(question, selectedChoiceId);
    const a = generateLearningAdvice(d, question);

    setDiagnosis(d);
    setAdvice(a);

    setScore((prev) => {
      const next = updateLearningScoreWithQuestion(prev, question, d.isCorrect);
      writeLocalStorageJson(STORAGE_KEYS.score, next);
      return next;
    });

    const record: AnswerRecord = {
      questionId: question.id,
      selectedChoiceId,
      isCorrect: d.isCorrect,
      misconceptionType: d.misconceptionType,
      answeredAt: new Date().toISOString(),
    };

    const existing =
      readLocalStorageJson<AnswerRecord[]>(STORAGE_KEYS.answers) ?? [];
    writeLocalStorageJson(STORAGE_KEYS.answers, [...existing, record]);
  }

  function handleNext() {
    setDiagnosis(null);
    setAdvice("");
    setSelectedChoiceId(null);
    setCurrentIndex((i) => Math.min(QUESTIONS.length - 1, i + 1));
  }

  function handleRestart() {
    setDiagnosis(null);
    setAdvice("");
    setSelectedChoiceId(null);
    setCurrentIndex(0);
  }

  return (
    <div className="stack">
      <section className="card">
        <div className="practiceHeader">
          <h1 className="titleSmall">問題演習（静電界）</h1>
          <div className="muted">
            {currentIndex + 1} / {QUESTIONS.length}
          </div>
        </div>
        <p className="muted">
          1問ずつ回答し、誤解タイプと学習アドバイスを確認できます。
        </p>
      </section>

      <QuestionViewer
        question={question}
        selectedChoiceId={selectedChoiceId}
        onSelect={(choice) => setSelectedChoiceId(choice.id)}
      />

      <section className="card">
        <div className="row">
          <button
            className="buttonPrimary"
            type="button"
            onClick={handleSubmit}
            disabled={!selectedChoiceId || !!diagnosis}
          >
            回答する
          </button>
          <button
            className="buttonSecondary"
            type="button"
            onClick={handleRestart}
          >
            最初から
          </button>
          <Link className="buttonLink" href="/progress">
            理解度を見る →
          </Link>
        </div>
        {!selectedChoiceId && (
          <p className="muted">
            選択肢をクリックしてから「回答する」を押してください。
          </p>
        )}
      </section>

      {diagnosis && (
        <>
          <DiagnosisResultPanel
            question={question}
            diagnosis={diagnosis}
            advice={advice}
          />

          <section className="card">
            <div className="row">
              <button
                className="buttonPrimary"
                type="button"
                onClick={handleNext}
                disabled={isLast}
              >
                次の問題へ
              </button>
              {isLast && (
                <span className="muted">
                  最後の問題です。理解度ページで結果を確認しましょう。
                </span>
              )}
            </div>
          </section>
        </>
      )}

      <LearningScorePanel score={score} />
    </div>
  );
}
