import { NextRequest, NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { findNextPracticeProblem } from "@/lib/problem-bank";
import { toProblemView } from "@/lib/problems";
import type { PracticeMode } from "@/types/learning";

const modes = new Set<PracticeMode>(["foundation", "standard", "exam"]);

export async function GET(request: NextRequest) {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  if (!auth.user.selectedCourse) {
    return NextResponse.json({ error: "科目を選択してください" }, { status: 409 });
  }
  const requestedMode = request.nextUrl.searchParams.get("mode") as PracticeMode;
  const mode = modes.has(requestedMode) ? requestedMode : "foundation";
  const problem = await findNextPracticeProblem({
    userId: auth.user.id,
    course: auth.user.selectedCourse,
    mode,
  });
  if (!problem) {
    return NextResponse.json({ error: "公開済みの演習問題がありません" }, { status: 404 });
  }
  return NextResponse.json({ problem: toProblemView(problem), source: "database" });
}
