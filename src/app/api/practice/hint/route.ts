import { NextResponse } from "next/server";
import { z } from "zod";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { generateHint } from "@/lib/ai/generateHint";
import { publishedProblemWhere } from "@/lib/problem-policy";

const schema = z.object({
  problemId: z.string().min(1),
  userAnswer: z.string().max(10000).optional(),
  hintNumber: z.number().int().min(2).max(5),
});

export async function POST(request: Request) {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  if (!auth.user.selectedCourse) return NextResponse.json({ error: "科目を選択してください" }, { status: 409 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "ヒントを取得できませんでした" }, { status: 400 });
  const problem = await db.problem.findFirst({
    where: { id: parsed.data.problemId, course: auth.user.selectedCourse, ...publishedProblemWhere },
  });
  if (!problem) return NextResponse.json({ error: "問題が見つかりません" }, { status: 404 });
  const hint = await generateHint({
    problem,
    userAnswer: parsed.data.userAnswer,
    hintNumber: parsed.data.hintNumber,
  });
  return NextResponse.json({ hint });
}
