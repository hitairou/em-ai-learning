import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { firstZodError, signupSchema } from "@/lib/validation";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal/config";
import { getEmailConfig } from "@/lib/email/config";
import { isDefinitiveEmailDeliveryFailure, sendVerificationCode } from "@/lib/email/send-verification-code";
import { DailyEmailQuotaExceededError, releaseDailyEmailSend, reserveDailyEmailSend, retryAfterNextUtcMidnight } from "@/lib/email/daily-quota";
import { createBrowserToken, createVerificationCode, digestVerificationCode, hashBrowserToken, normalizeEmail, maskEmail, PENDING_REGISTRATION_COOKIE } from "@/lib/auth/email-verification";
import { cookies } from "next/headers";
import { pendingRegistrationCookieOptions } from "@/lib/auth/session-cookie";

export async function POST(request: Request) {
  const parsed = signupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return authJson({ error: firstZodError(parsed.error) }, { status: 400 });
  }
  try {
    const email = normalizeEmail(parsed.data.email);
    const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return authJson({ next: "/login", message: "このメールアドレスは登録済みです。ログインしてください。" }, { status: 202 });
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const config = getEmailConfig();
    const now = new Date();
    const reservation = await reserveDailyEmailSend(db, config.dailySendLimit, now);
    const browserToken = createBrowserToken();
    const code = createVerificationCode();
    let previous;
    try { previous = await db.pendingRegistration.findUnique({ where: { email } }); }
    catch (error) { await releaseDailyEmailSend(db, reservation.dateKey).catch(() => undefined); throw error; }
    let pending;
    try {
      pending = await db.pendingRegistration.upsert({ where: { email }, update: { name: parsed.data.name, passwordHash, browserTokenHash: hashBrowserToken(browserToken), verificationCodeDigest: digestVerificationCode({ pendingRegistrationId: previous?.id ?? "pending", email, code }), verificationExpiresAt: new Date(now.getTime() + config.ttlMinutes * 60_000), verificationAttempts: 0, lastSentAt: now, sendWindowStartedAt: now, sendCountInWindow: 1, expiresAt: new Date(now.getTime() + config.pendingTtlHours * 3_600_000), termsAcceptedAt: now, termsVersion: TERMS_VERSION, privacyAcknowledgedAt: now, privacyVersion: PRIVACY_VERSION, deliveryStatus: "pending" }, create: { email, name: parsed.data.name, passwordHash, browserTokenHash: hashBrowserToken(browserToken), verificationCodeDigest: "pending", verificationExpiresAt: new Date(now.getTime() + config.ttlMinutes * 60_000), expiresAt: new Date(now.getTime() + config.pendingTtlHours * 3_600_000), sendWindowStartedAt: now, termsAcceptedAt: now, termsVersion: TERMS_VERSION, privacyAcknowledgedAt: now, privacyVersion: PRIVACY_VERSION } });
      const digest = digestVerificationCode({ pendingRegistrationId: pending.id, email, code });
      pending = await db.pendingRegistration.update({ where: { id: pending.id }, data: { verificationCodeDigest: digest } });
    } catch (error) {
      await releaseDailyEmailSend(db, reservation.dateKey).catch(() => undefined);
      throw error;
    }
    try { await sendVerificationCode(email, code); } catch (error) {
      if (previous) await db.pendingRegistration.update({ where: { id: previous.id }, data: { name: previous.name, passwordHash: previous.passwordHash, browserTokenHash: previous.browserTokenHash, verificationCodeDigest: previous.verificationCodeDigest, verificationExpiresAt: previous.verificationExpiresAt, verificationAttempts: previous.verificationAttempts, lastSentAt: previous.lastSentAt, sendWindowStartedAt: previous.sendWindowStartedAt, sendCountInWindow: previous.sendCountInWindow, expiresAt: previous.expiresAt, termsAcceptedAt: previous.termsAcceptedAt, termsVersion: previous.termsVersion, privacyAcknowledgedAt: previous.privacyAcknowledgedAt, privacyVersion: previous.privacyVersion, deliveryStatus: previous.deliveryStatus } }).catch(() => undefined);
      else await db.pendingRegistration.delete({ where: { id: pending.id } }).catch(() => undefined);
      if (isDefinitiveEmailDeliveryFailure(error)) await releaseDailyEmailSend(db, reservation.dateKey).catch(() => undefined);
      return authJson({ error: "確認メールを送信できませんでした。時間をおいて再度お試しください" }, { status: 503 });
    }
    (await cookies()).set(PENDING_REGISTRATION_COOKIE, browserToken, pendingRegistrationCookieOptions());
    return authJson({ next: "/verify-email", maskedEmail: maskEmail(email) }, { status: 202 });
  } catch (error) {
    if (error instanceof DailyEmailQuotaExceededError) return authJson({ error: "本日の認証メール送信上限に達しました。翌日以降に再度お試しください。" }, { status: 429, headers: { "Retry-After": String(retryAfterNextUtcMidnight()) } });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return authJson({ error: "このメールアドレスは登録済みです" }, { status: 409 });
    }
    return authJson({ error: "アカウントを作成できませんでした" }, { status: 500 });
  }
}

function authJson(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "private, no-store");
  return NextResponse.json(body, { ...init, headers });
}
