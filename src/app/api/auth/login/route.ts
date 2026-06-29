import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "メールアドレスとパスワードを確認してください" }, { status: 400 });
  }
  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "メールアドレスまたはパスワードが違います" }, { status: 401 });
  }
  await createSession({ userId: user.id, role: user.role });
  const next = !user.selectedCourse
    ? "/onboarding/course"
    : !user.diagnosticCompleted
      ? "/onboarding/diagnostic"
      : "/home";
  return NextResponse.json({ user: { id: user.id, name: user.name }, next });
}
