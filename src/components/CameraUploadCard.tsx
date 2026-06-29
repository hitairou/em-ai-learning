"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, FileText, ImagePlus, Send } from "lucide-react";

export default function CameraUploadCard() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!file && !text.trim()) return;
    setSubmitting(true);
    setError("");
    const form = new FormData();
    if (file) form.set("file", file);
    form.set("text", text);
    const response = await fetch("/api/questions/upload", { method: "POST", body: form });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "質問を送信できませんでした");
      setSubmitting(false);
      return;
    }
    router.push(`/chat/${data.id}`);
    router.refresh();
  }

  return (
    <div className="cameraCard">
      <div className="uploadActions">
        <button type="button" className="uploadAction primary" onClick={() => cameraRef.current?.click()}><Camera /><strong>カメラで撮る</strong><span>問題をその場で撮影</span></button>
        <button type="button" className="uploadAction" onClick={() => fileRef.current?.click()}><ImagePlus /><strong>画像・PDF</strong><span>端末から選択</span></button>
      </div>
      <input ref={cameraRef} className="visuallyHidden" type="file" accept="image/*" capture="environment" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      <input ref={fileRef} className="visuallyHidden" type="file" accept=".png,.jpg,.jpeg,.webp,.pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      {file && <div className="selectedFile"><FileText size={18} /><span>{file.name}</span><button type="button" onClick={() => setFile(null)}>外す</button></div>}
      <label className="fieldLabel">質問を追加する（任意）<textarea className="textArea" rows={5} value={text} onChange={(event) => setText(event.target.value)} placeholder="どこまで分かっているか、どの式で止まったかを書くと説明が合いやすくなります。" /></label>
      {error && <p className="formError">{error}</p>}
      <button type="button" className="button primaryButton fullButton" disabled={submitting || (!file && !text.trim())} onClick={submit}>{submitting ? "問題を解析中..." : <>質問する <Send size={17} /></>}</button>
      <p className="privacyNote">画像・PDFはあなたの質問履歴にだけ保存されます。最大10MB。</p>
    </div>
  );
}
