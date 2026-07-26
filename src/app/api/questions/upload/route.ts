import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { createQuestionSessionFromUpload } from "@/lib/question-upload";
import { saveUpload } from "@/lib/uploads";
import type { QuestionInputType } from "@/types/learning";

export async function POST(request: Request) {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  if (!auth.user.selectedCourse) {
    return NextResponse.json({ error: "科目を選択してください" }, { status: 409 });
  }
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "送信内容を読み取れませんでした" }, { status: 400 });
  const text = String(form.get("text") ?? "").trim().slice(0, 20000);
  const fileValue = form.get("file");
  const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
  if (!text && !file) {
    return NextResponse.json({ error: "画像・PDF・質問文のいずれかを入力してください" }, { status: 400 });
  }
  try {
    let originalFilePath: string | null = null;
    let imagePath: string | null = null;
    let inputType: QuestionInputType = "text";
    const extractedText = text;
    if (file) {
      const saved = await saveUpload(file);
      originalFilePath = saved.target;
      if (saved.extension === ".pdf") {
        inputType = "pdf";
      } else {
        inputType = "image";
        imagePath = saved.target;
      }
    }
    const session = await createQuestionSessionFromUpload({
      user: auth.user,
      text: extractedText,
      inputType,
      originalFilePath,
      imagePath,
      fileName: file?.name,
    });
    return NextResponse.json({ id: session.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "質問を処理できませんでした";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
