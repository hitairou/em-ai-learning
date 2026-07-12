import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { publishedProblemWhere } from "@/lib/problem-policy";

export async function GET() {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  const [questions, practices] = await Promise.all([
    db.questionSession.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.practiceAttempt.findMany({
      where: { userId: auth.user.id, problem: { is: publishedProblemWhere } },
      include: { problem: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);
  return NextResponse.json({
    questions: questions.map((item) => ({
      id: item.id,
      inputType: item.inputType,
      topic: item.detectedTopic,
      preview: item.extractedText.slice(0, 100),
      createdAt: item.createdAt,
    })),
    practices: practices.map((item) => ({
      id: item.id,
      problemId: item.problemId,
      title: item.problem.title,
      isCorrect: item.isCorrect,
      mistakeType: item.mistakeType,
      createdAt: item.createdAt,
    })),
  });
}
