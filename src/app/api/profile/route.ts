import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { parseJson } from "@/lib/json";

function dayKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(date);
}

export async function GET() {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  const [attempts, skills] = await Promise.all([
    db.practiceAttempt.findMany({
      where: { userId: auth.user.id },
      select: { isCorrect: true, createdAt: true, mistakeType: true },
      orderBy: { createdAt: "desc" },
    }),
    db.userSkillProfile.findMany({
      where: { userId: auth.user.id, course: auth.user.selectedCourse ?? undefined },
      orderBy: { score: "asc" },
    }),
  ]);
  const studiedDays = new Set(attempts.map((item) => dayKey(item.createdAt)));
  let streak = 0;
  const cursor = new Date();
  while (studiedDays.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  const correct = attempts.filter((item) => item.isCorrect).length;
  const mistakeDistribution = new Map<string, number>();
  attempts.forEach((item) => {
    if (!item.isCorrect) mistakeDistribution.set(item.mistakeType, (mistakeDistribution.get(item.mistakeType) ?? 0) + 1);
  });
  return NextResponse.json({
    user: auth.user,
    solvedCount: attempts.length,
    correctRate: attempts.length ? Math.round((correct / attempts.length) * 100) : 0,
    streak,
    skills: skills.map((skill) => ({
      topic: skill.topic,
      score: skill.score,
      attempts: skill.attempts,
      correctRate: skill.correctRate,
      mistakeTypes: parseJson<Record<string, number>>(skill.mistakeTypesJson, {}),
    })),
    mistakeDistribution: [...mistakeDistribution.entries()].map(([type, count]) => ({ type, count })),
  });
}
