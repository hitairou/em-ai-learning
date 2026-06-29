import { NextRequest, NextResponse } from "next/server";
import { apiAdmin } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { problemData } from "@/lib/admin";
import { toProblemView } from "@/lib/problems";
import { firstZodError, problemSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const auth = await apiAdmin();
  if (auth.error) return auth.error;
  const course = request.nextUrl.searchParams.get("course");
  const unit = request.nextUrl.searchParams.get("unit");
  const sourceType = request.nextUrl.searchParams.get("sourceType");
  const difficulty = Number(request.nextUrl.searchParams.get("difficulty"));
  const problems = await db.problem.findMany({
    where: {
      ...(course ? { course } : {}),
      ...(unit ? { unit } : {}),
      ...(sourceType ? { sourceType } : {}),
      ...(Number.isInteger(difficulty) && difficulty >= 1 && difficulty <= 5 ? { difficulty } : {}),
    },
    orderBy: [{ course: "asc" }, { unit: "asc" }, { createdAt: "desc" }],
    take: 200,
  });
  return NextResponse.json({ problems: problems.map((problem) => toProblemView(problem, true)) });
}

export async function POST(request: Request) {
  const auth = await apiAdmin();
  if (auth.error) return auth.error;
  const parsed = problemSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const problem = await db.problem.create({ data: problemData(parsed.data) });
  return NextResponse.json({ problem: toProblemView(problem, true) }, { status: 201 });
}
