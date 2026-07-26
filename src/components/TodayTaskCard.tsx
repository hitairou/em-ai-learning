import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import RichMathText from "@/components/RichMathText";

export default function TodayTaskCard({ problem }: { problem: { id: string; title: string; topic: string; difficulty: number; questionText: string } | null }) {
  if (!problem) {
    return <div className="emptyState">おすすめ問題を準備できませんでした。問題データを確認してください。</div>;
  }
  return (
    <article className="todayCard">
      <div className="todayCardMeta"><span>{problem.topic}</span><span><Clock3 size={14} /> 約5分</span></div>
      <h3>{problem.title}</h3>
      <p><RichMathText text={problem.questionText} /></p>
      <Link className="button inkButton" href={`/practice/${problem.id}`}>この問題を解く <ArrowUpRight size={18} /></Link>
    </article>
  );
}
