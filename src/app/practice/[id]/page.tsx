import { notFound } from "next/navigation";
import PracticeQuestionCard from "@/components/PracticeQuestionCard";
import { requireCompletedUser } from "@/lib/auth/user";
import { db } from "@/lib/db";
import { toProblemView } from "@/lib/problems";

export default async function PracticeProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCompletedUser();
  const { id } = await params;
  const problem = await db.problem.findFirst({ where: { id, course: user.selectedCourse! } });
  if (!problem) notFound();
  return <div className="contentPage"><PracticeQuestionCard problem={toProblemView(problem)} /></div>;
}
