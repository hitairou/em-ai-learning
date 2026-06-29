import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return <div className="authPage"><section className="authIntro"><span className="eyebrow">START HERE</span><h1>まず、現在地を知る。</h1><p>登録後は科目を選び、5問の診断から始めます。結果は今日やる問題へ直接つながります。</p></section><section className="authPanel"><h2>アカウント作成</h2><p>基礎から合格ラインへの学習を始めましょう。</p><Suspense fallback={<p>フォームを準備中...</p>}><AuthForm mode="signup" /></Suspense></section></div>;
}
