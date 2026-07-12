"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Power, Save, Search, ShieldCheck, Wrench, XCircle } from "lucide-react";
import RichMathText from "@/components/RichMathText";
import type { AdminProblemView } from "@/types/learning";

type Filters = {
  q: string; course: string; unit: string; topic: string; subtopic: string; difficulty: string;
  answerKind: string; humanReviewStatus: string; verificationStatus: string; isActive: string;
};
type Pagination = { page: number; pageSize: number; total: number; pageCount: number };

const emptyFilters: Filters = { q: "", course: "", unit: "", topic: "", subtopic: "", difficulty: "", answerKind: "", humanReviewStatus: "", verificationStatus: "", isActive: "" };
const emptyForm = {
  appQuestionId: "", course: "em1", unit: "", topic: "", subtopic: "", difficulty: 1,
  sourceType: "exercise", sourceYear: "", questionType: "manual", answerKind: "short_text",
  calculationMode: "mixed", parentId: "", parentSourceId: "", title: "", questionText: "",
  choicesText: "", correctAnswer: "", solution: "", explanation: "", concepts: "", formulas: "",
  mistakes: "", figureUrls: "", humanReviewStatus: "unreviewed", verificationStatus: "draft",
  isActive: false, estimatedTimeSec: 300, internalMetadataText: "{}",
};

