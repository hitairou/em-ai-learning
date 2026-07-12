import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { gradeAnswer } from "@/lib/ai/gradeAnswer";
import { findSimilarProblem } from "@/lib/problem-bank";
import { publishedProblemWhere } from "@/lib/problem-policy";
import { toProblemView } from "@/lib/problems";
import { recordSkillAttempt } from "@/lib/skills";
import { firstZodError, practiceSubmitSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  const parsed = practiceSubmitSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
  }
  const problem = await db.problem.findFirst({
    where: { id: parsed.data.problemId, course: auth.user.selectedCourse ?? undefined, ...publishedProblemWhere },
  });
  if (!problem) return NextResponse.json({ error: "問題を確認できませんでした" }, { status: 404 });

  const grade = await gradeAnswer(problem, parsed.data.userAnswer);
  if (grade.status === "pending") {
    return NextResponse.json({ grade, retryable: true }, { status: 202 });
  }

  const similar = await findSimilarProblem({ userId: auth.user.id, sourceProblemId: problem.id });
  const result = await db.$transaction(async (tx) => {
    const attempt = await tx.practiceAttempt.create({
      data: {
        userId: auth.user.id,
        problemId: problem.id,
        userAnswer: parsed.data.userAnswer,
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
    return { attempt, skill };
  });

  return NextResponse.json({
    attemptId: result.attempt.id,
    grade,
    correctAnswer: problem.correctAnswer,
    solution: problem.solution,
    explanation: problem.explanation,
    skillScore: result.skill.score,
    similar: similar ? toProblemView(similar) : null,
  });
}
