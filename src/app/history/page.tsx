import Link from "next/link";
import { Camera, ChevronRight, Dumbbell } from "lucide-react";
import { requireCompletedUser } from "@/lib/auth/user";
import { db } from "@/lib/db";
import { MISTAKE_LABELS } from "@/lib/constants";
import type { MisconceptionType } from "@/types/learning";
import { publishedProblemWhere } from "@/lib/problem-policy";

export const metadata = { title: "学習履歴" };
export default async function HistoryPage() {
  const user = await requireCompletedUser();
  const [questions, practices] = await Promise.all([db.questionSession.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 }), db.practiceAttempt.findMany({ where: { userId: user.id, problem: { is: publishedProblemWhere } }, include: { problem: true }, orderBy: { createdAt: "desc" }, take: 50 })]);
  return <div className="contentPage"><div className="pageHeader"><span className="eyebrow">LEARNING LOG</span><h1>学習履歴</h1><p>質問と演習を、次の復習に使える形で残しています。</p></div><div className="historyGrid"><section className="panel"><div className="sectionHeading"><div><span className="eyebrow">QUESTIONS</span><h2>写真・PDF・テキスト質問</h2></div><Camera /></div>{questions.length ? <div className="historyList">{questions.map((item) => <Link href={`/chat/${item.id}`} key={item.id}><span className="historyType">{item.inputType === "image" ? "画像" : item.inputType === "pdf" ? "PDF" : "テキスト"}</span><div><strong>{item.detectedTopic ?? "解析済みの質問"}</strong><p>{item.extractedText.slice(0, 80)}</p><small>{item.createdAt.toLocaleDateString("ja-JP")}</small></div><ChevronRight /></Link>)}</div> : <div className="emptyState">質問履歴はありません。写真で質問してみましょう。</div>}</section><section className="panel"><div className="sectionHeading"><div><span className="eyebrow">PRACTICE</span><h2>演習履歴</h2></div><Dumbbell /></div>{practices.length ? <div className="historyList">{practices.map((item) => <Link href={`/practice/${item.problemId}`} key={item.id}><span className={`resultDot ${item.isCorrect ? "ok" : "ng"}`} /> <div><strong>{item.problem.title}</strong><p>{item.problem.topic} / {MISTAKE_LABELS[item.mistakeType as MisconceptionType] ?? item.mistakeType}</p><small>{item.createdAt.toLocaleDateString("ja-JP")}</small></div><ChevronRight /></Link>)}</div> : <div className="emptyState">演習履歴はありません。</div>}</section></div></div>;
}
