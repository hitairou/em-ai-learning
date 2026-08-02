import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { firstZodError, signupSchema } from "@/lib/validation";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal/config";
import { getEmailConfig } from "@/lib/email/config";
import { sendVerificationCode } from "@/lib/email/send-verification-code";
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
    const browserToken = createBrowserToken();
    const now = new Date();
    const pending = await db.pendingRegistration.upsert({ where: { email }, update: { name: parsed.data.name, passwordHash, browserTokenHash: hashBrowserToken(browserToken), verificationCodeDigest: "pending", verificationExpiresAt: new Date(now.getTime() + config.ttlMinutes * 60_000), verificationAttempts: 0, lastSentAt: now, sendWindowStartedAt: now, sendCountInWindow: 1, expiresAt: new Date(now.getTime() + config.pendingTtlHours * 3_600_000), termsAcceptedAt: now, termsVersion: TERMS_VERSION, privacyAcknowledgedAt: now, privacyVersion: PRIVACY_VERSION, deliveryStatus: "pending" }, create: { email, name: parsed.data.name, passwordHash, browserTokenHash: hashBrowserToken(browserToken), verificationCodeDigest: "pending", verificationExpiresAt: new Date(now.getTime() + config.ttlMinutes * 60_000), expiresAt: new Date(now.getTime() + config.pendingTtlHours * 3_600_000), sendWindowStartedAt: now, sendCountInWindow: 1, lastSentAt: now, termsAcceptedAt: now, termsVersion: TERMS_VERSION, privacyAcknowledgedAt: now, privacyVersion: PRIVACY_VERSION } });
    const code = createVerificationCode();
    const digest = digestVerificationCode({ pendingRegistrationId: pending.id, email, code });
    await db.pendingRegistration.update({ where: { id: pending.id }, data: { verificationCodeDigest: digest } });
    try { await sendVerificationCode(email, code); } catch { await db.pendingRegistration.update({ where: { id: pending.id }, data: { deliveryStatus: "failed" } }).catch(() => undefined); return authJson({ error: "確認メールを送信できませんでした。時間をおいて再度お試しください" }, { status: 503 }); }
    (await cookies()).set(PENDING_REGISTRATION_COOKIE, browserToken, pendingRegistrationCookieOptions());
    return authJson({ next: "/verify-email", maskedEmail: maskEmail(email) }, { status: 202 });
  } catch (error) {
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
