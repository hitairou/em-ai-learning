"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AnswerInput from "@/components/AnswerInput";
import AiFeedbackPanel from "@/components/AiFeedbackPanel";
import type { GradeResult, ProblemView } from "@/types/learning";

type Result = { grade: GradeResult; solution: string; similar: { question: string; solution: string }; skillScore: number };

export default function PracticeQuestionCard({ problem }: { problem: ProblemView }) {
  const [answer, setAnswer] = useState("");
  const [hints, setHints] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function submit() {
    setSubmitting(true);
    setError("");
    const response = await fetch("/api/practice/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId: problem.id,
        userAnswer: answer,
        answerTimeSec: Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)),
        hintUsedCount: hints,
      }),
    });
    const data = await response.json();
    if (!response.ok) setError(data.error ?? "採点できませんでした");
    else setResult(data);
    setSubmitting(false);
  }

  return (
    <div className="stackLarge">
      <article className="questionCard practiceQuestion"><div className="todayCardMeta"><span>{problem.unit} / {problem.topic}</span><span>難易度 {problem.difficulty}</span></div><h1>{problem.title}</h1><p className="questionBody">{problem.questionText}</p><AnswerInput choices={problem.choices} value={answer} onChange={setAnswer} />
        {!result && <div className="answerActions"><button type="button" className="hintButton" onClick={() => setHints((value) => value + 1)}>ヒントを見る（{hints}回）</button><button type="button" className="button primaryButton" disabled={!answer.trim() || submitting} onClick={submit}>{submitting ? "採点中..." : "回答を提出"}</button></div>}
        {hints > 0 && !result && <p className="hintBox">まず「{problem.topic}」で使う法則を1つ書き、求める量の単位を確認しましょう。</p>}
        {error && <p className="formError">{error}</p>}
      </article>
      {result && <><AiFeedbackPanel grade={result.grade} solution={result.solution} similar={result.similar} /><div className="practiceFooter"><span>この単元の到達度: <strong>{result.skillScore}%</strong></span><Link className="button primaryButton" href="/practice">次の問題を選ぶ</Link></div></>}
    </div>
  );
}
