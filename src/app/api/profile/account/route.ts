import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { apiUser } from "@/lib/auth/api";
import { clearSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { safeDeleteUpload } from "@/lib/uploads";

export async function DELETE(request: Request) {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  const body = await request.json().catch(() => null) as { password?: unknown; confirmation?: unknown } | null;
  if (typeof body?.password !== "string" || body.confirmation !== "アカウントを削除") return NextResponse.json({ error: "パスワードと確認文字列を入力してください" }, { status: 400 });
  const fullUser = await db.user.findUnique({ where: { id: auth.user.id }, select: { passwordHash: true, role: true } });
  if (!fullUser || !(await bcrypt.compare(body.password, fullUser.passwordHash))) return NextResponse.json({ error: "パスワードが違います" }, { status: 401 });
  if (fullUser.role === "admin" && await db.user.count({ where: { role: "admin" } }) <= 1) return NextResponse.json({ error: "最後の管理者アカウントは削除できません" }, { status: 409 });
  const sessions = await db.questionSession.findMany({ where: { userId: auth.user.id }, select: { originalFilePath: true } });
  for (const session of sessions) if (session.originalFilePath && (await safeDeleteUpload(session.originalFilePath)) === "rejected") return NextResponse.json({ error: "関連ファイルを安全に削除できません" }, { status: 500 });
  await db.user.delete({ where: { id: auth.user.id } });
  await clearSession();
  return NextResponse.json({ ok: true });
}
