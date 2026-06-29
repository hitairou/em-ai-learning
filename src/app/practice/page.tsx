import PracticeHub from "@/components/PracticeHub";
import { requireCompletedUser } from "@/lib/auth/user";
import { db } from "@/lib/db";
import { toProblemView } from "@/lib/problems";

export const metadata = { title: "AI演習" };
export default async function PracticePage() {
  const user = await requireCompletedUser();
  const weak = await db.userSkillProfile.findFirst({ where: { userId: user.id, course: user.selectedCourse! }, orderBy: { score: "asc" } });
  const problem = await db.problem.findFirst({ where: { course: user.selectedCourse!, sourceType: "exercise", ...(weak ? { topic: weak.topic } : {}) }, orderBy: { difficulty: "asc" } }) ?? await db.problem.findFirst({ where: { course: user.selectedCourse!, sourceType: "exercise" }, orderBy: { difficulty: "asc" } });
  return <div className="contentPage"><div className="pageHeader"><span className="eyebrow">ADAPTIVE PRACTICE</span><h1>AI演習</h1><p>モードを選ぶと、苦手と履歴に合わせて次の1問を決めます。</p></div><PracticeHub initialProblem={problem ? toProblemView(problem) : null} /></div>;
}
