import DiagnosticResultCard from "@/components/DiagnosticResultCard";
import { requireSelectedCourse } from "@/lib/auth/user";
import { db } from "@/lib/db";

export const metadata = { title: "診断結果" };
export default async function ResultPage() {
  const user = await requireSelectedCourse();
  const [attempt, skills] = await Promise.all([db.diagnosticAttempt.findFirst({ where: { userId: user.id, course: user.selectedCourse! }, orderBy: { completedAt: "desc" } }), db.userSkillProfile.findMany({ where: { userId: user.id, course: user.selectedCourse! }, orderBy: { score: "asc" }, take: 3 })]);
  if (!attempt) return <div className="narrowPage"><div className="emptyState">診断結果がありません。先に5問診断を受けてください。</div></div>;
  const level = attempt.score >= 80 ? "標準問題へ進めます" : attempt.score >= 60 ? "基礎はあと一歩です" : "まず基礎を固めましょう";
  return <div className="narrowPage"><div className="stepHeader"><span>DIAGNOSIS COMPLETE</span><h1>あなたのスタート地点</h1><p>正答率だけでなく、回答時間と誤答原因から優先単元を決めました。</p></div><DiagnosticResultCard score={attempt.score} level={level} weakTopics={skills.map(({ topic, score }) => ({ topic, score }))} recommendation={skills[0]?.topic ?? "基礎確認"} /></div>;
}
