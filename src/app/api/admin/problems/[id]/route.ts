import { NextResponse } from "next/server";
import { apiAdmin } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { problemData } from "@/lib/admin";
import { toProblemView } from "@/lib/problems";
import { firstZodError, problemSchema } from "@/lib/validation";

export async function PUT(request: Request, context: RouteContext<"/api/admin/problems/[id]">) {
  const auth = await apiAdmin();
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const parsed = problemSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const problem = await db.problem.update({ where: { id }, data: problemData(parsed.data) });
  return NextResponse.json({ problem: toProblemView(problem, true) });
}

export async function DELETE(_request: Request, context: RouteContext<"/api/admin/problems/[id]">) {
  const auth = await apiAdmin();
  if (auth.error) return auth.error;
  const { id } = await context.params;
  const usage = await db.problem.findUnique({
    where: { id },
    select: { _count: { select: { diagnosticAnswers: true, practiceAttempts: true } } },
  });
  if (!usage) return NextResponse.json({ error: "問題が見つかりません" }, { status: 404 });
  if (usage._count.diagnosticAnswers + usage._count.practiceAttempts > 0) {
    return NextResponse.json({ error: "回答履歴がある問題は削除できません" }, { status: 409 });
  }
  await db.problem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
