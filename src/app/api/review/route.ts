import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { parseJson } from "@/lib/json";

export async function GET() {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  const [skills, mistakes] = await Promise.all([
    db.userSkillProfile.findMany({
      where: { userId: auth.user.id, course: auth.user.selectedCourse ?? undefined },
      orderBy: [{ score: "asc" }, { averageTimeSec: "desc" }],
    }),
    db.practiceAttempt.findMany({
      where: { userId: auth.user.id, isCorrect: false },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { problem: true },
    }),
  ]);
  const mistakeRanking = new Map<string, number>();
  for (const skill of skills) {
    const counts = parseJson<Record<string, number>>(skill.mistakeTypesJson, {});
    for (const [type, count] of Object.entries(counts)) {
      if (type !== "correct") mistakeRanking.set(type, (mistakeRanking.get(type) ?? 0) + count);
    }
  }
  return NextResponse.json({
    dueTopics: skills.slice(0, 5).map((skill) => ({
      topic: skill.topic,
      score: skill.score,
      attempts: skill.attempts,
      averageTimeSec: skill.averageTimeSec,
      hintUsageRate: skill.hintUsageRate,
      note: skill.score < 60 ? "基礎式と向きを3分で確認しましょう" : "類題を1問解いて定着を確認しましょう",
    })),
    recentMistakes: mistakes.map((item) => ({
      attemptId: item.id,
      problemId: item.problemId,
      title: item.problem.title,
      topic: item.problem.topic,
      mistakeType: item.mistakeType,
      createdAt: item.createdAt,
    })),
    mistakeRanking: [...mistakeRanking.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count })),
  });
}
