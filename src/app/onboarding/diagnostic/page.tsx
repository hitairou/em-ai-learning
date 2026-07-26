import DiagnosticClient from "@/components/DiagnosticClient";
import DiagnosticSkipButton from "@/components/DiagnosticSkipButton";
import { requireSelectedCourse } from "@/lib/auth/user";
import { db } from "@/lib/db";
import { toProblemView } from "@/lib/problems";
import { COURSE_LABELS } from "@/lib/constants";
import type { Course } from "@/types/learning";

export const metadata = { title: "5問診断" };
export default async function DiagnosticPage() {
  const user = await requireSelectedCourse();
  const problems = await db.problem.findMany({ where: { course: user.selectedCourse!, sourceType: "diagnostic" }, orderBy: { id: "asc" }, take: 5 });
  return <div className="narrowPage diagnosticPage"><div className="stepHeader"><span>STEP 2 / 2 ・ {COURSE_LABELS[user.selectedCourse as Course]}</span><h1>5問で現在地を確認</h1><p>分からなくても大丈夫です。回答時間と選択肢から、最初に復習する単元を決めます。</p></div><DiagnosticClient questions={problems.map((problem) => toProblemView(problem))} /><div className="diagnosticSkipArea"><DiagnosticSkipButton /></div></div>;
}
