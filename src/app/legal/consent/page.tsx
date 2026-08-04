"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ConsentPage() {
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const searchParams = useSearchParams();

  async function accept() {
    if (!terms || !privacy) {
      setError("利用規約とプライバシーポリシーをご確認ください");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const endpoint = searchParams.get("guest") === "1" ? "/api/auth/guest" : "/api/legal/consent";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ acceptTerms: terms, acknowledgePrivacy: privacy }),
      });
      if (!response.ok) {
        setError("同意内容を確認してください");
        setBusy(false);
        return;
      }
      const data = await response.json().catch(() => ({}));
      window.location.assign(data.next ?? "/home");
    } catch {
      setError("通信に失敗しました。時間をおいてもう一度お試しください");
      setBusy(false);
    }
  }

  return (
    <div className="legalConsentPage">
      <span className="eyebrow">LEGAL CONSENT</span>
      <h1>ご利用前にご確認ください</h1>
      <p>安心してご利用いただくために、利用規約とプライバシーポリシーをご確認ください。</p>
      <label className="checkLabel"><input type="checkbox" checked={terms} onChange={(event) => setTerms(event.target.checked)} /> <span><Link href="/terms?returnTo=/legal/consent">利用規約</Link>に同意します</span></label>
      <label className="checkLabel"><input type="checkbox" checked={privacy} onChange={(event) => setPrivacy(event.target.checked)} /> <span><Link href="/privacy?returnTo=/legal/consent">プライバシーポリシー</Link>を確認しました</span></label>
      {error && <p role="alert" className="formError">{error}</p>}
      <button className="button primaryButton" type="button" disabled={busy} onClick={accept}>{busy ? "保存中..." : "同意して続ける"}</button>
      <p><Link href="/logout">ログアウト</Link></p>
    </div>
  );
}
