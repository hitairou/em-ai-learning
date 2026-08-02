"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function QuestionDeleteButton({ id }: { id: string }) {
  const router = useRouter(); const [busy, setBusy] = useState(false);
  async function remove() {
    if (!window.confirm("この質問履歴、解析結果、関連するアップロードファイルを削除します。この操作は元に戻せません。")) return;
    setBusy(true); const response = await fetch(`/api/questions/${id}`, { method: "DELETE" }); if (response.ok) router.push("/camera"); else setBusy(false);
  }
  return <button type="button" className="button dangerButton" disabled={busy} onClick={remove}>{busy ? "削除中..." : "この履歴を削除"}</button>;
}
