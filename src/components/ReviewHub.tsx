"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, Check, ChevronDown, Dumbbell, FileText, Trophy } from "lucide-react";
import RichMathText from "@/components/RichMathText";

type ReviewKind = "diagnostic" | "foundation" | "standard" | "exam";
type ReviewSort = "recent" | "achievement" | "attempts";
type ReviewScope = "wrong" | "all";

export type ReviewHistoryEntry = {
  id: string;
  date: string;
  label: string;
  isCorrect: boolean;
  answer: string;
  mistakeLabel: string;
  feedback?: string;
  reviewHref: string;
};

export type ReviewProblemItem = {
  id: string;
  problemId: string;
  kind: "diagnostic" | "practice";
  modes: Array<"foundation" | "standard" | "exam">;
  unit: string;
  topic: string;
  difficulty: number;
  title: string;
  questionText: string;
  solution: string;
  explanation: string;
  topicScore: number | null;
  attemptCount: number;
  wrongCount: number;
  lastAnsweredAt: string;
  solveHref: string;
  history: ReviewHistoryEntry[];
};

const kindOptions: Array<{ value: ReviewKind; title: string; text: string; icon: typeof FileText }> = [
  { value: "diagnostic", title: "5問診断", text: "診断問題", icon: FileText },
  { value: "foundation", title: "基礎確認", text: "定義と基本式", icon: BookOpenCheck },
  { value: "standard", title: "標準演習", text: "組み立て", icon: Dumbbell },
  { value: "exam", title: "試験対策", text: "試験向け", icon: Trophy },
];

const sortOptions: Array<{ value: ReviewSort; label: string }> = [
  { value: "recent", label: "最近解いた順" },
  { value: "achievement", label: "達成度が低い順" },
  { value: "attempts", label: "回答数が少ない順" },
];

const scopeOptions: Array<{ value: ReviewScope; label: string }> = [
  { value: "wrong", label: "間違えた問題のみ" },
  { value: "all", label: "全て表示" },
];

