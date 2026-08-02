import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ChatClient from "@/components/ChatClient";
import { requireCompletedUser } from "@/lib/auth/user";
import { db } from "@/lib/db";
import { parseJson } from "@/lib/json";
import type { QuestionAnalysis } from "@/types/learning";
import QuestionDeleteButton from "@/components/QuestionDeleteButton";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCompletedUser();
  const { id } = await params;
  const session = await db.questionSession.findFirst({ where: { id, userId: user.id }, include: { messages: { orderBy: { createdAt: "asc" } } } });
  if (!session) notFound();
  const messages = session.messages.map((message) => ({ id: message.id, role: message.role, content: message.role === "assistant" ? parseJson<QuestionAnalysis | string>(message.content, message.content) : message.content }));
  return <div className="chatPage"><div className="chatHeader"><Link href="/review"><ArrowLeft /> 復習と履歴</Link><div><span>{session.course === "em1" ? "電磁気1" : "電磁気2"}</span><strong>{session.detectedTopic ?? "問題解析"}</strong></div><div>{session.originalFilePath && <Link href={`/api/questions/${session.id}/file`} target="_blank">元ファイル</Link>}<QuestionDeleteButton id={session.id} /></div></div><ChatClient sessionId={session.id} initialMessages={messages} /></div>;
}
