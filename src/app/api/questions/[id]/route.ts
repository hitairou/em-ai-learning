import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { parseJson } from "@/lib/json";
import type { QuestionAnalysis } from "@/types/learning";
import { safeDeleteUpload } from "@/lib/uploads";

export async function GET(_request: Request, context: RouteContext<"/api/questions/[id]">) {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  const { id } = await context.params;
  const session = await db.questionSession.findFirst({
    where: { id, userId: auth.user.id },
  });
  if (!session) return NextResponse.json({ error: "質問が見つかりません" }, { status: 404 });
  return NextResponse.json({
    session: {
      ...session,
      originalFilePath: undefined,
      analysis: parseJson<QuestionAnalysis | null>(session.aiSummary, null),
      hasFile: Boolean(session.originalFilePath),
    },
  });
}

export async function DELETE(_request: Request, context: RouteContext<"/api/questions/[id]">) {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  const { id } = await context.params;
  const session = await db.questionSession.findFirst({ where: { id, userId: auth.user.id }, select: { id: true, originalFilePath: true } });
  if (!session) return NextResponse.json({ error: "質問が見つかりません" }, { status: 404 });
  if (session.originalFilePath && (await safeDeleteUpload(session.originalFilePath)) === "rejected") return NextResponse.json({ error: "ファイルを安全に削除できません" }, { status: 500 });
  await db.questionSession.delete({ where: { id: session.id } });
  return NextResponse.json({ ok: true });
}
