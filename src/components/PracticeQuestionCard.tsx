"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Camera } from "lucide-react";
import AnswerInput from "@/components/AnswerInput";
import AiFeedbackPanel from "@/components/AiFeedbackPanel";
import RichMathText from "@/components/RichMathText";
import type { GradeResult, ProblemView } from "@/types/learning";

type Result = {
  grade: GradeResult;
  correctAnswer?: string;
  solution?: string;
  explanation?: string;
  similar?: ProblemView | null;
  skillScore?: number;
  diagnosticScore?: number | null;
  retryable?: boolean;
};

const MAX_HINTS = 5;

export default function PracticeQuestionCard({ problem }: { problem: ProblemView }) {
  const [answer, setAnswer] = useState("");
  const [hints, setHints] = useState(0);
  const [hintTexts, setHintTexts] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [answerImage, setAnswerImage] = useState<File | null>(null);
  const startedAt = useRef(0);

  useEffect(() => { startedAt.current = Date.now(); }, []);

  async function submit() {
    setSubmitting(true);
    setError("");
    const answerTimeSec = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
    const response = answerImage
      ? await fetch("/api/practice/submit", {
        method: "POST",
        body: (() => {
          const form = new FormData();
          form.append("problemId", problem.id);
          form.append("userAnswer", answer.trim() || "画像回答");
          form.append("answerTimeSec", String(answerTimeSec));
          form.append("hintUsedCount", String(hints));
          form.append("answerImage", answerImage);
          return form;
        })(),
      })
      : await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          userAnswer: answer,
          answerTimeSec,
          hintUsedCount: hints,
        }),
      });
    const data = await response.json();
    if (!response.ok) setError(data.error ?? "採点できませんでした");
    else setResult(data);
    setSubmitting(false);
  }

  async function showHint() {
    if (hintLoading || hints >= MAX_HINTS) return;
    const nextHintNumber = hints + 1;
    setHints(nextHintNumber);
    if (nextHintNumber === 1) {
      setHintTexts([`まず「${problem.topic}」で使う法則を1つ書き、求める量の単位を確認しましょう。`]);
      return;
    }
    setHintLoading(true);
    const response = await fetch("/api/practice/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemId: problem.id, userAnswer: answer, hintNumber: nextHintNumber }),
    });
    const data = await response.json().catch(() => ({}));
    setHintTexts((current) => [...current, response.ok ? data.hint ?? "別の観点から条件を見直しましょう。" : data.error ?? "ヒントを取得できませんでした。"]);
    setHintLoading(false);
  }

  return (
    <div className="stackLarge">
      <article className="questionCard practiceQuestion">
        <div className="todayCardMeta"><span>{problem.unit} / {problem.topic}</span><span>難易度 {problem.difficulty}</span></div>
        <h1>{problem.title}</h1>
        <RichMathText className="questionBody" text={problem.questionText} />
        <AnswerInput choices={problem.choices} value={answer} onChange={setAnswer} />
        {!problem.choices.length && !result && (
          <label className="answerImageUpload">
            <Camera size={18} />
            <span><strong>{answerImage ? answerImage.name : "手書きノートの写真を回答にする"}</strong><small>画像をそのまま回答として提出します。補足があれば上の欄に書けます。</small></span>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setAnswerImage(event.target.files?.[0] ?? null)} />
          </label>
        )}
        {(!result || result.retryable) && (
          <div className="answerActions">
            <button type="button" className="hintButton" disabled={hintLoading || hints >= MAX_HINTS} onClick={showHint}>{hintLoading ? "ヒント生成中..." : hints >= MAX_HINTS ? `ヒントは${MAX_HINTS}回まで` : `ヒントを見る（${hints}回）`}</button>
            <button type="button" className="button primaryButton" disabled={(!answer.trim() && !answerImage) || submitting} onClick={submit}>
              {submitting ? "採点中..." : result?.retryable ? "AI採点を再試行" : "回答を提出"}
            </button>
          </div>
        )}
        {hintTexts.length > 0 && !result && <div className="hintBox">{hintTexts.map((hint, index) => <p key={`${index}-${hint}`}><strong>ヒント{index + 1}</strong>{hint}</p>)}</div>}
        {error && <p className="formError">{error}</p>}
      </article>
      {result && (
        <>
          <AiFeedbackPanel
            grade={result.grade}
            correctAnswer={result.correctAnswer}
            solution={result.solution}
            explanation={result.explanation}
            similar={result.similar}
          />
          {result.skillScore !== undefined && (
            <div className="practiceFooter">
              <span>この単元の到達度: <strong>{result.skillScore}%</strong></span>
              {result.diagnosticScore !== undefined && result.diagnosticScore !== null && <span>総合診断スコア: <strong>{result.diagnosticScore}</strong>/100</span>}
              <Link className="button primaryButton" href="/practice">問題選択へ戻る</Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
