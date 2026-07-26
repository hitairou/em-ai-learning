"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import PracticeModeSelector from "@/components/PracticeModeSelector";
import RichMathText from "@/components/RichMathText";
import type { PracticeMode, ProblemView } from "@/types/learning";

type PracticeSort = "achievement" | "attempts" | "stale";

type PracticeRecommendationView = ProblemView & {
  topicScore: number | null;
  attemptCount: number;
  lastAttemptAt: string | null;
};

type UnitOption = {
  unit: string;
  count: number;
};

const sortOptions: Array<{ value: PracticeSort; label: string }> = [
  { value: "achievement", label: "達成度が低い順" },
  { value: "attempts", label: "解答数が少ない順" },
  { value: "stale", label: "最近解いてない順" },
];

export default function PracticeHub({
  initialMode,
  initialProblems,
  initialUnits,
  initialSelectedUnits,
}: {
  initialMode?: PracticeMode;
  initialProblems: PracticeRecommendationView[];
  initialUnits: UnitOption[];
  initialSelectedUnits?: string[];
}) {
  const [mode, setMode] = useState<PracticeMode>(initialMode ?? "foundation");
  const [sort, setSort] = useState<PracticeSort>("achievement");
  const [problems, setProblems] = useState(initialProblems);
  const [units, setUnits] = useState(initialUnits);
  const [selectedUnits, setSelectedUnits] = useState<string[]>(initialSelectedUnits ?? []);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setNotice("");
      const params = new URLSearchParams({ mode, sort });
      for (const unit of selectedUnits) params.append("unit", unit);
      const response = await fetch(`/api/practice/next?${params.toString()}`, { signal: controller.signal });
      const data = await response.json().catch(() => ({}));
      if (controller.signal.aborted) return;
      if (response.ok) {
        setProblems(data.problems ?? []);
        setUnits(data.units ?? []);
      }
      else {
        setProblems([]);
        setNotice(data.error ?? "問題を取得できませんでした");
      }
      setLoading(false);
    }
    load().catch((error) => {
      if (controller.signal.aborted) return;
      setProblems([]);
      setNotice(error instanceof Error ? error.message : "問題を取得できませんでした");
      setLoading(false);
    });
    return () => controller.abort();
  }, [mode, sort, selectedUnits]);

  function selectMode(nextMode: PracticeMode) {
    setMode(nextMode);
    setSelectedUnits([]);
  }

  function toggleUnit(unit: string) {
    const activeUnits = selectedUnits.length ? selectedUnits : units.map((item) => item.unit);
    const next = activeUnits.includes(unit)
      ? activeUnits.filter((item) => item !== unit)
      : [...activeUnits, unit];
    setSelectedUnits(next.length === units.length ? [] : next);
  }

  function isUnitChecked(unit: string) {
    return selectedUnits.length === 0 || selectedUnits.includes(unit);
  }

  const unitLabel = selectedUnits.length === 0
    ? "全単元"
    : `${selectedUnits.length}単元`;

  return (
    <div className="stackLarge">
      <PracticeModeSelector value={mode} onChange={selectMode} />
      <div className="practiceToolbar">
        <label className="practiceOption">
          <span>並び替え</span>
          <select className="selectInput" value={sort} onChange={(event) => setSort(event.target.value as PracticeSort)}>
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <div className="unitOption">
          <span className="optionLabel">絞り込み</span>
          <details className="unitDropdown">
            <summary><strong>{unitLabel}</strong><ChevronDown size={16} /></summary>
            <div className="unitDropdownMenu">
              {units.map((item) => (
                <label key={item.unit} className={isUnitChecked(item.unit) ? "checked" : ""}>
                  <input type="checkbox" checked={isUnitChecked(item.unit)} onChange={() => toggleUnit(item.unit)} />
                  <Check size={13} />
                  <span>{item.unit}</span>
                </label>
              ))}
            </div>
          </details>
        </div>
      </div>
      {notice && <p className="inlineNotice">{notice}</p>}
      {loading ? <div className="loadingCard">問題を並べています...</div> : problems.length ? (
        <div className="practiceRecommendationGrid">
          {problems.map((problem) => (
            <article className="practicePreview compact" key={problem.id}>
              <div className="todayCardMeta"><span>{problem.unit} / {problem.topic}</span><span>難易度 {problem.difficulty}</span></div>
              <h2>{problem.title}</h2>
              <RichMathText text={problem.questionText} />
              <Link className="button primaryButton" href={`/practice/${problem.id}`}>解答画面へ <ArrowRight size={18} /></Link>
            </article>
          ))}
        </div>
      ) : <div className="emptyState">公開済みの演習問題がありません。</div>}
    </div>
  );
}
