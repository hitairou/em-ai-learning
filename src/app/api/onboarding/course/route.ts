import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { courseSchema, firstZodError } from "@/lib/validation";

export async function POST(request: Request) {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  const parsed = courseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
  }
  const diagnostic = await db.diagnosticAttempt.findFirst({
    where: { userId: auth.user.id, course: parsed.data.course },
    select: { id: true },
  });
  await db.user.update({
    where: { id: auth.user.id },
    data: {
      selectedCourse: parsed.data.course,
      learningPurpose: parsed.data.learningPurpose,
      diagnosticCompleted: Boolean(diagnostic),
      onboardingCompleted: Boolean(diagnostic),
    },
  });
  return NextResponse.json({ ok: true });
}
