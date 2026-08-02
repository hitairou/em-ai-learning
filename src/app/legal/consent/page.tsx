"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ConsentPage() {
  const [terms, setTerms] = useState(false); const [privacy, setPrivacy] = useState(false); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const searchParams = useSearchParams();
  async function accept() {
    setBusy(true); setError(""); const endpoint = searchParams.get("guest") === "1" ? "/api/auth/guest" : "/api/legal/consent"; const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ acceptTerms: terms, acknowledgePrivacy: privacy }) });
    if (!response.ok) { setError("同意内容を確認してください"); setBusy(false); return; } window.location.assign("/home");
  }
  return <div className="legalConsentPage"><span className="eyebrow">LEGAL CONSENT</span><h1>最新の法務情報をご確認ください</h1><p>利用を続けるには、現在の利用規約への同意とプライバシーポリシーの確認が必要です。</p><label className="checkLabel"><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} /> <span><Link href="/terms" target="_blank">利用規約</Link>に同意します</span></label><label className="checkLabel"><input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} /> <span><Link href="/privacy" target="_blank">プライバシーポリシー</Link>を確認しました</span></label>{error && <p role="alert" className="formError">{error}</p>}<button className="button primaryButton" disabled={!terms || !privacy || busy} onClick={accept}>{busy ? "保存中..." : "同意して続ける"}</button><p><Link href="/logout">ログアウト</Link></p></div>;
}
