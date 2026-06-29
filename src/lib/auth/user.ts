import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth/session";

export const getCurrentUser = cache(async () => {
  const session = await readSession();
  if (!session) return null;
  return db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      selectedCourse: true,
      learningPurpose: true,
      onboardingCompleted: true,
      diagnosticCompleted: true,
      createdAt: true,
    },
  });
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireSelectedCourse() {
  const user = await requireUser();
  if (!user.selectedCourse) redirect("/onboarding/course");
  return user;
}

export async function requireCompletedUser() {
  const user = await requireSelectedCourse();
  if (!user.diagnosticCompleted) redirect("/onboarding/diagnostic");
  return user;
}

export async function requireAdmin() {
  const user = await requireCompletedUser();
  if (user.role !== "admin") redirect("/home");
  return user;
}
