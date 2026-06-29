import Link from "next/link";
import { ArrowRight, Camera, CheckCircle2, Route, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="landingPage">
      <section className="landingHero">
        <div className="heroCopy">
          <span className="eyebrow">TOKUSHIMA UNIVERSITY / ELECTROMAGNETISM</span>
          <h1>電磁気の「わからない」を、<br /><em>今日やる1問</em>に変える。</h1>
          <p>電磁気1・2に特化した診断と演習。写真で質問した問題も、苦手分析と次の復習につながります。</p>
          <div className="heroButtons"><Link className="button primaryButton" href="/signup">今すぐ始める <ArrowRight size={18} /></Link><Link className="button ghostButton" href="/login">ログイン</Link></div>
          <div className="heroProof"><span><CheckCircle2 /> 5問で苦手診断</span><span><CheckCircle2 /> 登録無料</span></div>
        </div>
        <div className="heroVisual" aria-label="学習フローのイメージ">
          <div className="formulaOrbit formulaOne">∮ E·dS = Q/ε₀</div><div className="formulaOrbit formulaTwo">∇×E = -∂B/∂t</div>
          <div className="phoneMock"><div className="phoneTop"><span>今日やること</span><strong>電磁気1</strong></div><div className="miniScore"><span>診断スコア</span><strong>62</strong></div><div className="miniTask"><small>まずここから</small><strong>ガウス面の選択</strong><div className="miniMeter"><span /></div></div><div className="phoneCamera"><Camera /><span>写真で質問</span></div></div>
        </div>
      </section>
      <section className="featureBand"><article><Camera /><span>01</span><h2>撮って質問</h2><p>問題用紙や課題を撮影。使う法則と考え方から解説します。</p></article><article><Route /><span>02</span><h2>弱点を診断</h2><p>符号・対称性・公式選択まで、間違えた理由を分類します。</p></article><article><Sparkles /><span>03</span><h2>次の1問へ</h2><p>履歴から今日の優先問題と類題を選び、復習へつなげます。</p></article></section>
      <section className="landingCta"><span className="eyebrow">基礎から合格ラインへ</span><h2>何から始めるかは、診断に任せる。</h2><Link className="button lightButton" href="/signup">5問診断を始める <ArrowRight size={18} /></Link></section>
    </div>
  );
}
