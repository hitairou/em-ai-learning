import { NextRequest, NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { publishedProblemWhere } from "@/lib/problem-policy";

export async function GET(request: NextRequest) {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;

  const value = request.nextUrl.searchParams.get("questionId")?.trim() ?? "";
  if (!/^\d+$/.test(value)) return NextResponse.json({ error: "問題IDは数字で入力してください" }, { status: 400 });

  const appQuestionId = `Q${value.padStart(4, "0")}`;
  const problem = await db.problem.findFirst({
    where: { appQuestionId, ...publishedProblemWhere },
    select: { id: true },
  });
  if (!problem) return NextResponse.json({ error: "該当する問題が見つかりません" }, { status: 404 });
  return NextResponse.json({ href: `/practice/${problem.id}` });
}
