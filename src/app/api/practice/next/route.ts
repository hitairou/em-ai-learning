import { NextRequest, NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { findPracticeRecommendations, findPracticeUnitOptions, type PracticeSort } from "@/lib/problem-bank";
import { toProblemView } from "@/lib/problems";
import type { PracticeMode } from "@/types/learning";

const modes = new Set<PracticeMode>(["foundation", "standard", "exam"]);
const sorts = new Set<PracticeSort>(["achievement", "attempts", "stale"]);

export async function GET(request: NextRequest) {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  if (!auth.user.selectedCourse) {
    return NextResponse.json({ error: "科目を選択してください" }, { status: 409 });
  }
  const requestedMode = request.nextUrl.searchParams.get("mode") as PracticeMode;
  const mode = modes.has(requestedMode) ? requestedMode : "foundation";
  const requestedSort = request.nextUrl.searchParams.get("sort") as PracticeSort;
  const sort = sorts.has(requestedSort) ? requestedSort : "achievement";
  const units = request.nextUrl.searchParams.getAll("unit").filter(Boolean);
  const [recommendations, unitOptions] = await Promise.all([
    findPracticeRecommendations({
      userId: auth.user.id,
      course: auth.user.selectedCourse,
      mode,
      sort,
      units,
    }),
    findPracticeUnitOptions({ course: auth.user.selectedCourse, mode }),
  ]);
  if (!recommendations.length) {
    return NextResponse.json({ problems: [], units: unitOptions, source: "database" });
  }
  return NextResponse.json({
    problems: recommendations.map((item) => ({
      ...toProblemView(item.problem),
      topicScore: item.topicScore,
      attemptCount: item.attemptCount,
      lastAttemptAt: item.lastAttemptAt?.toISOString() ?? null,
    })),
    units: unitOptions,
    source: "database",
  });
}
