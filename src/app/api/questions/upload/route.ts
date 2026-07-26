import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { analyzeQuestion } from "@/lib/ai/analyzeQuestion";
import { extractPdfText, saveUpload } from "@/lib/uploads";
import { ELECTROMAGNETISM_ONLY_MESSAGE, shouldAcceptInitialQuestion } from "@/lib/question-relevance";
import type { Course, QuestionInputType } from "@/types/learning";

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
    let extractedText = text;
    if (file) {
      const saved = await saveUpload(file);
      originalFilePath = saved.target;
      if (saved.extension === ".pdf") {
        inputType = "pdf";
        const pdfText = await extractPdfText(saved.target).catch(() => "");
        extractedText = [pdfText, text].filter(Boolean).join("\n\n");
      } else {
        inputType = "image";
        imagePath = saved.target;
        extractedText = text || `アップロード画像: ${file.name}`;
      }
    }
    const hasImageOnlyInput = inputType === "image" && !text;
    if (!hasImageOnlyInput && !shouldAcceptInitialQuestion(extractedText)) {
      return NextResponse.json({ error: ELECTROMAGNETISM_ONLY_MESSAGE }, { status: 400 });
    }
    const weakSkills = await db.userSkillProfile.findMany({
      where: { userId: auth.user.id, course: auth.user.selectedCourse },
      orderBy: { score: "asc" },
      take: 3,
    });
    const analysis = await analyzeQuestion({
      text: extractedText,
      selectedCourse: auth.user.selectedCourse as Course,
      imagePath,
      learnerContext: weakSkills.map((skill) => `${skill.topic}:${skill.score}`).join("、") || "診断履歴なし",
    });
    const session = await db.questionSession.create({
      data: {
        userId: auth.user.id,
        course: analysis.course,
        inputType,
        originalFilePath,
        extractedText: analysis.extractedText,
        detectedTopic: analysis.topic,
        aiSummary: JSON.stringify(analysis),
        messages: {
          create: [
            { role: "user", content: extractedText },
            { role: "assistant", content: JSON.stringify(analysis) },
          ],
        },
      },
    });
    await db.generatedSimilarProblem.create({
      data: {
        userId: auth.user.id,
        generatedQuestion: analysis.similarQuestion,
        generatedSolution: analysis.similarSolution,
        difficulty: 2,
        topic: analysis.topic,
      },
    });
    return NextResponse.json({ id: session.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "質問を処理できませんでした";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
