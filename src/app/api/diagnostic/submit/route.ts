import { NextResponse } from "next/server";
import type { Choice } from "@/types/learning";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { parseJson } from "@/lib/json";
import { recordSkillAttempt } from "@/lib/skills";
import { diagnosticSubmitSchema, firstZodError } from "@/lib/validation";

export async function POST(request: Request) {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  if (!auth.user.selectedCourse) {
    return NextResponse.json({ error: "科目が選択されていません" }, { status: 409 });
  }
  const parsed = diagnosticSubmitSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
  }
  const ids = [...new Set(parsed.data.answers.map((answer) => answer.problemId))];
  if (ids.length !== 5) {
    return NextResponse.json({ error: "5問すべてに回答してください" }, { status: 400 });
  }
  const problems = await db.problem.findMany({
    where: {
      id: { in: ids },
      course: auth.user.selectedCourse,
      sourceType: "diagnostic",
    },
  });
  if (problems.length !== 5) {
    return NextResponse.json({ error: "診断問題を確認できませんでした" }, { status: 400 });
  }
  const byId = new Map(problems.map((problem) => [problem.id, problem]));
  const graded = parsed.data.answers.map((answer) => {
    const problem = byId.get(answer.problemId)!;
    const choice = parseJson<Choice[]>(problem.choicesJson, []).find(
      (item) => item.id === answer.selectedChoice,
    );
    const isCorrect = answer.selectedChoice === problem.correctAnswer;
    return {
      ...answer,
      problem,
      isCorrect,
      mistakeType: isCorrect ? "correct" : choice?.misconceptionType ?? "concept_error",
    };
  });
  const score = Math.round((graded.filter((item) => item.isCorrect).length / 5) * 100);

  const attempt = await db.$transaction(async (tx) => {
    const created = await tx.diagnosticAttempt.create({
      data: {
        userId: auth.user.id,
        course: auth.user.selectedCourse!,
        score,
        startedAt: new Date(parsed.data.startedAt),
        completedAt: new Date(),
        answers: {
          create: graded.map((item) => ({
            problemId: item.problemId,
            selectedChoice: item.selectedChoice,
            isCorrect: item.isCorrect,
            answerTimeSec: item.answerTimeSec,
            mistakeType: item.mistakeType,
          })),
        },
      },
    });
    for (const item of graded) {
      await recordSkillAttempt(tx, {
        userId: auth.user.id,
        course: auth.user.selectedCourse!,
        topic: item.problem.topic,
        isCorrect: item.isCorrect,
        answerTimeSec: item.answerTimeSec,
        hintUsedCount: 0,
        mistakeType: item.mistakeType,
      });
    }
    await tx.user.update({
      where: { id: auth.user.id },
      data: { diagnosticCompleted: true, onboardingCompleted: true },
    });
    return created;
  });
  return NextResponse.json({ attemptId: attempt.id, score });
}
