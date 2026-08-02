import type { PrismaClient } from "@prisma/client";

export const DAILY_QUOTA_ERROR = "DAILY_EMAIL_QUOTA_EXCEEDED";

export class DailyEmailQuotaExceededError extends Error {
  constructor() {
    super(DAILY_QUOTA_ERROR);
    this.name = "DailyEmailQuotaExceededError";
  }
}

type DbClient = PrismaClient;

export function utcDateKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function retryAfterNextUtcMidnight(now = new Date()) {
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  return Math.max(1, Math.ceil((next.getTime() - now.getTime()) / 1000));
}

export async function reserveDailyEmailSend(db: DbClient, limit: number, now = new Date()) {
  const dateKey = utcDateKey(now);
  await db.$transaction(async (tx) => {
    await tx.emailDailyQuota.upsert({ where: { dateKey }, create: { dateKey }, update: {} });
    const reserved = await tx.emailDailyQuota.updateMany({
      where: { dateKey, sendCount: { lt: limit } },
      data: { sendCount: { increment: 1 } },
    });
    if (reserved.count !== 1) throw new DailyEmailQuotaExceededError();
  });
  return { dateKey };
}

export async function releaseDailyEmailSend(db: DbClient, dateKey: string) {
  await db.$transaction(async (tx) => {
    await tx.emailDailyQuota.updateMany({
      where: { dateKey, sendCount: { gt: 0 } },
      data: { sendCount: { decrement: 1 } },
    });
  });
}
