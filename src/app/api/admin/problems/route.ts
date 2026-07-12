import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { apiAdmin } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { problemData } from "@/lib/admin";
import { enforceReviewState } from "@/lib/problem-policy";
import { toProblemView } from "@/lib/problems";
import { firstZodError, problemReviewSchema, problemSchema } from "@/lib/validation";

const PAGE_SIZE = 30;

export async function GET(request: NextRequest) {
  const auth = await apiAdmin();
  if (auth.error) return auth.error;
  const params = request.nextUrl.searchParams;
  const difficulty = Number(params.get("difficulty"));
  const active = params.get("isActive");
  const page = Math.max(1, Number(params.get("page")) || 1);
  const where: Prisma.ProblemWhereInput = {
    appQuestionId: params.get("q") ? { contains: params.get("q")! } : { not: null },
    ...(params.get("course") ? { course: params.get("course")! } : {}),
    ...(params.get("unit") ? { unit: params.get("unit")! } : {}),
    ...(params.get("topic") ? { topic: params.get("topic")! } : {}),
    ...(params.get("subtopic") ? { subtopic: params.get("subtopic")! } : {}),
    ...(Number.isInteger(difficulty) && difficulty >= 1 && difficulty <= 5 ? { difficulty } : {}),
    ...(params.get("answerKind") ? { answerKind: params.get("answerKind")! } : {}),
    ...(params.get("humanReviewStatus") ? { humanReviewStatus: params.get("humanReviewStatus")! } : {}),
    ...(params.get("verificationStatus") ? { verificationStatus: params.get("verificationStatus")! } : {}),
    ...(active === "true" || active === "false" ? { isActive: active === "true" } : {}),
  };
  const [problems, total, units, topics, subtopics] = await Promise.all([
    db.problem.findMany({ where, orderBy: [{ appQuestionId: "asc" }, { createdAt: "asc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.problem.count({ where }),
    db.problem.findMany({ where: { appQuestionId: { not: null } }, distinct: ["unit"], select: { unit: true }, orderBy: { unit: "asc" } }),
    db.problem.findMany({ where: { appQuestionId: { not: null } }, distinct: ["topic"], select: { topic: true }, orderBy: { topic: "asc" } }),
    db.problem.findMany({ where: { appQuestionId: { not: null }, subtopic: { not: null } }, distinct: ["subtopic"], select: { subtopic: true }, orderBy: { subtopic: "asc" } }),
  ]);
  return NextResponse.json({
    problems: problems.map((problem) => toProblemView(problem, true)),
    pagination: { page, pageSize: PAGE_SIZE, total, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) },
    filters: { units: units.map((item) => item.unit), topics: topics.map((item) => item.topic), subtopics: subtopics.map((item) => item.subtopic).filter(Boolean) },
  });
}

export async function POST(request: Request) {
  const auth = await apiAdmin();
  if (auth.error) return auth.error;
  const parsed = problemSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const problem = await db.problem.create({ data: problemData(parsed.data) });
  return NextResponse.json({ problem: toProblemView(problem, true) }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await apiAdmin();
  if (auth.error) return auth.error;
  const parsed = problemReviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const problems = await db.problem.findMany({ where: { id: { in: parsed.data.ids } } });
  if (problems.length !== parsed.data.ids.length) return NextResponse.json({ error: "対象問題を確認できませんでした" }, { status: 404 });
  await db.$transaction(problems.map((problem) => db.problem.update({
    where: { id: problem.id },
    data: enforceReviewState(problem, parsed.data),
  })));
  return NextResponse.json({ updatedCount: problems.length });
}