export default function ProblemEditorForm() {
  const [problems, setProblems] = useState<AdminProblemView[]>([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [facets, setFacets] = useState<{ units: string[]; topics: string[]; subtopics: string[] }>({ units: [], topics: [], subtopics: [] });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 30, total: 0, pageCount: 1 });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page) });
    for (const [key, value] of Object.entries(appliedFilters)) if (value) params.set(key, value);
    fetch(`/api/admin/problems?${params}`, { signal: controller.signal })
      .then(async (response) => ({ ok: response.ok, data: await response.json() }))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error ?? "問題一覧を取得できませんでした");
        setProblems(data.problems);
        setPagination(data.pagination);
        setFacets(data.filters);
        setSelected([]);
      })
      .catch((error) => { if (error.name !== "AbortError") setMessage(error.message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [appliedFilters, page, reloadToken]);

  function edit(problem: AdminProblemView) {
    setEditingId(problem.id);
    setForm({
      appQuestionId: problem.appQuestionId ?? "", course: problem.course, unit: problem.unit, topic: problem.topic,
      subtopic: problem.subtopic ?? "", difficulty: problem.difficulty, sourceType: problem.sourceType,
      sourceYear: problem.sourceYear?.toString() ?? "", questionType: problem.questionType, answerKind: problem.answerKind,
      calculationMode: problem.calculationMode, parentId: problem.parentId ?? "", parentSourceId: problem.parentSourceId ?? "",
      title: problem.title, questionText: problem.questionText,
      choicesText: problem.choices.length ? JSON.stringify(problem.choices, null, 2) : "",
      correctAnswer: problem.correctAnswer, solution: problem.solution, explanation: problem.explanation ?? "",
      concepts: problem.topic, formulas: problem.requiredFormulas.join("\n"), mistakes: problem.commonMistakes.join("\n"),
      figureUrls: "", humanReviewStatus: problem.humanReviewStatus, verificationStatus: problem.verificationStatus,
      isActive: problem.isActive, estimatedTimeSec: problem.estimatedTimeSec,
      internalMetadataText: JSON.stringify(problem.internalMetadata, null, 2),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    let choices: unknown[];
    let internalMetadata: Record<string, unknown>;
    try {
      choices = form.choicesText.trim() ? JSON.parse(form.choicesText) : [];
      internalMetadata = JSON.parse(form.internalMetadataText || "{}");
    } catch {
      setMessage("選択肢または内部メタデータのJSONを確認してください");
      return;
    }
    const response = await fetch(editingId ? `/api/admin/problems/${editingId}` : "/api/admin/problems", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        appQuestionId: form.appQuestionId || null,
        sourceYear: form.sourceYear ? Number(form.sourceYear) : null,
        parentId: form.parentId || null,
        parentSourceId: form.parentSourceId || null,
        choices,
        keyConcepts: form.concepts.split("\n").filter(Boolean),
        requiredFormulas: form.formulas.split("\n").filter(Boolean),
        commonMistakes: form.mistakes.split("\n").filter(Boolean),
        figureUrls: form.figureUrls.split("\n").filter(Boolean),
        internalMetadata,
      }),
    });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error ?? "保存できませんでした"); return; }
    setMessage(editingId ? "問題を更新しました" : "問題を作成しました");
    setEditingId(null);
    setForm(emptyForm);
    setReloadToken((value) => value + 1);
  }

  async function updateState(ids: string[], update: Record<string, string | boolean>) {
    if (!ids.length) { setMessage("対象問題を選択してください"); return; }
    const response = await fetch("/api/admin/problems", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, ...update }),
    });
    const data = await response.json();
    setMessage(response.ok ? `${data.updatedCount}問の状態を更新しました` : data.error ?? "状態を更新できませんでした");
    if (response.ok) setReloadToken((value) => value + 1);
  }

  function applySearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
  }

  function field<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="adminWorkspace">
      <form className="adminFilters" onSubmit={applySearch}>
        <label>問題ID<input className="textInput" value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} placeholder="Q0001" /></label>
        <label>科目<select className="selectInput" value={filters.course} onChange={(event) => setFilters({ ...filters, course: event.target.value })}><option value="">すべて</option><option value="em1">電磁気1</option><option value="em2">電磁気2</option></select></label>
        <FilterSelect label="単元" value={filters.unit} options={facets.units} onChange={(value) => setFilters({ ...filters, unit: value })} />
        <FilterSelect label="トピック" value={filters.topic} options={facets.topics} onChange={(value) => setFilters({ ...filters, topic: value })} />
        <FilterSelect label="サブトピック" value={filters.subtopic} options={facets.subtopics} onChange={(value) => setFilters({ ...filters, subtopic: value })} />
        <FilterSelect label="難易度" value={filters.difficulty} options={["1", "2", "3", "4", "5"]} onChange={(value) => setFilters({ ...filters, difficulty: value })} />
        <FilterSelect label="解答種別" value={filters.answerKind} options={["choice", "numeric", "short_text", "derivation"]} onChange={(value) => setFilters({ ...filters, answerKind: value })} />
        <FilterSelect label="レビュー" value={filters.humanReviewStatus} options={["unreviewed", "accepted", "needs_fix", "rejected"]} onChange={(value) => setFilters({ ...filters, humanReviewStatus: value })} />
        <FilterSelect label="検証" value={filters.verificationStatus} options={["draft", "verified"]} onChange={(value) => setFilters({ ...filters, verificationStatus: value })} />
        <FilterSelect label="公開" value={filters.isActive} options={["true", "false"]} onChange={(value) => setFilters({ ...filters, isActive: value })} />
        <button className="button primaryButton" type="submit"><Search size={16} />検索</button>
        <button className="button secondaryButton" type="button" onClick={() => { setFilters(emptyFilters); setAppliedFilters(emptyFilters); setPage(1); }}>クリア</button>
      </form>

      <div className="bulkToolbar">
        <span>{selected.length}問を選択</span>
        <button type="button" onClick={() => updateState(selected, { humanReviewStatus: "accepted" })}><CheckCircle2 size={15} />accepted</button>
        <button type="button" onClick={() => updateState(selected, { humanReviewStatus: "needs_fix" })}><Wrench size={15} />needs_fix</button>
        <button type="button" onClick={() => updateState(selected, { humanReviewStatus: "rejected" })}><XCircle size={15} />rejected</button>
        <button type="button" onClick={() => updateState(selected, { verificationStatus: "verified" })}><ShieldCheck size={15} />verified</button>
        <button type="button" onClick={() => updateState(selected, { isActive: true })}><Power size={15} />有効化</button>
        <button type="button" onClick={() => updateState(selected, { isActive: false })}><Power size={15} />無効化</button>
      </div>

      <div className="adminGrid">
        <form className="panel adminForm" onSubmit={save}>
          <div className="sectionHeading"><div><span className="eyebrow">EDITOR</span><h2>{editingId ? "問題を編集" : "問題を作成"}</h2></div>{editingId && <button type="button" className="textButton" onClick={() => { setEditingId(null); setForm(emptyForm); }}>新規へ戻す</button>}</div>
          <div className="formGrid"><label className="fieldLabel">問題ID<input className="textInput" value={form.appQuestionId} onChange={(e) => field("appQuestionId", e.target.value)} /></label><label className="fieldLabel">解答種別<select className="selectInput" value={form.answerKind} onChange={(e) => field("answerKind", e.target.value)}><option value="choice">choice</option><option value="numeric">numeric</option><option value="short_text">short_text</option><option value="derivation">derivation</option></select></label></div>
          <div className="formGrid"><label className="fieldLabel">科目<select className="selectInput" value={form.course} onChange={(e) => field("course", e.target.value)}><option value="em1">電磁気1</option><option value="em2">電磁気2</option></select></label><label className="fieldLabel">難易度<input className="textInput" type="number" min="1" max="5" value={form.difficulty} onChange={(e) => field("difficulty", Number(e.target.value))} /></label></div>
          <div className="formGrid"><label className="fieldLabel">単元<input className="textInput" required value={form.unit} onChange={(e) => field("unit", e.target.value)} /></label><label className="fieldLabel">トピック<input className="textInput" required value={form.topic} onChange={(e) => field("topic", e.target.value)} /></label></div>
          <label className="fieldLabel">サブトピック<input className="textInput" value={form.subtopic} onChange={(e) => field("subtopic", e.target.value)} /></label>
          <label className="fieldLabel">タイトル<input className="textInput" required value={form.title} onChange={(e) => field("title", e.target.value)} /></label>
          <label className="fieldLabel">問題文<textarea className="textArea" required rows={6} value={form.questionText} onChange={(e) => field("questionText", e.target.value)} /></label>
          <label className="fieldLabel">端的な正答<textarea className="textArea" required rows={3} value={form.correctAnswer} onChange={(e) => field("correctAnswer", e.target.value)} /></label>
          <label className="fieldLabel">解説・導出<textarea className="textArea" required rows={7} value={form.solution} onChange={(e) => field("solution", e.target.value)} /></label>
          <label className="fieldLabel">補足解説<textarea className="textArea" required rows={5} value={form.explanation} onChange={(e) => field("explanation", e.target.value)} /></label>
          <details className="mathPreview" open><summary>数式プレビュー</summary><h3>問題文</h3><RichMathText text={form.questionText} /><h3>正答</h3><RichMathText text={form.correctAnswer} /><h3>解説・導出</h3><RichMathText text={form.solution} /></details>
          <label className="fieldLabel">選択肢JSON<textarea className="codeArea" rows={5} value={form.choicesText} onChange={(e) => field("choicesText", e.target.value)} /></label>
          <label className="fieldLabel">必要公式（1行1件）<textarea className="textArea" rows={3} value={form.formulas} onChange={(e) => field("formulas", e.target.value)} /></label>
          <label className="fieldLabel">重要概念（1行1件）<textarea className="textArea" rows={3} value={form.concepts} onChange={(e) => field("concepts", e.target.value)} /></label>
          <label className="fieldLabel">よくある誤り（1行1件）<textarea className="textArea" rows={3} value={form.mistakes} onChange={(e) => field("mistakes", e.target.value)} /></label>
          <div className="formGrid"><label className="fieldLabel">レビュー<select className="selectInput" value={form.humanReviewStatus} onChange={(e) => field("humanReviewStatus", e.target.value)}><option value="unreviewed">unreviewed</option><option value="accepted">accepted</option><option value="needs_fix">needs_fix</option><option value="rejected">rejected</option></select></label><label className="fieldLabel">検証<select className="selectInput" value={form.verificationStatus} onChange={(e) => field("verificationStatus", e.target.value)}><option value="draft">draft</option><option value="verified">verified</option></select></label></div>
          <label className="toggleField"><input type="checkbox" checked={form.isActive} onChange={(e) => field("isActive", e.target.checked)} />有効化する（accepted + verifiedの場合のみ反映）</label>
          <details><summary>管理者向け内部情報</summary><label className="fieldLabel">内部メタデータJSON<textarea className="codeArea" rows={8} value={form.internalMetadataText} onChange={(e) => field("internalMetadataText", e.target.value)} /></label></details>
          {message && <p className="inlineNotice">{message}</p>}
          <button className="button primaryButton fullButton" type="submit"><Save size={17} />{editingId ? "更新する" : "作成する"}</button>
        </form>

        <section className="panel adminList">
          <div className="sectionHeading"><div><span className="eyebrow">DATABASE</span><h2>問題一覧</h2></div><span>{pagination.total}件</span></div>
          <label className="selectPage"><input type="checkbox" checked={problems.length > 0 && selected.length === problems.length} onChange={(event) => setSelected(event.target.checked ? problems.map((problem) => problem.id) : [])} />このページを選択</label>
          {loading ? <p>読み込み中...</p> : problems.length ? problems.map((problem) => (
            <article key={problem.id} className="adminListItem">
              <input type="checkbox" checked={selected.includes(problem.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, problem.id] : current.filter((id) => id !== problem.id))} />
              <button type="button" className="adminProblemSummary" onClick={() => edit(problem)}>
                <span>{problem.appQuestionId ?? "内部問題"} / {problem.course === "em1" ? "電磁気1" : "電磁気2"} / {problem.unit}</span>
                <strong>{problem.title}</strong>
                <small>難易度 {problem.difficulty} / {problem.answerKind} / {problem.humanReviewStatus} / {problem.verificationStatus} / {problem.isActive ? "有効" : "無効"}</small>
              </button>
            </article>
          )) : <div className="emptyState">条件に一致する問題がありません。</div>}
          <div className="pagination">
            <button type="button" title="前のページ" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft /></button>
            <span>{pagination.page} / {pagination.pageCount}</span>
            <button type="button" title="次のページ" disabled={page >= pagination.pageCount} onClick={() => setPage((value) => Math.min(pagination.pageCount, value + 1))}><ChevronRight /></button>
          </div>
        </section>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label>{label}<select className="selectInput" value={value} onChange={(event) => onChange(event.target.value)}><option value="">すべて</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}
