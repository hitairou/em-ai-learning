"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div className="errorPage"><span>ERROR</span><h1>画面を表示できませんでした</h1><p>通信状態を確認し、もう一度お試しください。</p><button className="button primaryButton" onClick={reset}>再読み込み</button></div>; }
