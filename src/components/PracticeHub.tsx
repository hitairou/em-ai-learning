"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import PracticeModeSelector from "@/components/PracticeModeSelector";
import type { PracticeMode, ProblemView } from "@/types/learning";

export default function PracticeHub({ initialProblem }: { initialProblem: ProblemView | null }) {
  const [mode, setMode] = useState<PracticeMode>("foundation");
  const [problem, setProblem] = useState(initialProblem);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  async function load(generate = false) {
    setLoading(true);
    setNotice("");
    const response = await fetch(`/api/practice/next?mode=${mode}${generate ? "&generate=1" : ""}`);
    const data = await response.json();
    if (response.ok) {
      setProblem(data.problem);
      if (generate && data.source !== "ai") {
        setNotice(data.aiStatus === "not_configured"
          ? "AIキー未設定のため、問題DBから苦手に合う問題を選びました。"
          : "AI問題の生成に失敗したため、問題DBから苦手に合う問題を選びました。");
      }
    } else setNotice(data.error ?? "問題を取得できませんでした");
    setLoading(false);
  }

  return (
    <div className="stackLarge">
      <PracticeModeSelector value={mode} onChange={setMode} />
      <div className="practiceActions"><button type="button" className="button secondaryButton" disabled={loading} onClick={() => load(false)}>おすすめを選ぶ</button><button type="button" className="button accentButton" disabled={loading} onClick={() => load(true)}><Sparkles size={17} /> AIで新しく作る</button></div>
      {notice && <p className="inlineNotice">{notice}</p>}
      {loading ? <div className="loadingCard">問題を選んでいます...</div> : problem ? (
        <article className="practicePreview"><div className="todayCardMeta"><span>{problem.unit}</span><span>難易度 {problem.difficulty}</span></div><h2>{problem.title}</h2><p>{problem.questionText}</p><Link className="button primaryButton" href={`/practice/${problem.id}`}>解答画面へ <ArrowRight size={18} /></Link></article>
      ) : <div className="emptyState">演習問題がありません。</div>}
    </div>
  );
}
