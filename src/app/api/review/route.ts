import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { parseJson } from "@/lib/json";
import { publishedProblemWhere } from "@/lib/problem-policy";
import { getUnitSkillSummaries } from "@/lib/skill-summary";

export async function GET() {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  const [skills, unitSkills, practiceMistakes, diagnosticMistakes] = await Promise.all([
    db.userSkillProfile.findMany({
      where: { userId: auth.user.id, course: auth.user.selectedCourse ?? undefined },
      orderBy: [{ score: "asc" }, { averageTimeSec: "desc" }],
    }),
    auth.user.selectedCourse
      ? getUnitSkillSummaries(db, { userId: auth.user.id, course: auth.user.selectedCourse, includeZero: false })
      : Promise.resolve([]),
    db.practiceAttempt.findMany({
      where: { userId: auth.user.id, isCorrect: false, problem: { is: { ...publishedProblemWhere, ...(auth.user.selectedCourse ? { course: auth.user.selectedCourse } : {}) } } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { problem: true },
    }),
    db.diagnosticAnswer.findMany({
      where: {
        isCorrect: false,
        attempt: { is: { userId: auth.user.id, ...(auth.user.selectedCourse ? { course: auth.user.selectedCourse } : {}) } },
        ...(auth.user.selectedCourse ? { problem: { is: { course: auth.user.selectedCourse } } } : {}),
      },
      orderBy: { attempt: { completedAt: "desc" } },
      take: 10,
      include: { problem: true, attempt: true },
    }),
  ]);
  const mistakes = [
    ...practiceMistakes.map((item) => ({
      source: "practice",
      attemptId: item.id,
      problemId: item.problemId,
      href: `/practice/${item.problemId}`,
      title: item.problem.title,
      topic: item.problem.topic,
      mistakeType: item.mistakeType,
      createdAt: item.createdAt,
    })),
    ...diagnosticMistakes.map((item) => ({
      source: "diagnostic",
      attemptId: item.attemptId,
      problemId: item.problemId,
      href: `/diagnostic/${item.attemptId}`,
      title: item.problem.title,
      topic: item.problem.topic,
      mistakeType: item.mistakeType,
      createdAt: item.attempt.completedAt ?? item.attempt.startedAt,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10);
  const mistakeRanking = new Map<string, number>();
  for (const skill of skills) {
    const counts = parseJson<Record<string, number>>(skill.mistakeTypesJson, {});
    for (const [type, count] of Object.entries(counts)) {
      if (type !== "correct") mistakeRanking.set(type, (mistakeRanking.get(type) ?? 0) + count);
    }
  }
  return NextResponse.json({
    dueTopics: unitSkills.slice(0, 5).map((skill) => ({
      topic: skill.unit,
      score: skill.score,
      attempts: skill.attempts,
      averageTimeSec: null,
      hintUsageRate: null,
      note: skill.score < 60 ? "基礎式と向きを3分で確認しましょう" : "類題を1問解いて定着を確認しましょう",
    })),
    recentMistakes: mistakes.map((item) => ({
      source: item.source,
      attemptId: item.attemptId,
      problemId: item.problemId,
      href: item.href,
      title: item.title,
      topic: item.topic,
      mistakeType: item.mistakeType,
      createdAt: item.createdAt,
    })),
    mistakeRanking: [...mistakeRanking.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count })),
  });
}
