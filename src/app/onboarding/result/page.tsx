import DiagnosticResultCard from "@/components/DiagnosticResultCard";
import { requireSelectedCourse } from "@/lib/auth/user";
import { db } from "@/lib/db";
import { getCurrentDiagnosticScore } from "@/lib/diagnostic-score";

export const metadata = { title: "診断結果" };
export default async function ResultPage() {
  const user = await requireSelectedCourse();
  const [attempt, currentScore, skills] = await Promise.all([db.diagnosticAttempt.findFirst({ where: { userId: user.id, course: user.selectedCourse! }, orderBy: { completedAt: "desc" } }), getCurrentDiagnosticScore(db, { userId: user.id, course: user.selectedCourse! }), db.userSkillProfile.findMany({ where: { userId: user.id, course: user.selectedCourse! }, orderBy: { score: "asc" }, take: 3 })]);
  if (!attempt) return <div className="narrowPage"><div className="emptyState">診断結果がありません。先に5問診断を受けてください。</div></div>;
  const score = currentScore ?? attempt.score;
  const level = score >= 80 ? "標準問題へ進めます" : score >= 60 ? "基礎はあと一歩です" : "まず基礎を固めましょう";
  return <div className="narrowPage"><div className="stepHeader"><span>DIAGNOSIS COMPLETE</span><h1>あなたの現在地</h1><p>5問診断と演習履歴から、優先単元を更新しています。</p></div><DiagnosticResultCard score={score} level={level} weakTopics={skills.map(({ topic, score }) => ({ topic, score }))} recommendation={skills[0]?.topic ?? "基礎確認"} /></div>;
}
