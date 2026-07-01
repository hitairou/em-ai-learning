import { NextRequest, NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { generatePractice } from "@/lib/ai/generatePractice";
import { toProblemView } from "@/lib/problems";
import type { Course, PracticeMode } from "@/types/learning";

const modes = new Set<PracticeMode>(["foundation", "standard", "exam"]);

export async function GET(request: NextRequest) {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  if (!auth.user.selectedCourse) {
    return NextResponse.json({ error: "科目を選択してください" }, { status: 409 });
  }
  const requestedMode = request.nextUrl.searchParams.get("mode") as PracticeMode;
  const mode = modes.has(requestedMode) ? requestedMode : "foundation";
  const weakSkills = await db.userSkillProfile.findMany({
    where: { userId: auth.user.id, course: auth.user.selectedCourse },
    orderBy: { score: "asc" },
    take: 3,
  });

  let aiStatus: "not_configured" | "failed" | undefined;
  if (request.nextUrl.searchParams.get("generate") === "1") {
    const generation = await generatePractice({
      course: auth.user.selectedCourse as Course,
      mode,
      weakTopics: weakSkills.map((skill) => skill.topic),
    });
    if (generation.status === "generated") {
      const generated = generation.problem;
      const problem = await db.problem.create({
        data: {
          course: auth.user.selectedCourse,
          unit: generated.unit,
          topic: generated.topic,
          subtopic: generated.topic,
          difficulty: generated.difficulty,
          sourceType: "ai_generated",
          title: generated.title,
          questionText: generated.questionText,
          choicesJson: JSON.stringify(generated.choices),
          correctAnswer: generated.correctAnswer,
          solution: generated.solution,
          explanation: generated.explanation,
          keyConceptsJson: JSON.stringify([generated.topic]),
          requiredFormulasJson: JSON.stringify(generated.requiredFormulas),
          commonMistakesJson: JSON.stringify(generated.commonMistakes),
        },
      });
      return NextResponse.json({ problem: toProblemView(problem), source: "ai" });
    }
    aiStatus = generation.status;
  }

  const difficulty = mode === "foundation" ? { lte: 2 } : mode === "standard" ? { in: [2, 3] } : { gte: 3 };
  const attempted = await db.practiceAttempt.findMany({
    where: { userId: auth.user.id },
    select: { problemId: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const baseWhere = {
    course: auth.user.selectedCourse,
    sourceType: { in: ["exercise", "ai_generated", "similar"] },
    difficulty,
  };
  let problem = await db.problem.findFirst({
    where: {
      ...baseWhere,
      ...(weakSkills[0] ? { topic: weakSkills[0].topic } : {}),
      id: { notIn: attempted.map((item) => item.problemId) },
    },
    orderBy: { createdAt: "asc" },
  });
  problem ??= await db.problem.findFirst({ where: baseWhere, orderBy: { createdAt: "asc" } });
  if (!problem) return NextResponse.json({ error: "該当する演習問題がありません" }, { status: 404 });
  return NextResponse.json({ problem: toProblemView(problem), source: "database", aiStatus });
}
