import fs from "node:fs/promises";
import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { isInsideUploadRoot } from "@/lib/uploads";

export async function POST() {
  const auth = await apiUser();
  if (auth.error || !auth.user) return auth.error;
  const course = auth.user.selectedCourse;
  if (!course) return NextResponse.json({ error: "科目を選択してください" }, { status: 409 });

  const sessions = await db.questionSession.findMany({
    where: { userId: auth.user.id, course },
    select: { originalFilePath: true },
  });
  const files = sessions.flatMap((session) => {
    const filePath = session.originalFilePath;
    return filePath && isInsideUploadRoot(filePath) ? [filePath] : [];
  });

  const result = await db.$transaction(async (tx) => {
    const [practiceAttempts, diagnosticAttempts, skillProfiles, questionSessions] = await Promise.all([
      tx.practiceAttempt.deleteMany({
        where: { userId: auth.user.id, problem: { is: { course } } },
      }),
      tx.diagnosticAttempt.deleteMany({
        where: { userId: auth.user.id, course },
      }),
      tx.userSkillProfile.deleteMany({
        where: { userId: auth.user.id, course },
      }),
      tx.questionSession.deleteMany({
        where: { userId: auth.user.id, course },
      }),
    ]);
    const remainingDiagnostic = await tx.diagnosticAttempt.findFirst({
      where: { userId: auth.user.id, course },
      select: { id: true },
    });
    await tx.user.update({
      where: { id: auth.user.id },
      data: { diagnosticCompleted: Boolean(remainingDiagnostic) },
    });
    return {
      practiceAttempts: practiceAttempts.count,
      diagnosticAttempts: diagnosticAttempts.count,
      skillProfiles: skillProfiles.count,
      questionSessions: questionSessions.count,
    };
  });

  await Promise.all(files.map((filePath) => fs.unlink(filePath).catch(() => undefined)));

  return NextResponse.json({ ok: true, course, deleted: result });
}
