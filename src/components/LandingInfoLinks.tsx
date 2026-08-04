import Link from "next/link";
import { ArrowRight, BookOpen, Code2 } from "lucide-react";

export default function LandingInfoLinks() {
  return (
    <section className="landingInfoLinks">
      <div><span className="eyebrow">START WITH CLARITY</span><h2>はじめての方へ、<br />2つの案内を用意しました。</h2><p>使い方を知りたい人も、アプリの仕組みを知りたい人も、自分のペースで読めます。</p></div>
      <div className="landingInfoLinkGrid"><Link href="/guide" className="landingInfoLinkCard"><span className="landingInfoLinkIcon"><BookOpen size={22} /></span><span><strong>使い方ガイド</strong><small>診断から復習までの流れと、画面ごとの役割を知る</small></span><ArrowRight size={18} /></Link><Link href="/development" className="landingInfoLinkCard"><span className="landingInfoLinkIcon developmentIcon"><Code2 size={22} /></span><span><strong>仕組み・開発ガイド</strong><small>GitHub、Next.js、データの流れをやさしく知る</small></span><ArrowRight size={18} /></Link></div>
    </section>
  );
}
