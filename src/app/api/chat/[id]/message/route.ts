import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { analyzeQuestion } from "@/lib/ai/analyzeQuestion";
import { ELECTROMAGNETISM_ONLY_MESSAGE, shouldAcceptFollowUpQuestion } from "@/lib/question-relevance";
import { withRelatedProblem } from "@/lib/question-related-problem";
import { chatMessageSchema, firstZodError } from "@/lib/validation";
import type { Course } from "@/types/learning";

export async function POST(request: Request, context: RouteContext<"/api/chat/[id]/message">) {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  const { id } = await context.params;
  const parsed = chatMessageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const session = await db.questionSession.findFirst({ where: { id, userId: auth.user.id } });
  if (!session) return NextResponse.json({ error: "質問が見つかりません" }, { status: 404 });
  if (!shouldAcceptFollowUpQuestion(parsed.data.content)) {
    return NextResponse.json({ error: ELECTROMAGNETISM_ONLY_MESSAGE }, { status: 400 });
  }
  const baseAnalysis = await analyzeQuestion({
    text: `元の問題:\n${session.extractedText}\n\n追加質問:\n${parsed.data.content}`,
    selectedCourse: session.course as Course,
    learnerContext: "追加質問には答えだけでなく、考え方を先に説明する",
  });
  const analysis = await withRelatedProblem({ userId: auth.user.id, analysis: baseAnalysis });
  await db.$transaction([
    db.chatMessage.create({ data: { sessionId: id, role: "user", content: parsed.data.content } }),
    db.chatMessage.create({ data: { sessionId: id, role: "assistant", content: JSON.stringify(analysis) } }),
    db.questionSession.update({ where: { id }, data: { aiSummary: JSON.stringify(analysis), detectedTopic: analysis.topic } }),
  ]);
  return NextResponse.json({ analysis });
}
