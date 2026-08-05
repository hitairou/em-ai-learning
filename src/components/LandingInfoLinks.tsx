import Link from "next/link";
import { ArrowRight, BookOpen, Code2, Presentation } from "lucide-react";

export default function LandingInfoLinks() {
  return (
    <section className="landingInfoLinks">
      <div>
        <span className="eyebrow">START WITH CLARITY</span>
        <h2>はじめての方へ、<br />3つの案内。</h2>
        <p>まずは紹介スライドで全体像をつかみ、詳しいガイドや開発の仕組みへ進めます。</p>
      </div>
      <div className="landingInfoLinkGrid">
        <Link href="/guide/slideshow" className="landingInfoLinkCard">
          <span className="landingInfoLinkIcon"><Presentation size={22} /></span>
          <span><strong>紹介スライド</strong><small>約20枚で、EM PASSでできることを順番に紹介します。</small></span>
          <ArrowRight size={18} />
        </Link>
        <Link href="/guide" className="landingInfoLinkCard">
          <span className="landingInfoLinkIcon"><BookOpen size={22} /></span>
          <span><strong>使い方ガイド</strong><small>診断から復習まで、各画面の役割と操作を詳しく確認できます。</small></span>
          <ArrowRight size={18} />
        </Link>
        <Link href="/development" className="landingInfoLinkCard">
          <span className="landingInfoLinkIcon developmentIcon"><Code2 size={22} /></span>
          <span><strong>開発・仕組みガイド</strong><small>GitHub、Next.js、データの流れを初学者向けに解説します。</small></span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
