import "server-only";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth/session";
import { normalizeCourse } from "@/lib/courses";
import { hasCurrentConsent } from "@/lib/legal/config";

export async function getCurrentUser() {
  const session = await readSession();
  if (!session) return null;
  const user = await db.user.findUnique({
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
      termsVersion: true,
      privacyVersion: true,
    },
  });
  if (!user) return null;
  const selectedCourse = normalizeCourse(user.selectedCourse);
  if (user.selectedCourse && selectedCourse && selectedCourse !== user.selectedCourse) {
    await db.user.update({ where: { id: user.id }, data: { selectedCourse } });
  }
  return { ...user, selectedCourse };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasCurrentConsent(user)) redirect("/legal/consent");
  return user;
}

export async function requireSelectedCourse() {
  const user = await requireUser();
  if (!user.selectedCourse) redirect("/onboarding/course");
  return user;
}

export async function requireCompletedUser() {
  const user = await requireUser();
  if (!hasCurrentConsent(user)) redirect("/legal/consent");
  if (!user.selectedCourse) redirect("/onboarding/course");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/home");
  return user;
}
