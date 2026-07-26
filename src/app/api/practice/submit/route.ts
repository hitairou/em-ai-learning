import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { courseAliases } from "@/lib/courses";
import { db } from "@/lib/db";
import { gradeAnswer } from "@/lib/ai/gradeAnswer";
import { gradeImageAnswer } from "@/lib/ai/gradeImageAnswer";
import { getCurrentDiagnosticScore } from "@/lib/diagnostic-score";
import { findSimilarProblem } from "@/lib/problem-bank";
import { publishedProblemWhere } from "@/lib/problem-policy";
import { toProblemView } from "@/lib/problems";
import { recordSkillAttempt } from "@/lib/skills";
import { ALLOWED_EXTENSIONS, MAX_UPLOAD_BYTES } from "@/lib/uploads";
import { firstZodError, practiceSubmitSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  const contentType = request.headers.get("content-type") ?? "";
  let imageFile: File | null = null;
  let parsed;
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData().catch(() => null);
    if (!form) return NextResponse.json({ error: "送信内容を読み取れませんでした" }, { status: 400 });
    const fileValue = form.get("answerImage");
    imageFile = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
    parsed = practiceSubmitSchema.safeParse({
      problemId: String(form.get("problemId") ?? ""),
      userAnswer: String(form.get("userAnswer") ?? "画像回答"),
      answerTimeSec: Number(form.get("answerTimeSec") ?? 0),
      hintUsedCount: Number(form.get("hintUsedCount") ?? 0),
    });
  } else {
    parsed = practiceSubmitSchema.safeParse(await request.json().catch(() => null));
  }
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
  }
  if (imageFile) {
    if (imageFile.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "画像は10MB以下にしてください" }, { status: 400 });
    const extension = `.${imageFile.name.split(".").pop()?.toLowerCase() ?? ""}`;
    if (!ALLOWED_EXTENSIONS.has(extension) || extension === ".pdf") return NextResponse.json({ error: "画像ファイルを選択してください" }, { status: 400 });
  }
  const problem = await db.problem.findFirst({
    where: {
      id: parsed.data.problemId,
      ...(auth.user.selectedCourse ? { course: { in: courseAliases(auth.user.selectedCourse) } } : {}),
      ...publishedProblemWhere,
    },
  });
  if (!problem) return NextResponse.json({ error: "問題を確認できませんでした" }, { status: 404 });

  const grade = imageFile
    ? await gradeImageAnswer(problem, imageFile, parsed.data.userAnswer === "画像回答" ? undefined : parsed.data.userAnswer)
    : await gradeAnswer(problem, parsed.data.userAnswer);
  if (grade.status === "pending") {
    return NextResponse.json({ grade, retryable: true }, { status: 202 });
  }

  const similar = await findSimilarProblem({ userId: auth.user.id, sourceProblemId: problem.id });
  const result = await db.$transaction(async (tx) => {
    const attempt = await tx.practiceAttempt.create({
      data: {
        userId: auth.user.id,
        problemId: problem.id,
        userAnswer: imageFile ? `画像回答: ${imageFile.name}` : parsed.data.userAnswer,
        isCorrect: grade.isCorrect === true,
        aiFeedback: JSON.stringify(grade),
        mistakeType: grade.mistakeType,
        answerTimeSec: parsed.data.answerTimeSec,
        hintUsedCount: parsed.data.hintUsedCount,
      },
    });
    const skill = await recordSkillAttempt(tx, {
      userId: auth.user.id,
      course: problem.course,
      topic: problem.topic,
      isCorrect: grade.isCorrect === true,
      answerTimeSec: parsed.data.answerTimeSec,
      hintUsedCount: parsed.data.hintUsedCount,
      mistakeType: grade.mistakeType,
    });
    const diagnosticScore = await getCurrentDiagnosticScore(tx, {
      userId: auth.user.id,
      course: problem.course,
    });
    return { attempt, skill, diagnosticScore };
  });

  return NextResponse.json({
    attemptId: result.attempt.id,
    grade,
    correctAnswer: problem.correctAnswer,
    solution: problem.solution,
    explanation: problem.explanation,
    skillScore: result.skill.score,
    diagnosticScore: result.diagnosticScore,
    similar: similar ? toProblemView(similar) : null,
  });
}
