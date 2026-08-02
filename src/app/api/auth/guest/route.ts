import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth/session";
import { signSession } from "@/lib/auth/session";
import { cookies } from "next/headers";
import { sessionCookieOptions } from "@/lib/auth/session-cookie";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal/config";
import { consentSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = consentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "利用規約とプライバシーポリシーを確認してください" }, { status: 400 });
  const id = randomUUID();
  const passwordHash = await bcrypt.hash(randomUUID(), 12);
  const user = await db.user.create({
    data: {
      name: "ゲスト",
      email: `guest-${id}@em-pass.local`,
      passwordHash,
      termsAcceptedAt: new Date(), termsVersion: TERMS_VERSION,
      privacyAcknowledgedAt: new Date(), privacyVersion: PRIVACY_VERSION,
    },
  });
  await createSession({ userId: user.id, role: user.role });
  const consentToken = await signSession({ userId: `guest-consent:${TERMS_VERSION}:${PRIVACY_VERSION}`, role: "consent" });
  (await cookies()).set("em-pass-guest-consent", consentToken, sessionCookieOptions());
  return NextResponse.json({ user: { id: user.id, name: user.name }, next: "/onboarding/course" }, { status: 201 });
}
