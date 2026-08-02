import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth/session";
import { firstZodError, signupSchema } from "@/lib/validation";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal/config";

export async function POST(request: Request) {
  const parsed = signupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return authJson({ error: firstZodError(parsed.error) }, { status: 400 });
  }
  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        termsAcceptedAt: new Date(),
        termsVersion: TERMS_VERSION,
        privacyAcknowledgedAt: new Date(),
        privacyVersion: PRIVACY_VERSION,
      },
    });
    await createSession({ userId: user.id, role: user.role });
    return authJson({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
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
