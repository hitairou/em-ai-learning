import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

type SkillScoreInput = {
  score: number;
  attempts: number;
};

type ScoreClient = Prisma.TransactionClient | typeof db;

export function aggregateDiagnosticScore(skills: SkillScoreInput[]) {
  if (skills.length === 0) return null;
  const weighted = skills.reduce(
    (total, skill) => {
      const weight = Math.max(1, Math.min(5, skill.attempts));
      return {
        score: total.score + skill.score * weight,
        weight: total.weight + weight,
      };
    },
    { score: 0, weight: 0 },
  );
  return Math.round(weighted.score / weighted.weight);
}

export async function getCurrentDiagnosticScore(
  client: ScoreClient,
  input: { userId: string; course: string },
) {
  const skills = await client.userSkillProfile.findMany({
    where: { userId: input.userId, course: input.course },
    select: { score: true, attempts: true },
  });
  const skillScore = aggregateDiagnosticScore(skills);
  if (skillScore !== null) return skillScore;

  const diagnostic = await client.diagnosticAttempt.findFirst({
    where: { userId: input.userId, course: input.course },
    orderBy: { completedAt: "desc" },
    select: { score: true },
  });
  return diagnostic?.score ?? null;
}
