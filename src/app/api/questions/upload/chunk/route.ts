import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiUser } from "@/lib/auth/api";
import { createQuestionSessionFromUpload } from "@/lib/question-upload";
import { ALLOWED_EXTENSIONS, MAX_UPLOAD_BYTES, uploadRoot } from "@/lib/uploads";
import type { QuestionInputType } from "@/types/learning";

const schema = z.object({
  uploadId: z.string().regex(/^[a-zA-Z0-9_-]{12,80}$/),
  fileName: z.string().min(1).max(240),
  text: z.string().max(20000).default(""),
  index: z.coerce.number().int().min(0).max(99),
  total: z.coerce.number().int().min(1).max(100),
});

export async function POST(request: Request) {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  if (!auth.user.selectedCourse) {
    return NextResponse.json({ error: "科目を選択してください" }, { status: 409 });
  }
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "送信内容を読み取れませんでした" }, { status: 400 });
  const parsed = schema.safeParse({
    uploadId: String(form.get("uploadId") ?? ""),
    fileName: String(form.get("fileName") ?? ""),
    text: String(form.get("text") ?? ""),
    index: form.get("index"),
    total: form.get("total"),
  });
  if (!parsed.success) return NextResponse.json({ error: "分割アップロード情報を確認してください" }, { status: 400 });
  if (parsed.data.index >= parsed.data.total) {
    return NextResponse.json({ error: "分割アップロード番号を確認してください" }, { status: 400 });
  }
  const chunkValue = form.get("chunk");
  const chunk = chunkValue instanceof File && chunkValue.size > 0 ? chunkValue : null;
  if (!chunk) return NextResponse.json({ error: "ファイルの一部を読み取れませんでした" }, { status: 400 });
  const extension = path.extname(parsed.data.fileName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return NextResponse.json({ error: "対応していないファイル形式です" }, { status: 400 });
  }

  const chunkDir = path.join(uploadRoot(), "chunks", auth.user.id, parsed.data.uploadId);
  await fs.mkdir(chunkDir, { recursive: true });
  await fs.writeFile(path.join(chunkDir, `${parsed.data.index}.part`), Buffer.from(await chunk.arrayBuffer()));

  const chunkFiles = await fs.readdir(chunkDir);
  const expectedNames = Array.from({ length: parsed.data.total }, (_, index) => `${index}.part`);
  if (!expectedNames.every((name) => chunkFiles.includes(name))) {
    return NextResponse.json({ complete: false });
  }

  const buffers = await Promise.all(expectedNames.map((name) => fs.readFile(path.join(chunkDir, name))));
  const totalBytes = buffers.reduce((sum, buffer) => sum + buffer.byteLength, 0);
  if (totalBytes > MAX_UPLOAD_BYTES) {
    await fs.rm(chunkDir, { recursive: true, force: true });
    return NextResponse.json({ error: "ファイルは10MB以下にしてください" }, { status: 400 });
  }

  const target = path.join(uploadRoot(), `${randomUUID()}${extension}`);
  await fs.writeFile(target, Buffer.concat(buffers));
  await fs.rm(chunkDir, { recursive: true, force: true });

  const inputType: QuestionInputType = extension === ".pdf" ? "pdf" : "image";
  try {
    const session = await createQuestionSessionFromUpload({
      user: auth.user,
      text: parsed.data.text.trim().slice(0, 20000),
      inputType,
      originalFilePath: target,
      imagePath: inputType === "image" ? target : null,
      fileName: parsed.data.fileName,
    });
    return NextResponse.json({ complete: true, id: session.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "質問を処理できませんでした";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
