"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DiagnosticQuestionCard from "@/components/DiagnosticQuestionCard";
import type { ProblemView } from "@/types/learning";

export default function DiagnosticClient({ questions }: { questions: ProblemView[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<{ problemId: string; selectedChoice: string; answerTimeSec: number }>>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const startedAt = useRef(new Date());
  const questionStartedAt = useRef(0);
  const question = questions[index];

  useEffect(() => {
    questionStartedAt.current = Date.now();
  }, []);

  if (!question) return <div className="emptyState">診断問題がありません。管理者に問題seedを確認してください。</div>;

  async function next() {
    if (!selected) return;
    const nextAnswers = [...answers, {
      problemId: question.id,
      selectedChoice: selected,
      answerTimeSec: Math.max(1, Math.round((Date.now() - questionStartedAt.current) / 1000)),
    }];
    if (index < questions.length - 1) {
      setAnswers(nextAnswers);
      setSelected(null);
      setIndex((value) => value + 1);
      questionStartedAt.current = Date.now();
      return;
    }
    setSubmitting(true);
    const response = await fetch("/api/diagnostic/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startedAt: startedAt.current.toISOString(), answers: nextAnswers }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "診断結果を保存できませんでした");
      setSubmitting(false);
      return;
    }
    router.push("/onboarding/result");
    router.refresh();
  }

  return (
    <div className="diagnosticLayout">
      <div className="diagnosticProgress" aria-label={`${index + 1}/${questions.length}問`}>
        <span style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
      </div>
      <div className="progressLabel">QUESTION {index + 1} / {questions.length}</div>
      <DiagnosticQuestionCard problem={question} selected={selected} onSelect={setSelected} />
      {error && <p className="formError">{error}</p>}
      <button className="button primaryButton fullButton" disabled={!selected || submitting} onClick={next} type="button">
        {submitting ? "採点中..." : index === questions.length - 1 ? "診断結果を見る" : "次の問題"}
      </button>
    </div>
  );
}
