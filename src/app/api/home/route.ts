import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { toProblemView } from "@/lib/problems";
import { parseJson } from "@/lib/json";

export async function GET() {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  if (!auth.user.selectedCourse) {
    return NextResponse.json({ error: "オンボーディングが必要です" }, { status: 409 });
  }
  const [diagnostic, skills, recentMistakes] = await Promise.all([
    db.diagnosticAttempt.findFirst({
      where: { userId: auth.user.id, course: auth.user.selectedCourse },
      orderBy: { completedAt: "desc" },
    }),
    db.userSkillProfile.findMany({
      where: { userId: auth.user.id, course: auth.user.selectedCourse },
      orderBy: { score: "asc" },
    }),
    db.practiceAttempt.findMany({
      where: { userId: auth.user.id, isCorrect: false },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { problem: true },
    }),
  ]);
  const weakest = skills[0]?.topic;
  const recommendation = await db.problem.findFirst({
    where: {
      course: auth.user.selectedCourse,
      sourceType: { in: ["exercise", "ai_generated", "similar"] },
      ...(weakest ? { topic: weakest } : {}),
    },
    orderBy: [{ difficulty: "asc" }, { createdAt: "asc" }],
  }) ?? await db.problem.findFirst({
    where: { course: auth.user.selectedCourse, sourceType: "exercise" },
    orderBy: { difficulty: "asc" },
  });
  return NextResponse.json({
    course: auth.user.selectedCourse,
    diagnosticScore: diagnostic?.score ?? null,
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
