import Link from "next/link";
import { RotateCcw } from "lucide-react";

export default function ReviewQueueCard({ item }: { item: { topic: string; score: number; note: string; problemId?: string } }) {
  return <article className="reviewCard"><div><span className="scorePill">到達度 {item.score}%</span><h3>{item.topic}</h3><p>{item.note}</p></div><Link className="iconAction" href={item.problemId ? `/practice/${item.problemId}` : `/practice?topic=${encodeURIComponent(item.topic)}`} aria-label="再出題"><RotateCcw /></Link></article>;
}
