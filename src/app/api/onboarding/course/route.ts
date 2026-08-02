import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { courseSchema, firstZodError } from "@/lib/validation";

export async function POST(request: Request) {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  const payload = await requestPayload(request);
  const parsed = courseSchema.safeParse(payload);
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
  if (prefersHtml(request)) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: "/onboarding/diagnostic",
        "Cache-Control": "private, no-store",
      },
    });
  }
  return NextResponse.json({ ok: true });
}

async function requestPayload(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    return {
      course: form.get("course"),
      learningPurpose: form.get("learningPurpose"),
    };
  }
  return request.json().catch(() => null);
}

function prefersHtml(request: Request) {
  const accept = request.headers.get("accept") ?? "";
  return accept.includes("text/html") && !accept.includes("application/json");
}
