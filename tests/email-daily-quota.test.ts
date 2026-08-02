import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { releaseDailyEmailSend, reserveDailyEmailSend } from "@/lib/email/daily-quota";

async function source(file: string) { return readFile(new URL(`../${file}`, import.meta.url), "utf8"); }

test("daily email quota uses UTC rows, atomic conditional updates, and safe release", async () => {
  const helper = await source("src/lib/email/daily-quota.ts");
  assert.match(helper, /toISOString\(\)\.slice\(0, 10\)/);
  assert.match(helper, /upsert/);
  assert.match(helper, /updateMany/);
  assert.match(helper, /sendCount: \{ lt: limit \}/);
  assert.match(helper, /sendCount: \{ gt: 0 \}/);
  assert.match(helper, /DailyEmailQuotaExceededError/);
});

test("daily quota is shared by signup and resend and is fail-closed at 90", async () => {
  const config = await source("src/lib/email/config.ts");
  const signup = await source("src/app/api/auth/signup/route.ts");
  const resend = await source("src/app/api/auth/resend-verification/route.ts");
  assert.match(config, /MAILGUN_DAILY_SEND_LIMIT/);
  assert.match(config, /dailySendLimit > 90/);
  assert.match(signup, /reserveDailyEmailSend/);
  assert.match(resend, /reserveDailyEmailSend/);
  assert.match(signup, /status: 429/);
  assert.match(resend, /Retry-After/);
});

test("quota failure does not replace a pending code or send metadata", async () => {
  const signup = await source("src/app/api/auth/signup/route.ts");
  const resend = await source("src/app/api/auth/resend-verification/route.ts");
  assert.ok(signup.indexOf("reserveDailyEmailSend") < signup.indexOf("pendingRegistration.upsert"));
  assert.ok(resend.indexOf("reserveDailyEmailSend") < resend.indexOf("verificationCodeDigest: digest"));
  assert.match(signup, /Retry-After/);
  assert.match(resend, /verificationCodeDigest: pending\.verificationCodeDigest/);
});

test("SQLite quota reservation never exceeds the configured limit under concurrency", async () => {
  const db = new PrismaClient();
  const now = new Date("2099-01-02T12:00:00.000Z");
  const dateKey = now.toISOString().slice(0, 10);
  await db.emailDailyQuota.deleteMany({ where: { dateKey } });
  const results = await Promise.allSettled(Array.from({ length: 20 }, () => reserveDailyEmailSend(db, 5, now)));
  const succeeded = results.filter((result) => result.status === "fulfilled").length;
  const row = await db.emailDailyQuota.findUnique({ where: { dateKey } });
  assert.equal(succeeded, 5);
  assert.equal(row?.sendCount, 5);
  await Promise.all(Array.from({ length: succeeded }, () => releaseDailyEmailSend(db, dateKey)));
  const released = await db.emailDailyQuota.findUnique({ where: { dateKey } });
  assert.equal(released?.sendCount, 0);
  await db.emailDailyQuota.delete({ where: { dateKey } });
  await db.$disconnect();
});
