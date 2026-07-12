import Link from "next/link";
import { ArrowRight, TriangleAlert } from "lucide-react";
import ReviewQueueCard from "@/components/ReviewQueueCard";
import { requireCompletedUser } from "@/lib/auth/user";
import { db } from "@/lib/db";
import { parseJson } from "@/lib/json";
import { MISTAKE_LABELS } from "@/lib/constants";
import type { MisconceptionType } from "@/types/learning";
import { publishedProblemWhere } from "@/lib/problem-policy";

export const metadata = { title: "復習" };
export default async function ReviewPage() {
  const user = await requireCompletedUser();
  const [skills, mistakes] = await Promise.all([db.userSkillProfile.findMany({ where: { userId: user.id, course: user.selectedCourse! }, orderBy: [{ score: "asc" }, { averageTimeSec: "desc" }] }), db.practiceAttempt.findMany({ where: { userId: user.id, isCorrect: false, problem: { is: publishedProblemWhere } }, include: { problem: true }, orderBy: { createdAt: "desc" }, take: 10 })]);
  const ranking = new Map<string, number>();
  for (const skill of skills) for (const [type, count] of Object.entries(parseJson<Record<string, number>>(skill.mistakeTypesJson, {}))) if (type !== "correct") ranking.set(type, (ranking.get(type) ?? 0) + count);
  return <div className="contentPage"><div className="pageHeader"><span className="eyebrow">REVIEW QUEUE</span><h1>試験前の優先復習</h1><p>最近のミス、到達度、解答時間、ヒント使用から優先順を決めています。</p></div><div className="reviewLayout"><section><div className="sectionHeading"><div><span className="eyebrow">TODAY</span><h2>今日復習する単元</h2></div></div><div className="reviewList">{skills.length ? skills.slice(0, 5).map((skill) => <ReviewQueueCard key={skill.id} item={{ topic: skill.topic, score: skill.score, note: skill.score < 60 ? "基礎式と向きを3分で確認" : "類題を1問解いて定着を確認", problemId: mistakes.find((item) => item.problem.topic === skill.topic)?.problemId }} />) : <div className="emptyState">診断または演習を行うと復習項目が表示されます。</div>}</div></section><aside className="panel rankingPanel"><div className="sectionHeading"><div><span className="eyebrow">CAUSES</span><h2>誤答原因ランキング</h2></div><TriangleAlert /></div>{ranking.size ? [...ranking.entries()].sort((a, b) => b[1] - a[1]).map(([type, count], index) => <div className="rankingRow" key={type}><span>{index + 1}</span><strong>{MISTAKE_LABELS[type as MisconceptionType] ?? type}</strong><small>{count}回</small></div>) : <div className="emptyState">誤答データはありません。</div>}</aside></div><section className="panel"><div className="sectionHeading"><div><span className="eyebrow">RECENT</span><h2>最近間違えた問題</h2></div></div>{mistakes.length ? <div className="mistakeList">{mistakes.map((item) => <Link href={`/practice/${item.problemId}`} key={item.id}><span>{item.problem.topic}</span><strong>{item.problem.title}</strong><small>{MISTAKE_LABELS[item.mistakeType as MisconceptionType] ?? item.mistakeType}</small><ArrowRight /></Link>)}</div> : <div className="emptyState">最近間違えた問題はありません。</div>}</section></div>;
}
