import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getEmailConfig } from "@/lib/email/config";
import { createVerificationCode, digestVerificationCode, hashBrowserToken, PENDING_REGISTRATION_COOKIE } from "@/lib/auth/email-verification";
import { sendVerificationCode } from "@/lib/email/send-verification-code";

export async function POST() {
  const token = (await cookies()).get(PENDING_REGISTRATION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "登録情報が見つかりません" }, { status: 400 });
  const pending = await db.pendingRegistration.findUnique({ where: { browserTokenHash: hashBrowserToken(token) } });
  if (!pending || pending.expiresAt <= new Date()) return NextResponse.json({ error: "登録情報の有効期限が切れています" }, { status: 400 });
  const config = getEmailConfig(); const now = new Date();
  const windowStart = pending.sendWindowStartedAt.getTime() + 3_600_000 <= now.getTime() ? now : pending.sendWindowStartedAt;
  const sends = windowStart === now ? 0 : pending.sendCountInWindow;
  const cooldown = pending.lastSentAt ? Math.ceil((pending.lastSentAt.getTime() + config.cooldownSeconds * 1000 - now.getTime()) / 1000) : 0;
  if (cooldown > 0) return retryResponse("再送までお待ちください", cooldown);
  if (sends >= config.maxSendsPerHour) { const retry = Math.max(1, Math.ceil((windowStart.getTime() + 3_600_000 - now.getTime()) / 1000)); return retryResponse("送信回数の上限に達しました", retry); }
  const code = createVerificationCode();
  const updated = await db.pendingRegistration.update({ where: { id: pending.id }, data: { verificationCodeDigest: digestVerificationCode({ pendingRegistrationId: pending.id, email: pending.email, code }), verificationExpiresAt: new Date(now.getTime() + config.ttlMinutes * 60_000), verificationAttempts: 0, deliveryStatus: "pending" } });
  try { await sendVerificationCode(updated.email, code); } catch { await db.pendingRegistration.update({ where: { id: pending.id }, data: { deliveryStatus: "failed" } }).catch(() => undefined); return NextResponse.json({ error: "確認メールを送信できませんでした" }, { status: 503 }); }
  await db.pendingRegistration.update({ where: { id: pending.id }, data: { lastSentAt: now, sendWindowStartedAt: windowStart, sendCountInWindow: sends + 1, deliveryStatus: "sent" } });
  return NextResponse.json({ ok: true });
}

function retryResponse(error: string, seconds: number) { return NextResponse.json({ error }, { status: 429, headers: { "Retry-After": String(seconds) } }); }
