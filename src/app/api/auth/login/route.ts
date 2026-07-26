import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return authJson({ error: "メールアドレスとパスワードを確認してください" }, { status: 400 });
  }
  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return authJson({ error: "メールアドレスまたはパスワードが違います" }, { status: 401 });
  }
  await createSession({ userId: user.id, role: user.role });
  const diagnostic = user.selectedCourse
    ? await db.diagnosticAttempt.findFirst({
      where: { userId: user.id, course: user.selectedCourse },
      select: { id: true },
    })
    : null;
  const next = user.role === "admin"
    ? "/admin/problems"
    : !user.selectedCourse
      ? "/onboarding/course"
      : !diagnostic
        ? "/onboarding/diagnostic"
        : "/home";
  return authJson({ user: { id: user.id, name: user.name }, next });
}

function authJson(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "private, no-store");
  return NextResponse.json(body, { ...init, headers });
}
