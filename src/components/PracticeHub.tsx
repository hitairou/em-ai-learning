"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PracticeModeSelector from "@/components/PracticeModeSelector";
import RichMathText from "@/components/RichMathText";
import type { PracticeMode, ProblemView } from "@/types/learning";

export default function PracticeHub({ initialProblem }: { initialProblem: ProblemView | null }) {
  const [mode, setMode] = useState<PracticeMode>("foundation");
  const [problem, setProblem] = useState(initialProblem);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    setNotice("");
    const response = await fetch(`/api/practice/next?mode=${mode}`);
    const data = await response.json();
    if (response.ok) setProblem(data.problem);
    else {
      setProblem(null);
      setNotice(data.error ?? "問題を取得できませんでした");
    }
    setLoading(false);
  }

  return (
    <div className="stackLarge">
      <PracticeModeSelector value={mode} onChange={setMode} />
      <div className="practiceActions">
        <button type="button" className="button primaryButton" disabled={loading} onClick={load}>おすすめを選ぶ</button>
      </div>
      {notice && <p className="inlineNotice">{notice}</p>}
      {loading ? <div className="loadingCard">問題を選んでいます...</div> : problem ? (
        <article className="practicePreview">
          <div className="todayCardMeta"><span>{problem.unit}</span><span>難易度 {problem.difficulty}</span></div>
          <h2>{problem.title}</h2>
          <RichMathText text={problem.questionText} />
          <Link className="button primaryButton" href={`/practice/${problem.id}`}>解答画面へ <ArrowRight size={18} /></Link>
        </article>
      ) : <div className="emptyState">公開済みの演習問題がありません。</div>}
    </div>
  );
}
