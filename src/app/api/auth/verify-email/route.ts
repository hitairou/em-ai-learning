import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getEmailConfig } from "@/lib/email/config";
import { emailVerificationCodeSchema } from "@/lib/validation";
import { digestVerificationCode, hashBrowserToken, matchesDigest, PENDING_REGISTRATION_COOKIE } from "@/lib/auth/email-verification";
import { clearPendingCookie } from "@/lib/auth/email-cookie";

export async function POST(request: Request) {
  const parsed = emailVerificationCodeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "確認コードを確認してください" }, { status: 400 });
  const token = (await cookies()).get(PENDING_REGISTRATION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "登録情報が見つかりません。登録をやり直してください" }, { status: 400 });
  const pending = await db.pendingRegistration.findUnique({ where: { browserTokenHash: hashBrowserToken(token) } });
  if (!pending || pending.expiresAt <= new Date()) return NextResponse.json({ error: "登録情報の有効期限が切れています。登録をやり直してください" }, { status: 400 });
  const config = getEmailConfig();
  if (pending.verificationExpiresAt <= new Date()) return NextResponse.json({ error: "確認コードの有効期限が切れています。再送してください" }, { status: 400 });
  if (pending.verificationAttempts >= config.maxAttempts) return NextResponse.json({ error: "試行回数の上限に達しました。確認コードを再送してください" }, { status: 429 });
  const digest = digestVerificationCode({ pendingRegistrationId: pending.id, email: pending.email, code: parsed.data.code });
  if (!matchesDigest(pending.verificationCodeDigest, digest)) {
    const attempts = pending.verificationAttempts + 1;
    await db.pendingRegistration.update({ where: { id: pending.id }, data: { verificationAttempts: attempts, ...(attempts >= config.maxAttempts ? { verificationExpiresAt: new Date(0) } : {}) } });
    return NextResponse.json({ error: attempts >= config.maxAttempts ? "試行回数の上限に達しました。確認コードを再送してください" : "確認コードが違います" }, { status: attempts >= config.maxAttempts ? 429 : 400 });
  }
  try {
    await db.$transaction(async (tx) => {
      if (await tx.user.findUnique({ where: { email: pending.email }, select: { id: true } })) throw new Error("EMAIL_ALREADY_EXISTS");
      await tx.user.create({ data: { email: pending.email, name: pending.name, passwordHash: pending.passwordHash, termsAcceptedAt: pending.termsAcceptedAt, termsVersion: pending.termsVersion, privacyAcknowledgedAt: pending.privacyAcknowledgedAt, privacyVersion: pending.privacyVersion, emailVerificationStatus: "verified", emailVerifiedAt: new Date() } });
      await tx.pendingRegistration.delete({ where: { id: pending.id } });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "このメールアドレスは登録済みです。ログインしてください" }, { status: 409 });
    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") return NextResponse.json({ error: "このメールアドレスは登録済みです。ログインしてください" }, { status: 409 });
    return NextResponse.json({ error: "メールアドレスを確認できませんでした" }, { status: 500 });
  }
  await clearPendingCookie();
  return NextResponse.json({ next: "/login?emailVerified=1" });
}
