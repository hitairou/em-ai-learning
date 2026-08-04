import PracticeHub from "@/components/PracticeHub";
import ProblemSearchButton from "@/components/ProblemSearchButton";
import { requireCompletedUser } from "@/lib/auth/user";
import { findPracticeRecommendations, findPracticeUnitOptions } from "@/lib/problem-bank";
import { toProblemView } from "@/lib/problems";
import type { PracticeMode } from "@/types/learning";

export const metadata = { title: "演習" };

const modes = new Set<PracticeMode>(["foundation", "standard", "exam"]);

export default async function PracticePage({ searchParams }: { searchParams: Promise<{ mode?: string; unit?: string | string[] }> }) {
  const user = await requireCompletedUser();
  const params = await searchParams;
  const requestedMode = params.mode as PracticeMode;
  const mode = modes.has(requestedMode) ? requestedMode : "foundation";
  const initialUnits = typeof params.unit === "string" ? [params.unit] : Array.isArray(params.unit) ? params.unit : [];
  const [recommendations, topics] = await Promise.all([
    findPracticeRecommendations({ userId: user.id, course: user.selectedCourse!, mode, units: initialUnits }),
    findPracticeUnitOptions({ course: user.selectedCourse!, mode }),
  ]);
  return (
    <div className="contentPage">
      <div className="pageHeader">
        <span className="eyebrow">ADAPTIVE PRACTICE</span>
        <div className="pageTitleWithAction"><h1>演習</h1><ProblemSearchButton /></div>
        <p>モードを選ぶと、苦手と履歴に合わせて候補を並べます。</p>
      </div>
      <PracticeHub initialMode={mode} initialSelectedUnits={initialUnits} initialProblems={recommendations.map((item) => ({
        ...toProblemView(item.problem),
        topicScore: item.topicScore,
        attemptCount: item.attemptCount,
        lastAttemptAt: item.lastAttemptAt?.toISOString() ?? null,
      }))} initialUnits={topics} />
    </div>
  );
}
