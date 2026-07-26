"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function LearningResetButton({ courseLabel }: { courseLabel: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function reset() {
    const confirmed = window.confirm(`${courseLabel}の学習履歴、5問診断、到達度、誤答データ、写真質問チャットを削除します。元に戻せません。実行しますか？`);
    if (!confirmed) return;
    setSubmitting(true);
    setMessage("");
    const response = await fetch("/api/profile/reset-learning", { method: "POST" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(data.error ?? "リセットできませんでした");
      setSubmitting(false);
      return;
    }
    router.push("/onboarding/diagnostic");
    router.refresh();
  }

  return (
    <div className="dangerZone">
      <button className="button dangerButton fullButton" type="button" disabled={submitting} onClick={reset}>
        <Trash2 size={17} />
        {submitting ? "リセット中..." : `${courseLabel}の学習履歴をリセット`}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
