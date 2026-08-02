"use client";
import { useState } from "react";
export default function AccountDeleteButton() {
  const [password, setPassword] = useState(""); const [confirmation, setConfirmation] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function remove() {
    if (confirmation !== "アカウントを削除") { setError("確認文字列が一致しません"); return; }
    if (!window.confirm("アカウントと関連する学習履歴・質問履歴・ファイルを削除します。この操作は元に戻せません。")) return;
    setBusy(true); setError(""); const response = await fetch("/api/profile/account", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, confirmation }) }); const data = await response.json().catch(() => ({}));
    if (!response.ok) { setError(data.error ?? "アカウントを削除できませんでした"); setBusy(false); return; } window.location.assign("/");
  }
  return <div className="dangerZone"><h3>アカウント削除</h3><p>学習履歴、質問履歴、関連ファイルを削除します。</p><label className="fieldLabel">現在のパスワード<input className="textInput" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label><label className="fieldLabel">確認文字列（アカウントを削除）<input className="textInput" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} /></label>{error && <p className="formError" role="alert">{error}</p>}<button className="button dangerButton" disabled={busy || !password || confirmation !== "アカウントを削除"} onClick={remove}>アカウントを削除</button></div>;
}
