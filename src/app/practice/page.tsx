import PracticeHub from "@/components/PracticeHub";
import { requireCompletedUser } from "@/lib/auth/user";
import { findNextPracticeProblem } from "@/lib/problem-bank";
import { toProblemView } from "@/lib/problems";

export const metadata = { title: "演習" };

export default async function PracticePage() {
  const user = await requireCompletedUser();
  const problem = await findNextPracticeProblem({ userId: user.id, course: user.selectedCourse!, mode: "foundation" });
  return (
    <div className="contentPage">
      <div className="pageHeader">
        <span className="eyebrow">ADAPTIVE PRACTICE</span>
        <h1>演習</h1>
        <p>モードを選ぶと、苦手と履歴に合わせて次の1問を決めます。</p>
      </div>
      <PracticeHub initialProblem={problem ? toProblemView(problem) : null} />
    </div>
  );
}
