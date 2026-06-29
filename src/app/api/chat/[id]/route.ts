import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { parseJson } from "@/lib/json";
import type { QuestionAnalysis } from "@/types/learning";

export async function GET(_request: Request, context: RouteContext<"/api/chat/[id]">) {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  const { id } = await context.params;
  const session = await db.questionSession.findFirst({
    where: { id, userId: auth.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!session) return NextResponse.json({ error: "質問が見つかりません" }, { status: 404 });
  return NextResponse.json({
    session: {
      id: session.id,
      course: session.course,
      inputType: session.inputType,
      extractedText: session.extractedText,
      detectedTopic: session.detectedTopic,
      analysis: parseJson<QuestionAnalysis | null>(session.aiSummary, null),
    },
    messages: session.messages.map((message) => ({
      ...message,
      content:
        message.role === "assistant"
          ? parseJson<QuestionAnalysis | string>(message.content, message.content)
          : message.content,
    })),
  });
}
