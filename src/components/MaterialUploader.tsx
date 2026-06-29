"use client";

import { FormEvent, useEffect, useState } from "react";

type Material = { id: string; title: string; course: string; type: string; sourceYear: number | null; createdAt: string };

export default function MaterialUploader() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [message, setMessage] = useState("");
  async function load() { const response = await fetch("/api/admin/materials"); const data = await response.json(); if (response.ok) setMaterials(data.materials); }
  useEffect(() => {
    let active = true;
    fetch("/api/admin/materials")
      .then(async (response) => ({ ok: response.ok, data: await response.json() }))
      .then(({ ok, data }) => {
        if (active && ok) setMaterials(data.materials);
      });
    return () => { active = false; };
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(""); const form = new FormData(event.currentTarget); const response = await fetch("/api/admin/materials", { method: "POST", body: form }); const data = await response.json(); setMessage(response.ok ? "教材を保存しました" : data.error ?? "保存できませんでした"); if (response.ok) { event.currentTarget.reset(); await load(); }
  }
  return <div className="adminGrid"><form className="panel adminForm" onSubmit={submit}><div className="sectionHeading"><div><span className="eyebrow">UPLOAD</span><h2>教材を登録</h2></div></div><label className="fieldLabel">科目<select name="course" className="selectInput"><option value="em1">電磁気1</option><option value="em2">電磁気2</option></select></label><label className="fieldLabel">タイトル<input name="title" className="textInput" required /></label><div className="formGrid"><label className="fieldLabel">年度<input name="sourceYear" className="textInput" type="number" min="1900" max="2200" /></label><label className="fieldLabel">タグ（カンマ区切り）<input name="tags" className="textInput" /></label></div><label className="fieldLabel">PDF・画像<input name="file" className="fileInput" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" /></label><label className="fieldLabel">抽出テキストの補足・修正<textarea name="extractedText" className="textArea" rows={8} /></label>{message && <p className="inlineNotice">{message}</p>}<button className="button primaryButton fullButton" type="submit">教材を保存</button></form><section className="panel adminList"><div className="sectionHeading"><div><span className="eyebrow">MATERIALS</span><h2>教材一覧</h2></div><span>{materials.length}件</span></div>{materials.length ? materials.map((item) => <article key={item.id} className="adminListItem"><div><span>{item.course === "em1" ? "電磁気1" : "電磁気2"}</span><strong>{item.title}</strong><small>{item.type} {item.sourceYear ? `/ ${item.sourceYear}年度` : ""}</small></div></article>) : <div className="emptyState">教材はまだありません。</div>}</section></div>;
}
