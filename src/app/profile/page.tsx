import Link from "next/link";
import { CalendarDays, History, LogOut, Settings, TriangleAlert } from "lucide-react";
import LearningResetButton from "@/components/LearningResetButton";
import AccountDeleteButton from "@/components/AccountDeleteButton";
import ProfileStatsCard from "@/components/ProfileStatsCard";
import SkillProgressCard from "@/components/SkillProgressCard";
import { requireCompletedUser } from "@/lib/auth/user";
import { db } from "@/lib/db";
import { parseJson } from "@/lib/json";
import { COURSE_LABELS, MISTAKE_LABELS, PURPOSE_LABELS } from "@/lib/constants";
import { getUnitSkillSummaries } from "@/lib/skill-summary";
import { publishedProblemWhere } from "@/lib/problem-policy";
import type { Course, LearningPurpose, MisconceptionType } from "@/types/learning";

function dayKey(date: Date) { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(date); }
export const metadata = { title: "マイページ" };
export default async function ProfilePage() {
  const user = await requireCompletedUser();
  const courseLabel = COURSE_LABELS[user.selectedCourse as Course];
  const [attempts, skills, skillProfiles] = await Promise.all([db.practiceAttempt.findMany({ where: { userId: user.id, problem: { is: { ...publishedProblemWhere, course: user.selectedCourse! } } }, orderBy: { createdAt: "desc" } }), getUnitSkillSummaries(db, { userId: user.id, course: user.selectedCourse!, includeZero: true }), db.userSkillProfile.findMany({ where: { userId: user.id, course: user.selectedCourse! } })]);
  const correct = attempts.filter((item) => item.isCorrect).length;
  const days = new Set(attempts.map((item) => dayKey(item.createdAt))); let streak = 0; const cursor = new Date(); while (days.has(dayKey(cursor))) { streak++; cursor.setDate(cursor.getDate() - 1); }
  const ranking = new Map<string, number>();
  for (const skill of skillProfiles) for (const [type, count] of Object.entries(parseJson<Record<string, number>>(skill.mistakeTypesJson, {}))) if (type !== "correct") ranking.set(type, (ranking.get(type) ?? 0) + count);
  return <div className="contentPage"><section className="profileHero"><div className="avatar">{user.name.slice(0, 1)}</div><div><span>{courseLabel}</span><h1>{user.name}</h1><p>{user.email}</p></div></section><ProfileStatsCard solved={attempts.length} correctRate={attempts.length ? Math.round((correct / attempts.length) * 100) : 0} streak={streak} /><div className="profileGrid"><section className="profileMainStack"><section className="panel"><div className="sectionHeading"><div><span className="eyebrow">SKILLS</span><h2>単元別到達度</h2></div></div><div className="skillList">{skills.length ? skills.map((skill) => <SkillProgressCard key={skill.unit} topic={skill.unit} score={skill.score} attempts={skill.attempts} href={`/practice?mode=standard&unit=${encodeURIComponent(skill.unit)}`} />) : <div className="emptyState">学習データはまだありません。</div>}</div></section><section className="panel rankingPanel"><div className="sectionHeading"><div><span className="eyebrow">CAUSES</span><h2>誤答原因ランキング</h2></div><TriangleAlert /></div>{ranking.size ? [...ranking.entries()].sort((a, b) => b[1] - a[1]).map(([type, count], index) => <div className="rankingRow" key={type}><span>{index + 1}</span><strong>{MISTAKE_LABELS[type as MisconceptionType] ?? type}</strong><small>{count}回</small></div>) : <div className="emptyState">誤答データはありません。</div>}</section></section><aside className="panel accountPanel"><h2>学習設定</h2><div className="accountRow"><Settings /><span><small>学習目的</small><strong>{PURPOSE_LABELS[user.learningPurpose as LearningPurpose] ?? "未設定"}</strong></span></div><div className="accountRow"><CalendarDays /><span><small>登録日</small><strong>{user.createdAt.toLocaleDateString("ja-JP")}</strong></span></div><Link href="/review"><History /> 復習と履歴を見る</Link><Link href="/onboarding/course"><Settings /> 科目・目的を変更</Link><Link href="/logout"><LogOut /> ログアウト</Link><LearningResetButton courseLabel={courseLabel} /><AccountDeleteButton /></aside></div></div>;
}
