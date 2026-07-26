import "server-only";
import type { Prisma } from "@prisma/client";
import { normalizeCourse } from "@/lib/courses";
import { countMistake } from "@/lib/json";

export function calculateSkillScore(input: {
  correctRate: number;
  averageTimeSec: number;
  hintUsageRate: number;
}) {
  const speedPoints = input.averageTimeSec <= 90
    ? 20
    : Math.max(0, 20 - (input.averageTimeSec - 90) / 9);
  const independencePoints = Math.max(0, 10 - input.hintUsageRate * 10);
  return Math.round(Math.min(100, input.correctRate * 70 + speedPoints + independencePoints));
}

export async function recordSkillAttempt(
  tx: Prisma.TransactionClient,
  input: {
    userId: string;
    course: string;
    topic: string;
    isCorrect: boolean;
    answerTimeSec: number;
    hintUsedCount: number;
    mistakeType: string;
  },
) {
  const course = normalizeCourse(input.course) ?? input.course;
  const existing = await tx.userSkillProfile.findUnique({
    where: {
      userId_course_topic: {
        userId: input.userId,
        course,
        topic: input.topic,
      },
    },
  });
  const attempts = (existing?.attempts ?? 0) + 1;
  const correctCount = (existing?.correctCount ?? 0) + (input.isCorrect ? 1 : 0);
  const correctRate = correctCount / attempts;
  const averageTimeSec =
    ((existing?.averageTimeSec ?? 0) * (attempts - 1) + input.answerTimeSec) / attempts;
  const previousHintUses = (existing?.hintUsageRate ?? 0) * (attempts - 1);
  const hintUsageRate = (previousHintUses + (input.hintUsedCount > 0 ? 1 : 0)) / attempts;
  const score = calculateSkillScore({ correctRate, averageTimeSec, hintUsageRate });
  const mistakeTypes = countMistake(existing?.mistakeTypesJson, input.mistakeType);

  return tx.userSkillProfile.upsert({
    where: {
      userId_course_topic: {
        userId: input.userId,
        course,
        topic: input.topic,
      },
    },
    update: {
      score,
      attempts,
      correctCount,
      correctRate,
      averageTimeSec,
      hintUsageRate,
      lastStudiedAt: new Date(),
      mistakeTypesJson: JSON.stringify(mistakeTypes),
    },
    create: {
      userId: input.userId,
      course,
      topic: input.topic,
      score,
      attempts,
      correctCount,
      correctRate,
      averageTimeSec,
      hintUsageRate,
      lastStudiedAt: new Date(),
      mistakeTypesJson: JSON.stringify(mistakeTypes),
    },
  });
}
