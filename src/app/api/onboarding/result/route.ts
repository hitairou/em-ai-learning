import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { parseJson } from "@/lib/json";

export async function GET() {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  const [attempt, skills] = await Promise.all([
    db.diagnosticAttempt.findFirst({
      where: { userId: auth.user.id, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      include: { answers: { include: { problem: true } } },
    }),
    db.userSkillProfile.findMany({
      where: { userId: auth.user.id, course: auth.user.selectedCourse ?? undefined },
      orderBy: { score: "asc" },
    }),
  ]);
  if (!attempt) return NextResponse.json({ error: "診断結果がありません" }, { status: 404 });
  return NextResponse.json({
    score: attempt.score,
    level: attempt.score >= 80 ? "標準問題へ進めます" : attempt.score >= 60 ? "基礎はあと一歩です" : "まず基礎を固めましょう",
    weakTopics: skills.slice(0, 3).map((skill) => ({ topic: skill.topic, score: skill.score })),
    mistakes: skills.map((skill) => parseJson<Record<string, number>>(skill.mistakeTypesJson, {})),
    recommendation: skills[0]?.topic ?? attempt.answers.find((answer) => !answer.isCorrect)?.problem.topic ?? "基礎確認",
  });
}
