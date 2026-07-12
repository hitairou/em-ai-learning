import "server-only";
import type { PracticeMode } from "@/types/learning";
import { db } from "@/lib/db";
import { publishedProblemWhere } from "@/lib/problem-policy";
import { rankPracticeProblems, rankSimilarProblems } from "@/lib/problem-selection";

const difficultyByMode = {
  foundation: { lte: 2 },
  standard: { in: [2, 3, 4] },
  exam: { gte: 4 },
};

export async function findNextPracticeProblem(input: { userId: string; course: string; mode: PracticeMode }) {
  const [problems, skills, attempts] = await Promise.all([
    db.problem.findMany({ where: { ...publishedProblemWhere, course: input.course, difficulty: difficultyByMode[input.mode] } }),
    db.userSkillProfile.findMany({
      where: { userId: input.userId, course: input.course },
      orderBy: { score: "asc" },
      take: 5,
    }),
    db.practiceAttempt.findMany({
      where: { userId: input.userId },
      select: { problemId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return rankPracticeProblems(problems, skills.map((skill) => skill.topic), attempts)[0] ?? null;
}

export async function findSimilarProblem(input: { userId: string; sourceProblemId: string }) {
  const source = await db.problem.findFirst({ where: { id: input.sourceProblemId, ...publishedProblemWhere } });
  if (!source) return null;
  const [candidates, attempts] = await Promise.all([
    db.problem.findMany({
      where: { ...publishedProblemWhere, course: source.course, id: { not: source.id } },
    }),
    db.practiceAttempt.findMany({
      where: { userId: input.userId },
      select: { problemId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return rankSimilarProblems(source, candidates, attempts)[0] ?? null;
}
