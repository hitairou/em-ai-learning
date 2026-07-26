import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { publishedProblemWhere } from "@/lib/problem-policy";

type SkillSummaryClient = Prisma.TransactionClient | typeof db;

export type UnitSkillSummary = {
  unit: string;
  score: number;
  attempts: number;
};

export async function getUnitSkillSummaries(
  client: SkillSummaryClient,
  input: { userId: string; course: string; includeZero: boolean },
) {
  const [problems, skills] = await Promise.all([
    client.problem.findMany({
      where: { ...publishedProblemWhere, course: input.course },
      select: { unit: true, topic: true },
    }),
    client.userSkillProfile.findMany({
      where: { userId: input.userId, course: input.course },
    }),
  ]);
  const unitTopics = new Map<string, Set<string>>();
  for (const problem of problems) {
    const topics = unitTopics.get(problem.unit) ?? new Set<string>();
    topics.add(problem.topic);
    unitTopics.set(problem.unit, topics);
  }
  const skillByTopic = new Map(skills.map((skill) => [skill.topic, skill]));
  const summaries = [...unitTopics.entries()].map(([unit, topics]) => {
    const unitSkills = [...topics].map((topic) => skillByTopic.get(topic)).filter((skill) => skill !== undefined);
    const attempts = unitSkills.reduce((total, skill) => total + skill.attempts, 0);
    const weightedScore = unitSkills.reduce((total, skill) => total + skill.score * Math.max(1, skill.attempts), 0);
    const weight = unitSkills.reduce((total, skill) => total + Math.max(1, skill.attempts), 0);
    return {
      unit,
      score: weight ? Math.round(weightedScore / weight) : 0,
      attempts,
    };
  });
  return summaries
    .filter((summary) => input.includeZero || (summary.attempts > 0 && summary.score > 0))
    .sort((a, b) => a.score - b.score || a.unit.localeCompare(b.unit, "ja"));
}
