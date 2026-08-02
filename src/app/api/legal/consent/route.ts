import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal/config";
import { consentSchema } from "@/lib/validation";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  const parsed = consentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "同意内容を確認してください" }, { status: 400 });
  const now = new Date();
  await db.user.update({ where: { id: auth.user.id }, data: { termsAcceptedAt: now, termsVersion: TERMS_VERSION, privacyAcknowledgedAt: now, privacyVersion: PRIVACY_VERSION } });
  return NextResponse.json({ ok: true });
}
