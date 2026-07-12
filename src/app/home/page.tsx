import Link from "next/link";
import { ArrowRight, Camera, ChevronRight, Dumbbell, Flame, RotateCcw } from "lucide-react";
import { requireCompletedUser } from "@/lib/auth/user";
import { db } from "@/lib/db";
import { COURSE_LABELS, MISTAKE_LABELS } from "@/lib/constants";
import type { Course, MisconceptionType } from "@/types/learning";
import TodayTaskCard from "@/components/TodayTaskCard";
import SkillProgressCard from "@/components/SkillProgressCard";
import { findNextPracticeProblem } from "@/lib/problem-bank";
import { publishedProblemWhere } from "@/lib/problem-policy";

export const metadata = { title: "ホーム" };
export default async function HomePage() {
  const user = await requireCompletedUser();
  const [diagnostic, skills, mistakes] = await Promise.all([
    db.diagnosticAttempt.findFirst({ where: { userId: user.id, course: user.selectedCourse! }, orderBy: { completedAt: "desc" } }),
    db.userSkillProfile.findMany({ where: { userId: user.id, course: user.selectedCourse! }, orderBy: { score: "asc" } }),
    db.practiceAttempt.findMany({ where: { userId: user.id, isCorrect: false, problem: { is: publishedProblemWhere } }, include: { problem: true }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);
  const mode = user.learningPurpose === "exam" ? "exam" : user.learningPurpose === "foundation" ? "foundation" : "standard";
  const recommendation = await findNextPracticeProblem({ userId: user.id, course: user.selectedCourse!, mode });
  return <div className="dashboardPage">
    <section className="dashboardGreeting"><div><span className="eyebrow">{COURSE_LABELS[user.selectedCourse as Course]} / TODAY</span><h1>{user.name}さん、<br />今日やることです。</h1><p>一番優先度の高い単元から、短く始めましょう。</p></div><div className="diagnosticDial"><span>診断</span><strong>{diagnostic?.score ?? 0}</strong><small>/100</small></div></section>
    <section className="quickActions"><Link href="/camera" className="quickAction photo"><Camera /><span><strong>写真で質問</strong><small>課題を撮る</small></span><ChevronRight /></Link><Link href="/practice" className="quickAction"><Dumbbell /><span><strong>演習</strong><small>苦手から1問</small></span><ChevronRight /></Link><Link href="/review" className="quickAction"><RotateCcw /><span><strong>優先復習</strong><small>{mistakes.length}件のミス</small></span><ChevronRight /></Link></section>
    <div className="dashboardGrid"><section><div className="sectionHeading"><div><span className="eyebrow">NEXT ONE</span><h2>今日のおすすめ問題</h2></div><Flame /></div><TodayTaskCard problem={recommendation ? { id: recommendation.id, title: recommendation.title, topic: recommendation.topic, difficulty: recommendation.difficulty, questionText: recommendation.questionText } : null} /></section>
      <section className="panel"><div className="sectionHeading"><div><span className="eyebrow">PROGRESS</span><h2>単元別の現在地</h2></div><Link href="/profile">すべて見る <ArrowRight size={15} /></Link></div><div className="skillList">{skills.length ? skills.slice(0, 5).map((skill) => <SkillProgressCard key={skill.id} topic={skill.topic} score={skill.score} attempts={skill.attempts} />) : <div className="emptyState">演習後に到達度が表示されます。</div>}</div></section>
    </div>
    <section className="panel"><div className="sectionHeading"><div><span className="eyebrow">RECENT MISSES</span><h2>直近のミス</h2></div><Link href="/review">復習キューへ <ArrowRight size={15} /></Link></div>{mistakes.length ? <div className="mistakeList">{mistakes.map((item) => <Link key={item.id} href={`/practice/${item.problemId}`}><span>{item.problem.topic}</span><strong>{item.problem.title}</strong><small>{MISTAKE_LABELS[item.mistakeType as MisconceptionType] ?? item.mistakeType}</small><ChevronRight /></Link>)}</div> : <div className="emptyState">最近のミスはありません。おすすめ問題から始めましょう。</div>}</section>
    <Link className="examBanner" href="/practice"><span><small>試験前の優先復習</small><strong>試験対策モードで頻出構造を確認</strong></span><ArrowRight /></Link>
  </div>;
}
