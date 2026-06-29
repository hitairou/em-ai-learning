import { NextResponse } from "next/server";
import { z } from "zod";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { analyzeQuestion } from "@/lib/ai/analyzeQuestion";
import type { Course } from "@/types/learning";

const schema = z.object({ sessionId: z.string().min(1) });

export async function POST(request: Request) {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "質問IDを確認してください" }, { status: 400 });
  const session = await db.questionSession.findFirst({
    where: { id: parsed.data.sessionId, userId: auth.user.id },
  });
  if (!session) return NextResponse.json({ error: "質問が見つかりません" }, { status: 404 });
  const analysis = await analyzeQuestion({
    text: session.extractedText,
    selectedCourse: session.course as Course,
    imagePath: session.inputType === "image" ? session.originalFilePath : null,
  });
  await db.questionSession.update({
    where: { id: session.id },
    data: { detectedTopic: analysis.topic, aiSummary: JSON.stringify(analysis) },
  });
  return NextResponse.json({ analysis });
}
