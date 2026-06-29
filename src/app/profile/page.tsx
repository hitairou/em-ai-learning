import Link from "next/link";
import { CalendarDays, History, LogOut, Settings } from "lucide-react";
import ProfileStatsCard from "@/components/ProfileStatsCard";
import SkillProgressCard from "@/components/SkillProgressCard";
import { requireCompletedUser } from "@/lib/auth/user";
import { db } from "@/lib/db";
import { COURSE_LABELS, PURPOSE_LABELS } from "@/lib/constants";
import type { Course, LearningPurpose } from "@/types/learning";

function dayKey(date: Date) { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(date); }
export const metadata = { title: "マイページ" };
export default async function ProfilePage() {
  const user = await requireCompletedUser();
  const [attempts, skills] = await Promise.all([db.practiceAttempt.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }), db.userSkillProfile.findMany({ where: { userId: user.id, course: user.selectedCourse! }, orderBy: { score: "asc" } })]);
  const correct = attempts.filter((item) => item.isCorrect).length;
  const days = new Set(attempts.map((item) => dayKey(item.createdAt))); let streak = 0; const cursor = new Date(); while (days.has(dayKey(cursor))) { streak++; cursor.setDate(cursor.getDate() - 1); }
  return <div className="contentPage"><section className="profileHero"><div className="avatar">{user.name.slice(0, 1)}</div><div><span>{COURSE_LABELS[user.selectedCourse as Course]}</span><h1>{user.name}</h1><p>{user.email}</p></div></section><ProfileStatsCard solved={attempts.length} correctRate={attempts.length ? Math.round((correct / attempts.length) * 100) : 0} streak={streak} /><div className="profileGrid"><section className="panel"><div className="sectionHeading"><div><span className="eyebrow">SKILLS</span><h2>単元別到達度</h2></div></div><div className="skillList">{skills.length ? skills.map((skill) => <SkillProgressCard key={skill.id} topic={skill.topic} score={skill.score} attempts={skill.attempts} />) : <div className="emptyState">学習データはまだありません。</div>}</div></section><aside className="panel accountPanel"><h2>学習設定</h2><div className="accountRow"><Settings /><span><small>学習目的</small><strong>{PURPOSE_LABELS[user.learningPurpose as LearningPurpose] ?? "未設定"}</strong></span></div><div className="accountRow"><CalendarDays /><span><small>登録日</small><strong>{user.createdAt.toLocaleDateString("ja-JP")}</strong></span></div><Link href="/history"><History /> 学習履歴を見る</Link><Link href="/onboarding/course"><Settings /> 科目・目的を変更</Link><Link href="/logout"><LogOut /> ログアウト</Link></aside></div></div>;
}
