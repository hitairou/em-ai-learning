import { cookies } from "next/headers";
import type { Metadata } from "next";
import VerifyEmailForm from "@/components/VerifyEmailForm";
import { db } from "@/lib/db";
import { hashBrowserToken, maskEmail, PENDING_REGISTRATION_COOKIE } from "@/lib/auth/email-verification";

export const metadata: Metadata = { title: "メールアドレス確認" };
export default async function VerifyEmailPage() {
  const token = (await cookies()).get(PENDING_REGISTRATION_COOKIE)?.value;
  const pending = token ? await db.pendingRegistration.findUnique({ where: { browserTokenHash: hashBrowserToken(token) }, select: { email: true, expiresAt: true } }) : null;
  const valid = Boolean(pending && pending.expiresAt > new Date());
  return <div className="authPage"><section className="authIntro"><span className="eyebrow">VERIFY EMAIL</span><h1>あと一歩で、<br />学習を始められます。</h1><p>メールアドレスを確認してアカウント登録を完了してください。</p></section><section className="authPanel"><h2>メールアドレス確認</h2><VerifyEmailForm maskedEmail={valid && pending ? maskEmail(pending.email) : null} hasPending={valid} /></section></div>;
}
