import Link from "next/link";
import { ArrowRight, Camera, ChevronRight, Dumbbell, Flame, RotateCcw, UserRound } from "lucide-react";
import { requireCompletedUser } from "@/lib/auth/user";
import { db } from "@/lib/db";
import { MISTAKE_LABELS } from "@/lib/constants";
import type { MisconceptionType } from "@/types/learning";
import TodayTaskCard from "@/components/TodayTaskCard";
import SkillProgressCard from "@/components/SkillProgressCard";
import { getCurrentDiagnosticScore } from "@/lib/diagnostic-score";
import { findNextPracticeProblem } from "@/lib/problem-bank";
import { publishedProblemWhere } from "@/lib/problem-policy";
import { getUnitSkillSummaries } from "@/lib/skill-summary";

export const metadata = { title: "ホーム" };
export default async function HomePage() {
  const user = await requireCompletedUser();
  const [diagnosticScore, skills, mistakes] = await Promise.all([
    getCurrentDiagnosticScore(db, { userId: user.id, course: user.selectedCourse! }),
    getUnitSkillSummaries(db, { userId: user.id, course: user.selectedCourse!, includeZero: false }),
    db.practiceAttempt.findMany({ where: { userId: user.id, isCorrect: false, problem: { is: { ...publishedProblemWhere, course: user.selectedCourse! } } }, include: { problem: true }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);
  const mode = user.learningPurpose === "exam" ? "exam" : user.learningPurpose === "foundation" ? "foundation" : "standard";
  const recommendation = await findNextPracticeProblem({ userId: user.id, course: user.selectedCourse!, mode });
  const diagnosticProgress = diagnosticScore === null ? null : Math.min(100, Math.max(0, diagnosticScore));
  return <div className="dashboardPage">
    <section className="dashboardGreeting"><div><span className="eyebrow">TODAY</span><h1>{user.name}さん、<br />今日やることです。</h1><p>{diagnosticScore === null ? "まず5問診断で現在地を確認しましょう。" : "一番優先度の高い単元から、短く始めましょう。"}</p></div><Link href={diagnosticScore === null ? "/onboarding/diagnostic" : "/profile"} className={`diagnosticDial ${diagnosticScore === null ? "pending" : ""}`} style={{ background: diagnosticProgress === null ? undefined : `conic-gradient(var(--teal) ${diagnosticProgress}%, var(--mint) 0)` }}><span>{diagnosticScore === null ? "未診断" : "総合診断"}</span><strong>{diagnosticScore === null ? "開始" : diagnosticScore}</strong><small>{diagnosticScore === null ? "5問" : "/100"}</small></Link></section>
    <section className="quickActions"><Link href="/camera" className="quickAction photo"><Camera /><span><strong>写真で質問</strong><small>課題を撮る</small></span><ChevronRight /></Link><Link href="/practice" className="quickAction practice"><Dumbbell /><span><strong>演習</strong><small>苦手から1問</small></span><ChevronRight /></Link><Link href="/review" className="quickAction review"><RotateCcw /><span><strong>優先復習</strong><small>{mistakes.length}件のミス</small></span><ChevronRight /></Link><Link href="/profile" className="quickAction history"><UserRound /><span><strong>マイページ</strong><small>到達度と設定</small></span><ChevronRight /></Link></section>
    <div className="dashboardGrid"><section><div className="sectionHeading"><div><span className="eyebrow">NEXT ONE</span><h2>今日のおすすめ問題</h2></div><Flame /></div><TodayTaskCard problem={recommendation ? { id: recommendation.id, title: recommendation.title, topic: recommendation.topic, difficulty: recommendation.difficulty, questionText: recommendation.questionText } : null} /></section>
      <section className="panel"><div className="sectionHeading"><div><span className="eyebrow">PROGRESS</span><h2>単元別の現在地</h2></div><Link href="/profile">すべて見る <ArrowRight size={15} /></Link></div><div className="skillList">{skills.length ? skills.slice(0, 5).map((skill) => <SkillProgressCard key={skill.unit} topic={skill.unit} score={skill.score} attempts={skill.attempts} href={`/practice?mode=standard&unit=${encodeURIComponent(skill.unit)}`} />) : <div className="emptyState">演習後に到達度が表示されます。</div>}</div></section>
    </div>
    <section className="panel"><div className="sectionHeading"><div><span className="eyebrow">RECENT MISSES</span><h2>直近のミス</h2></div><Link href="/review">復習キューへ <ArrowRight size={15} /></Link></div>{mistakes.length ? <div className="mistakeList">{mistakes.map((item) => <Link key={item.id} href={`/practice/${item.problemId}`}><span>{item.problem.topic}</span><strong>{item.problem.title}</strong><small>{MISTAKE_LABELS[item.mistakeType as MisconceptionType] ?? item.mistakeType}</small><ChevronRight /></Link>)}</div> : <div className="emptyState">最近のミスはありません。おすすめ問題から始めましょう。</div>}</section>
    <Link className="examBanner" href="/practice"><span><small>試験前の優先復習</small><strong>試験対策モードで頻出構造を確認</strong></span><ArrowRight /></Link>
  </div>;
}