function dateLabel(value: string) {
  const date = new Date(value);
  const today = new Date();
  if (date.toLocaleDateString("ja-JP") === today.toLocaleDateString("ja-JP")) {
    return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("ja-JP");
}

export default function ReviewHub({ items, units }: { items: ReviewProblemItem[]; units: string[] }) {
  const [selectedKinds, setSelectedKinds] = useState<ReviewKind[]>([]);
  const [sort, setSort] = useState<ReviewSort>("recent");
  const [scope, setScope] = useState<ReviewScope>("wrong");
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [openHistoryId, setOpenHistoryId] = useState<string | null>(null);
  const [openExplanationId, setOpenExplanationId] = useState<string | null>(null);

  function toggleUnit(unit: string) {
    const activeUnits = selectedUnits.length ? selectedUnits : units;
    const next = activeUnits.includes(unit) ? activeUnits.filter((item) => item !== unit) : [...activeUnits, unit];
    setSelectedUnits(next.length === units.length ? [] : next);
  }

  function isUnitChecked(unit: string) {
    return selectedUnits.length === 0 || selectedUnits.includes(unit);
  }

  function toggleKind(kind: ReviewKind) {
    setSelectedKinds((current) => current.includes(kind) ? current.filter((item) => item !== kind) : [...current, kind]);
  }

  const unitLabel = selectedUnits.length === 0 ? "全単元" : `${selectedUnits.length}単元`;

  const filtered = useMemo(() => {
    const activeUnits = new Set(selectedUnits);
    const activeKinds = new Set(selectedKinds);
    return items
      .filter((item) => activeKinds.size === 0 || (activeKinds.has("diagnostic") && item.kind === "diagnostic") || item.modes.some((mode) => activeKinds.has(mode)))
      .filter((item) => scope === "all" || item.wrongCount > 0)
      .filter((item) => activeUnits.size === 0 || activeUnits.has(item.unit))
      .sort((a, b) => {
        if (sort === "achievement") {
          const scoreDiff = (a.topicScore ?? 0) - (b.topicScore ?? 0);
          if (scoreDiff !== 0) return scoreDiff;
        }
        if (sort === "attempts") {
          const attemptDiff = a.attemptCount - b.attemptCount;
          if (attemptDiff !== 0) return attemptDiff;
        }
        return new Date(b.lastAnsweredAt).getTime() - new Date(a.lastAnsweredAt).getTime();
      });
  }, [items, selectedKinds, scope, selectedUnits, sort]);

  return (
    <div className="stackLarge">
      <div className="reviewTypeGrid">
        {kindOptions.map((option) => {
          const Icon = option.icon;
          return <button key={option.value} type="button" className={selectedKinds.includes(option.value) ? "selected" : ""} onClick={() => toggleKind(option.value)}><Icon size={18} /><span><strong>{option.title}</strong><small>{option.text}</small></span></button>;
        })}
      </div>
      <div className="practiceToolbar reviewToolbar">
        <label className="practiceOption">
          <span>並び替え</span>
          <select className="selectInput" value={sort} onChange={(event) => setSort(event.target.value as ReviewSort)}>
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="practiceOption">
          <span>表示</span>
          <select className="selectInput" value={scope} onChange={(event) => setScope(event.target.value as ReviewScope)}>
            {scopeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <div className="unitOption">
          <span className="optionLabel">絞り込み</span>
          <details className="unitDropdown">
            <summary><strong>{unitLabel}</strong><ChevronDown size={16} /></summary>
            <div className="unitDropdownMenu">
              {units.map((unit) => (
                <label key={unit} className={isUnitChecked(unit) ? "checked" : ""}>
                  <input type="checkbox" checked={isUnitChecked(unit)} onChange={() => toggleUnit(unit)} />
                  <Check size={13} />
                  <span>{unit}</span>
                </label>
              ))}
            </div>
          </details>
        </div>
      </div>
      {filtered.length ? (
        <div className="practiceRecommendationGrid reviewProblemGrid">
          {filtered.map((item) => {
            const historyOpen = openHistoryId === item.id;
            const explanationOpen = openExplanationId === item.id;
            return (
              <article className="practicePreview compact reviewProblemCard" key={item.id}>
                <div className="todayCardMeta"><span>{item.kind === "diagnostic" ? "5問診断" : "演習"} / {item.unit}</span><span>難易度 {item.difficulty}</span></div>
                <h2>{item.title}</h2>
                <RichMathText text={item.questionText} />
                <div className="reviewCardStats">
                  <span>{dateLabel(item.lastAnsweredAt)}</span>
                  <span>{item.wrongCount ? `${item.wrongCount}件のミス` : "誤答なし"}</span>
                </div>
                <div className="reviewCardActions">
                  <button className="button ghostButton" type="button" onClick={() => setOpenHistoryId(historyOpen ? null : item.id)}>回答履歴</button>
                  <button className="button ghostButton" type="button" onClick={() => setOpenExplanationId(explanationOpen ? null : item.id)}>解説履歴</button>
                  <Link className="button primaryButton" href={item.solveHref}>もう一度解く <ArrowRight size={16} /></Link>
                </div>
                {historyOpen && (
                  <div className="reviewInlinePanel">
                    {item.history.map((entry) => (
                      <Link href={entry.reviewHref} key={entry.id} className="reviewHistoryEntry">
                        <span className={`resultDot ${entry.isCorrect ? "ok" : "ng"}`} />
                        <div><strong>{entry.label} / {dateLabel(entry.date)}</strong><p>{entry.answer}</p><small>{entry.mistakeLabel}</small></div>
                      </Link>
                    ))}
                  </div>
                )}
                {explanationOpen && (
                  <div className="reviewInlinePanel">
                    <strong>標準解説</strong>
                    <RichMathText text={item.explanation || item.solution} />
                    {item.history.some((entry) => entry.feedback) && <strong>採点フィードバック</strong>}
                    {item.history.filter((entry) => entry.feedback).map((entry) => <p key={`feedback-${entry.id}`}>{dateLabel(entry.date)}: {entry.feedback}</p>)}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : <div className="emptyState">条件に合う復習履歴はありません。</div>}
    </div>
  );
}
