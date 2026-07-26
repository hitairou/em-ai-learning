import Link from "next/link";
import { ChevronRight, History, ScanLine } from "lucide-react";
import CameraUploadCard from "@/components/CameraUploadCard";
import { requireCompletedUser } from "@/lib/auth/user";
import { db } from "@/lib/db";

export const metadata = { title: "写真で質問" };
export default async function CameraPage() {
  const user = await requireCompletedUser();
  const questions = await db.questionSession.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return <div className="narrowPage cameraPage"><div className="pageTitle"><ScanLine /><div><span className="eyebrow">ASK FROM PHOTO</span><h1>写真で質問</h1><p>問題を撮るか、画像・PDFを選んでください。答えの前に考え方から整理します。</p></div></div><CameraUploadCard /><section className="panel questionHistoryPanel"><div className="sectionHeading"><div><span className="eyebrow">QUESTIONS</span><h2>過去のチャット</h2></div><History /></div>{questions.length ? <div className="historyList">{questions.map((item) => <Link href={`/chat/${item.id}`} key={item.id}><span className="historyType">{item.inputType === "image" ? "画像" : item.inputType === "pdf" ? "PDF" : "テキスト"}</span><div><strong>{item.detectedTopic ?? "解析済みの質問"}</strong><p>{item.extractedText.slice(0, 80)}</p><small>{item.createdAt.toLocaleDateString("ja-JP")}</small></div><ChevronRight /></Link>)}</div> : <div className="emptyState">質問履歴はありません。</div>}</section></div>;
}
