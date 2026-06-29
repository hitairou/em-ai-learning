"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import ChatMessageBubble from "@/components/ChatMessageBubble";
import type { QuestionAnalysis } from "@/types/learning";

type Message = { id: string; role: string; content: string | QuestionAnalysis };

export default function ChatClient({ sessionId, initialMessages }: { sessionId: string; initialMessages: Message[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    const userText = content.trim();
    setMessages((items) => [...items, { id: `local-${Date.now()}`, role: "user", content: userText }]);
    setContent("");
    setSubmitting(true);
    setError("");
    const response = await fetch(`/api/chat/${sessionId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: userText }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "追加質問を送信できませんでした");
      setSubmitting(false);
      return;
    }
    setMessages((items) => [...items, { id: `assistant-${Date.now()}`, role: "assistant", content: data.analysis }]);
    setSubmitting(false);
  }

  return (
    <div className="chatLayout">
      <div className="messageList">{messages.map((message) => <ChatMessageBubble key={message.id} role={message.role} content={message.content} />)}{submitting && <div className="typingIndicator">解き方を整理しています...</div>}</div>
      <form className="chatComposer" onSubmit={submit}><textarea rows={2} value={content} onChange={(event) => setContent(event.target.value)} placeholder="この式の符号はなぜ？" /><button type="submit" aria-label="送信" disabled={submitting || !content.trim()}><Send /></button></form>
      {error && <p className="formError">{error}</p>}
    </div>
  );
}
