"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, FileText, ImagePlus, Send } from "lucide-react";

const DIRECT_UPLOAD_LIMIT_BYTES = 850 * 1024;
const MAX_IMAGE_SIDE = 1600;

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
    try {
      const uploadFile = file ? await prepareUploadFile(file) : null;
      const form = new FormData();
      if (uploadFile) form.set("file", uploadFile);
      form.set("text", text);
      const response = await fetch("/api/questions/upload", { method: "POST", body: form });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error ?? uploadErrorMessage(response.status));
        setSubmitting(false);
        return;
      }
      if (!data?.id) {
        setError("質問を送信できませんでした");
        setSubmitting(false);
        return;
      }
      router.push(`/chat/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "質問を送信できませんでした");
      setSubmitting(false);
      return;
    }
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

async function prepareUploadFile(file: File) {
  if (!file.type.startsWith("image/")) {
    if (file.size > DIRECT_UPLOAD_LIMIT_BYTES) {
      throw new Error("PDFは容量が大きすぎます。1MB未満のPDFにするか、問題文をテキストで入力してください。");
    }
    return file;
  }
  if (file.size <= DIRECT_UPLOAD_LIMIT_BYTES) return file;
  const compressed = await compressImage(file);
  if (compressed.size > DIRECT_UPLOAD_LIMIT_BYTES) {
    throw new Error("画像を十分に圧縮できませんでした。撮影範囲を問題部分だけに絞って撮り直してください。");
  }
  return compressed;
}

async function compressImage(file: File) {
  const bitmap = await createImageBitmap(file);
  try {
    let scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("画像を処理できませんでした。");
      context.drawImage(bitmap, 0, 0, width, height);
      for (const quality of [0.82, 0.72, 0.62]) {
        const blob = await canvasToBlob(canvas, quality);
        if (blob.size <= DIRECT_UPLOAD_LIMIT_BYTES || attempt === 4 && quality === 0.62) {
          return new File([blob], replaceExtension(file.name, ".jpg"), { type: "image/jpeg" });
        }
      }
      scale *= 0.8;
    }
  } finally {
    bitmap.close();
  }
  return file;
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("画像を圧縮できませんでした。"));
    }, "image/jpeg", quality);
  });
}

function replaceExtension(name: string, extension: string) {
  return name.includes(".") ? name.replace(/\.[^.]+$/, extension) : `${name}${extension}`;
}

function uploadErrorMessage(status: number) {
  if (status === 413) return "ファイルが大きすぎます。画像は問題部分だけを撮影して再送してください。";
  return "質問を送信できませんでした";
}
