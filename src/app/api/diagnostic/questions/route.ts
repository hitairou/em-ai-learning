import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { toProblemView } from "@/lib/problems";

export async function GET() {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  if (!auth.user.selectedCourse) {
    return NextResponse.json({ error: "先に科目を選択してください" }, { status: 409 });
  }
  const problems = await db.problem.findMany({
    where: { course: auth.user.selectedCourse, sourceType: "diagnostic" },
    orderBy: { id: "asc" },
    take: 5,
  });
  return NextResponse.json({ questions: problems.map((problem) => toProblemView(problem)) });
}
