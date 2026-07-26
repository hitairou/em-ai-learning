import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { toProblemView } from "@/lib/problems";
import { parseJson } from "@/lib/json";
import { getCurrentDiagnosticScore } from "@/lib/diagnostic-score";
import { findNextPracticeProblem } from "@/lib/problem-bank";
import { publishedProblemWhere } from "@/lib/problem-policy";

export async function GET() {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  if (!auth.user.selectedCourse) {
    return NextResponse.json({ error: "オンボーディングが必要です" }, { status: 409 });
  }
  const [diagnosticScore, skills, recentMistakes] = await Promise.all([
    getCurrentDiagnosticScore(db, { userId: auth.user.id, course: auth.user.selectedCourse }),
    db.userSkillProfile.findMany({
      where: { userId: auth.user.id, course: auth.user.selectedCourse },
      orderBy: { score: "asc" },
    }),
    db.practiceAttempt.findMany({
      where: { userId: auth.user.id, isCorrect: false, problem: { is: { ...publishedProblemWhere, course: auth.user.selectedCourse } } },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { problem: true },
    }),
  ]);
  const mode = auth.user.learningPurpose === "exam" ? "exam" : auth.user.learningPurpose === "foundation" ? "foundation" : "standard";
  const recommendation = await findNextPracticeProblem({ userId: auth.user.id, course: auth.user.selectedCourse, mode });
  return NextResponse.json({
    course: auth.user.selectedCourse,
    diagnosticScore,
    recommendation: recommendation ? toProblemView(recommendation) : null,
    skills: skills.map((skill) => ({
      topic: skill.topic,
      score: skill.score,
      attempts: skill.attempts,
      mistakeTypes: parseJson<Record<string, number>>(skill.mistakeTypesJson, {}),
    })),
    recentMistakes: recentMistakes.map((attempt) => ({
      id: attempt.id,
      problemId: attempt.problemId,
      title: attempt.problem.title,
      topic: attempt.problem.topic,
      mistakeType: attempt.mistakeType,
      createdAt: attempt.createdAt,
    })),
  });
}
