"use client";

import { FormEvent, useEffect, useState } from "react";
import type { ProblemView } from "@/types/learning";

type AdminProblem = ProblemView & { correctAnswer?: string; solution?: string };

const empty = {
  course: "em1",
  unit: "静電場",
  topic: "電場",
  difficulty: 1,
  sourceType: "exercise",
  title: "",
  questionText: "",
  choicesText: "",
  correctAnswer: "",
  solution: "",
  explanation: "",
  formulas: "",
  mistakes: "",
};

export default function ProblemEditorForm() {
  const [problems, setProblems] = useState<AdminProblem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const response = await fetch("/api/admin/problems");
    const data = await response.json();
    if (response.ok) setProblems(data.problems);
    else setMessage(data.error ?? "問題一覧を取得できませんでした");
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/problems")
      .then(async (response) => ({ ok: response.ok, data: await response.json() }))
      .then(({ ok, data }) => {
        if (!active) return;
        if (ok) setProblems(data.problems);
        else setMessage(data.error ?? "問題一覧を取得できませんでした");
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  function edit(problem: AdminProblem) {
    setEditingId(problem.id);
    setForm({
      course: problem.course,
      unit: problem.unit,
      topic: problem.topic,
      difficulty: problem.difficulty,
      sourceType: problem.sourceType,
      title: problem.title,
      questionText: problem.questionText,
      choicesText: problem.choices.length ? JSON.stringify(problem.choices, null, 2) : "",
      correctAnswer: problem.correctAnswer ?? "",
      solution: problem.solution ?? problem.explanation ?? "",
      explanation: problem.explanation ?? "",
      formulas: problem.requiredFormulas?.join("\n") ?? "",
      mistakes: problem.commonMistakes?.join("\n") ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    let choices;
    try { choices = form.choicesText.trim() ? JSON.parse(form.choicesText) : []; }
    catch { setMessage("選択肢JSONを確認してください"); return; }
    const response = await fetch(editingId ? `/api/admin/problems/${editingId}` : "/api/admin/problems", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course: form.course,
        unit: form.unit,
        topic: form.topic,
        subtopic: form.topic,
        difficulty: Number(form.difficulty),
        sourceType: form.sourceType,
        title: form.title,
        questionText: form.questionText,
        choices,
        correctAnswer: form.correctAnswer,
        solution: form.solution,
        explanation: form.explanation,
        keyConcepts: [form.topic],
        requiredFormulas: form.formulas.split("\n").filter(Boolean),
        commonMistakes: form.mistakes.split("\n").filter(Boolean),
        figureUrls: [],
      }),
    });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error ?? "保存できませんでした"); return; }
    setMessage(editingId ? "問題を更新しました" : "問題を作成しました");
    setEditingId(null);
    setForm(empty);
    await load();
  }

  async function remove(id: string) {
    if (!window.confirm("この問題を削除しますか？")) return;
    const response = await fetch(`/api/admin/problems/${id}`, { method: "DELETE" });
    const data = await response.json();
    setMessage(response.ok ? "問題を削除しました" : data.error ?? "削除できませんでした");
    if (response.ok) await load();
  }

  function field(key: keyof typeof empty, value: string | number) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return <div className="adminGrid">
    <form className="panel adminForm" onSubmit={submit}>
      <div className="sectionHeading"><div><span className="eyebrow">EDITOR</span><h2>{editingId ? "問題を編集" : "問題を作成"}</h2></div>{editingId && <button type="button" className="textButton" onClick={() => { setEditingId(null); setForm(empty); }}>新規へ戻す</button>}</div>
      <div className="formGrid"><label className="fieldLabel">科目<select className="selectInput" value={form.course} onChange={(e) => field("course", e.target.value)}><option value="em1">電磁気1</option><option value="em2">電磁気2</option></select></label><label className="fieldLabel">難易度<input className="textInput" type="number" min="1" max="5" value={form.difficulty} onChange={(e) => field("difficulty", Number(e.target.value))} /></label></div>
      <div className="formGrid"><label className="fieldLabel">単元<input className="textInput" required value={form.unit} onChange={(e) => field("unit", e.target.value)} /></label><label className="fieldLabel">トピック<input className="textInput" required value={form.topic} onChange={(e) => field("topic", e.target.value)} /></label></div>
      <label className="fieldLabel">出典種別<select className="selectInput" value={form.sourceType} onChange={(e) => field("sourceType", e.target.value)}><option value="diagnostic">診断</option><option value="exercise">演習</option><option value="past_exam">過去問</option><option value="ai_generated">AI生成</option><option value="similar">類題</option></select></label>
      <label className="fieldLabel">タイトル<input className="textInput" required value={form.title} onChange={(e) => field("title", e.target.value)} /></label>
      <label className="fieldLabel">問題文<textarea className="textArea" required rows={5} value={form.questionText} onChange={(e) => field("questionText", e.target.value)} /></label>
      <label className="fieldLabel">選択肢JSON<textarea className="codeArea" rows={7} value={form.choicesText} onChange={(e) => field("choicesText", e.target.value)} placeholder='[{"id":"a","text":"...","misconceptionType":"concept_error"}]' /></label>
      <label className="fieldLabel">正答<input className="textInput" required value={form.correctAnswer} onChange={(e) => field("correctAnswer", e.target.value)} /></label>
      <label className="fieldLabel">解答<textarea className="textArea" required rows={4} value={form.solution} onChange={(e) => field("solution", e.target.value)} /></label>
      <label className="fieldLabel">解説<textarea className="textArea" required rows={4} value={form.explanation} onChange={(e) => field("explanation", e.target.value)} /></label>
      <label className="fieldLabel">必要公式（1行1件）<textarea className="textArea" rows={3} value={form.formulas} onChange={(e) => field("formulas", e.target.value)} /></label>
      <label className="fieldLabel">よくあるミス（1行1件）<textarea className="textArea" rows={3} value={form.mistakes} onChange={(e) => field("mistakes", e.target.value)} /></label>
      {message && <p className="inlineNotice">{message}</p>}<button className="button primaryButton fullButton" type="submit">{editingId ? "更新する" : "作成する"}</button>
    </form>
    <section className="panel adminList"><div className="sectionHeading"><div><span className="eyebrow">DATABASE</span><h2>問題一覧</h2></div><span>{problems.length}件</span></div>{loading ? <p>読み込み中...</p> : problems.length ? problems.map((problem) => <article key={problem.id} className="adminListItem"><div><span>{problem.course === "em1" ? "電磁気1" : "電磁気2"} / {problem.unit}</span><strong>{problem.title}</strong><small>難易度 {problem.difficulty} ・ {problem.sourceType}</small></div><div><button type="button" onClick={() => edit(problem)}>編集</button><button type="button" onClick={() => remove(problem.id)}>削除</button></div></article>) : <div className="emptyState">問題がありません。</div>}</section>
  </div>;
}
