"use client";

/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import { ArrowRight, BookOpen, Check, Compass, Lightbulb, Play, Sparkles, Target } from "lucide-react";
import { useState } from "react";
import InfoAppLink from "@/components/InfoAppLink";

const steps = [
  { number: "01", icon: Compass, title: "まず現在地を知る", text: "科目を選び、短い診断で得意・苦手の傾向をつかみます。" },
  { number: "02", icon: Target, title: "今日の1問に取り組む", text: "診断結果や過去の回答から、今の自分に合う問題を選びます。" },
  { number: "03", icon: Lightbulb, title: "解説から次へ進む", text: "採点・解説・ヒントを使って、次に復習する場所を決めます。" },
];

const principles = [
  { title: "迷ったら診断から", text: "何を勉強すればよいか分からないときは、診断がスタート地点です。" },
  { title: "毎日少しずつ", text: "一度にたくさん解くより、今日の1問を理解することを大切にします。" },
  { title: "間違いは道しるべ", text: "誤答は弱点の場所を教えてくれるサイン。復習画面で再び向き合えます。" },
];

export default function GuideOverview() {
  const [activePrinciple, setActivePrinciple] = useState(0);

  return (
    <div className="infoPage guideOverviewPage">
      <InfoAppLink />
      <section className="infoHero guideHero">
        <div className="infoHeroCopy">
          <span className="eyebrow">HOW TO USE EM PASS</span>
          <h1>わからないを、<em>次の一歩</em>に変える。</h1>
          <p>EM PASSは、電磁気の学習を「診断 → 演習 → 復習」の小さなサイクルに分けて、一人ひとりの今に合わせて案内する学習アプリです。</p>
          <div className="infoHeroActions"><Link className="button primaryButton" href="/signup">使い始める <ArrowRight size={18} /></Link><Link className="textButton infoTextLink" href="/guide/screens">画面別の機能を見る <ArrowRight size={16} /></Link></div>
        </div>
        <div className="guideOrbitVisual" aria-label="学習サイクルの図">
          <div className="orbitRing orbitRingOuter" /><div className="orbitRing orbitRingInner" />
          <div className="orbitCenter"><Sparkles size={25} /><strong>EM<br />PASS</strong><small>LEARNING LOOP</small></div>
          <div className="orbitNode orbitNodeTop"><Compass size={18} /><span>診断</span></div><div className="orbitNode orbitNodeRight"><BookOpen size={18} /><span>演習</span></div><div className="orbitNode orbitNodeBottom"><Target size={18} /><span>復習</span></div>
        </div>
      </section>

      <section className="infoSection guideStepsSection"><div className="infoSectionHeading"><div><span className="eyebrow">THE SIMPLE LOOP</span><h2>使い方は、3つの流れだけ。</h2></div><span className="sectionIndex">01 / 03</span></div><div className="guideStepsGrid">{steps.map((step) => { const Icon = step.icon; return <article className="guideStepCard" key={step.number}><span className="guideStepNumber">{step.number}</span><Icon size={25} /><h3>{step.title}</h3><p>{step.text}</p></article>; })}</div></section>

      <section className="infoSection guidePrincipleSection"><div className="guidePrincipleIntro"><span className="eyebrow">A GOOD WAY TO START</span><h2>学び方に、正解はひとつではありません。</h2><p>今の状態に合わせて、入口を選べます。カードを選ぶと、使いどころが切り替わります。</p></div><div className="principlePanel"><div className="principleTabs">{principles.map((item, index) => <button key={item.title} type="button" className={activePrinciple === index ? "isActive" : ""} onClick={() => setActivePrinciple(index)}><span>0{index + 1}</span>{item.title}</button>)}</div><div className="principleDetail"><Play size={18} /><h3>{principles[activePrinciple].title}</h3><p>{principles[activePrinciple].text}</p><Check size={18} /></div></div></section>

      <section className="infoSection guideDetailTeaser"><div className="teaserVisual"><div className="teaserWindow"><div className="teaserWindowTop"><span /><span /><span /></div><div className="teaserWindowBody"><small>TODAY'S PATH</small><strong>診断から<br />演習へ</strong><div className="teaserProgress"><span /></div></div></div></div><div><span className="eyebrow">KNOW YOUR SCREEN</span><h2>各画面の役割も、ていねいに。</h2><p>ホーム、診断、演習、復習、写真質問。どの画面で何ができるのかを、実際の使い方に沿って紹介します。</p><Link className="button secondaryButton" href="/guide/screens">画面別ガイドを読む <ArrowRight size={17} /></Link></div></section>

      <section className="infoBottomCta"><span className="eyebrow">READY WHEN YOU ARE</span><h2>今日の1問から、始めよう。</h2><Link className="button lightButton" href="/signup">EM PASSを使ってみる <ArrowRight size={18} /></Link></section>
    </div>
  );
}
