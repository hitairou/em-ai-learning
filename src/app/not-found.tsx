import Link from "next/link";
export default function NotFound() { return <div className="errorPage"><span>404</span><h1>ページが見つかりません</h1><Link className="button primaryButton" href="/home">ホームへ戻る</Link></div>; }
