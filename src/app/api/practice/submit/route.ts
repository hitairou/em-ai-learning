import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { gradeAnswer } from "@/lib/ai/gradeAnswer";
import { generateSimilarProblem } from "@/lib/ai/generateSimilarProblem";
import { recordSkillAttempt } from "@/lib/skills";
import { firstZodError, practiceSubmitSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  const parsed = practiceSubmitSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
  }
  const problem = await db.problem.findUnique({ where: { id: parsed.data.problemId } });
  if (!problem || problem.course !== auth.user.selectedCourse) {
    return NextResponse.json({ error: "問題を確認できませんでした" }, { status: 404 });
  }
  const [grade, similar] = await Promise.all([
    gradeAnswer(problem, parsed.data.userAnswer),
    generateSimilarProblem(problem),
  ]);
  const result = await db.$transaction(async (tx) => {
    const attempt = await tx.practiceAttempt.create({
      data: {
        userId: auth.user.id,
        problemId: problem.id,
        userAnswer: parsed.data.userAnswer,
        isCorrect: grade.isCorrect,
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
      isCorrect: grade.isCorrect,
      answerTimeSec: parsed.data.answerTimeSec,
      hintUsedCount: parsed.data.hintUsedCount,
      mistakeType: grade.mistakeType,
    });
    const generated = await tx.generatedSimilarProblem.create({
      data: {
        userId: auth.user.id,
        sourceProblemId: problem.id,
        generatedQuestion: similar.question,
        generatedSolution: similar.solution,
        difficulty: similar.difficulty,
        topic: similar.topic,
      },
    });
    return { attempt, skill, generated };
  });
  return NextResponse.json({
    attemptId: result.attempt.id,
    grade,
    skillScore: result.skill.score,
    correctAnswer: problem.correctAnswer,
    solution: problem.solution,
    similar: {
      id: result.generated.id,
      question: result.generated.generatedQuestion,
      solution: result.generated.generatedSolution,
    },
  });
}
