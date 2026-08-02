import "server-only";
import type { Problem } from "@prisma/client";
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

export type PracticeSort = "achievement" | "attempts" | "stale";

export type PracticeRecommendation = {
  problem: Problem;
  topicScore: number | null;
  attemptCount: number;
  lastAttemptAt: Date | null;
};

export type PracticeUnitOption = {
  unit: string;
  count: number;
};

function compareRecommendation(a: PracticeRecommendation, b: PracticeRecommendation, sort: PracticeSort) {
  if (sort === "attempts") {
    const attemptDiff = a.attemptCount - b.attemptCount;
    if (attemptDiff !== 0) return attemptDiff;
  }
  if (sort === "stale") {
    const aTime = a.lastAttemptAt?.getTime() ?? 0;
    const bTime = b.lastAttemptAt?.getTime() ?? 0;
    const staleDiff = aTime - bTime;
    if (staleDiff !== 0) return staleDiff;
  }
  const scoreDiff = (a.topicScore ?? 0) - (b.topicScore ?? 0);
  if (scoreDiff !== 0) return scoreDiff;
  const attemptDiff = a.attemptCount - b.attemptCount;
  if (attemptDiff !== 0) return attemptDiff;
  const aTime = a.lastAttemptAt?.getTime() ?? 0;
  const bTime = b.lastAttemptAt?.getTime() ?? 0;
  if (aTime !== bTime) return aTime - bTime;
  return (a.problem.appQuestionId ?? a.problem.id).localeCompare(b.problem.appQuestionId ?? b.problem.id);
}

export async function findPracticeRecommendations(input: {
  userId: string;
  course: string;
  mode: PracticeMode;
  sort?: PracticeSort;
  limit?: number;
  units?: string[];
}) {
  const course = normalizeCourse(input.course);
  if (!course) return [];
  const courseWhere = { in: courseAliases(course) };
  const baseWhere = { ...publishedProblemWhere, course: courseWhere };
  const sort = input.sort ?? "achievement";
  const limit = input.limit ?? 12;
  const selectedUnits = new Set((input.units ?? []).filter(Boolean));
  const [problems, skills, attempts] = await Promise.all([
    db.problem.findMany({
      where: {
        ...baseWhere,
        difficulty: difficultyByMode[input.mode],
        ...(selectedUnits.size ? { unit: { in: [...selectedUnits] } } : {}),
      },
    }),
    db.userSkillProfile.findMany({
      where: { userId: input.userId, course: courseWhere },
      orderBy: { score: "asc" },
    }),
    db.practiceAttempt.findMany({
      where: { userId: input.userId },
      select: { problemId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const skillByTopic = new Map(skills.map((skill) => [skill.topic, skill]));
  const attemptStats = new Map<string, { count: number; lastAttemptAt: Date | null }>();
  for (const attempt of attempts) {
    const current = attemptStats.get(attempt.problemId) ?? { count: 0, lastAttemptAt: null };
    current.count += 1;
    if (!current.lastAttemptAt || current.lastAttemptAt < attempt.createdAt) current.lastAttemptAt = attempt.createdAt;
    attemptStats.set(attempt.problemId, current);
  }
  const ranked = rankPracticeProblems(problems, skills.slice(0, 5).map((skill) => skill.topic), attempts);
  const sorted = ranked
    .map((problem) => {
      const stats = attemptStats.get(problem.id);
      return {
        problem,
        topicScore: skillByTopic.get(problem.topic)?.score ?? null,
        attemptCount: stats?.count ?? 0,
        lastAttemptAt: stats?.lastAttemptAt ?? null,
      };
    })
    .sort((a, b) => compareRecommendation(a, b, sort));

  const uniqueByTopic: PracticeRecommendation[] = [];
  const usedUnits = new Set<string>();
  for (const item of sorted) {
    if (usedUnits.has(item.problem.unit)) continue;
    usedUnits.add(item.problem.unit);
    uniqueByTopic.push(item);
    if (uniqueByTopic.length >= limit) break;
  }
  return uniqueByTopic;
}

export async function findPracticeUnitOptions(input: { course: string; mode: PracticeMode }) {
  const course = normalizeCourse(input.course);
  if (!course) return [];
  const courseWhere = { in: courseAliases(course) };
  const problems = await db.problem.findMany({
    where: { ...publishedProblemWhere, course: courseWhere, difficulty: difficultyByMode[input.mode] },
    select: { unit: true },
  });
  const countByUnit = new Map<string, number>();
  for (const problem of problems) {
    countByUnit.set(problem.unit, (countByUnit.get(problem.unit) ?? 0) + 1);
  }
  return [...countByUnit.entries()]
    .map(([unit, count]) => ({ unit, count }))
    .sort((a, b) => a.unit.localeCompare(b.unit, "ja"));
}

export async function findNextPracticeProblem(input: { userId: string; course: string; mode: PracticeMode }) {
  const recommendations = await findPracticeRecommendations(input);
  return recommendations[0]?.problem ?? null;
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

export async function findRelatedProblemForQuestion(input: {
  userId: string;
  course: string;
  topic: string;
  laws?: string[];
}) {
  const course = normalizeCourse(input.course);
  if (!course) return null;
  const [candidates, attempts] = await Promise.all([
    db.problem.findMany({
      where: {
        ...publishedProblemWhere,
        course: { in: courseAliases(course) },
      },
    }),
    db.practiceAttempt.findMany({
      where: { userId: input.userId },
      select: { problemId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const latestAttempt = new Map<string, number>();
  for (const attempt of attempts) {
    latestAttempt.set(attempt.problemId, Math.max(attempt.createdAt.getTime(), latestAttempt.get(attempt.problemId) ?? 0));
  }
  const topic = normalizeSearchText(input.topic);
  const laws = (input.laws ?? []).map(normalizeSearchText).filter(Boolean);

  return [...candidates].sort((a, b) => {
    const comparisons = [
      relatedScore(b, topic, laws) - relatedScore(a, topic, laws),
      Number(latestAttempt.has(a.id)) - Number(latestAttempt.has(b.id)),
      (latestAttempt.get(a.id) ?? 0) - (latestAttempt.get(b.id) ?? 0),
      a.difficulty - b.difficulty,
    ];
    for (const comparison of comparisons) if (comparison !== 0) return comparison;
    return (a.appQuestionId ?? a.id).localeCompare(b.appQuestionId ?? b.id);
  })[0] ?? null;
}

function normalizeSearchText(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/g, "");
}

function relatedScore(problem: Problem, topic: string, laws: string[]) {
  const problemTopic = normalizeSearchText(problem.topic);
  const problemUnit = normalizeSearchText(problem.unit);
  const problemTitle = normalizeSearchText(problem.title);
  const problemText = normalizeSearchText(problem.questionText);
  const formulas = normalizeSearchText(problem.requiredFormulasJson);
  let score = 0;
  if (topic && problemTopic === topic) score += 80;
  else if (topic && (problemTopic.includes(topic) || topic.includes(problemTopic))) score += 48;
  if (topic && (problemUnit.includes(topic) || topic.includes(problemUnit))) score += 28;
  if (topic && (problemTitle.includes(topic) || problemText.includes(topic))) score += 18;
  for (const law of laws) {
    if (!law) continue;
    if (formulas.includes(law) || problemText.includes(law) || problemTitle.includes(law)) score += 10;
  }
  score += Math.max(0, 6 - problem.difficulty);
  return score;
}
