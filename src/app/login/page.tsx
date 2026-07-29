import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";
import GuestStartButton from "@/components/GuestStartButton";

export default function LoginPage() {
  return <div className="authPage"><section className="authIntro"><span className="eyebrow">WELCOME BACK</span><h1>昨日の続きから、<br />今日の1問へ。</h1><p>質問履歴、苦手単元、復習キューはアカウントに保存されています。</p></section><section className="authPanel"><h2>ログイン</h2><p>学習ダッシュボードへ戻ります。</p><Suspense fallback={<p>フォームを準備中...</p>}><AuthForm mode="login" /></Suspense><div className="guestAuthBlock"><span>アカウントなしで試す</span><GuestStartButton variant="light" /><small>ゲストモードの履歴はこの端末のCookieに紐づきます。</small></div></section></div>;
}
