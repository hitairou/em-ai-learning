import "server-only";
import type { PracticeMode } from "@/types/learning";
import { db } from "@/lib/db";
import { courseAliases, normalizeCourse } from "@/lib/courses";
import { publishedProblemWhere } from "@/lib/problem-policy";
import { rankPracticeProblems, rankSimilarProblems } from "@/lib/problem-selection";

const difficultyByMode = {
  foundation: { lte: 2 },
  standard: { in: [2, 3, 4] },
  exam: { gte: 4 },
};

export async function findNextPracticeProblem(input: { userId: string; course: string; mode: PracticeMode }) {
  const course = normalizeCourse(input.course);
  if (!course) return null;
  const courseWhere = { in: courseAliases(course) };
  const baseWhere = { ...publishedProblemWhere, course: courseWhere };
  const [modeProblems, skills, attempts] = await Promise.all([
    db.problem.findMany({ where: { ...baseWhere, difficulty: difficultyByMode[input.mode] } }),
    db.userSkillProfile.findMany({
      where: { userId: input.userId, course: courseWhere },
      orderBy: { score: "asc" },
      take: 5,
    }),
    db.practiceAttempt.findMany({
      where: { userId: input.userId },
      select: { problemId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const problems = modeProblems.length ? modeProblems : await db.problem.findMany({ where: baseWhere });
  return rankPracticeProblems(problems, skills.map((skill) => skill.topic), attempts)[0] ?? null;
}

export async function findSimilarProblem(input: { userId: string; sourceProblemId: string }) {
  const source = await db.problem.findFirst({ where: { id: input.sourceProblemId, ...publishedProblemWhere } });
  if (!source) return null;
  const sourceCourse = normalizeCourse(source.course);
  const [candidates, attempts] = await Promise.all([
    db.problem.findMany({
      where: {
        ...publishedProblemWhere,
        course: sourceCourse ? { in: courseAliases(sourceCourse) } : source.course,
        id: { not: source.id },
      },
    }),
    db.practiceAttempt.findMany({
      where: { userId: input.userId },
      select: { problemId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return rankSimilarProblems(source, candidates, attempts)[0] ?? null;
}
