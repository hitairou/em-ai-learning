"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Braces, Check, Cloud, Code2, Database, GitBranch, Globe2, Layers3, Server, Terminal, Zap } from "lucide-react";
import { useState } from "react";
import InfoAppLink from "@/components/InfoAppLink";

const chapters = [
  { id: "big-picture", label: "全体像", icon: Globe2, title: "ブラウザからデータベースまで", text: "あなたが画面をタップすると、ブラウザ、Next.jsのサーバー、API、データベースが順番に仕事をします。EM PASSはその流れをひとつのアプリにまとめています。" },
  { id: "web", label: "Webの基本", icon: Code2, title: "HTML・CSS・JavaScriptの役割", text: "HTMLはページの骨組み、CSSは見た目、JavaScriptは操作に反応する動きを担当します。Reactは、これらを部品として組み立てやすくする仕組みです。" },
  { id: "next", label: "Next.js", icon: Layers3, title: "Next.jsが画面とサーバーをつなぐ", text: "Next.jsはReactを使ったWebアプリの土台です。ページ表示、URL、サーバー処理、データ取得を同じプロジェクトで扱えます。" },
  { id: "github", label: "GitHub", icon: GitBranch, title: "コードの履歴を保存する", text: "GitHubはコードを保管し、変更履歴を残し、複数人で相談しながら開発する場所です。リポジトリはプロジェクトの共有ノートのようなものです。" },
  { id: "setup", label: "環境構築", icon: Terminal, title: "手元でアプリを動かす", text: "Node.jsを用意し、GitHubからコードを取得して、依存パッケージをインストールします。その後、開発サーバーを起動してブラウザで確認します。" },
];

const stack = [
  { icon: Globe2, name: "ブラウザ", sub: "画面を見る・操作する" },
  { icon: Code2, name: "Next.js / React", sub: "画面と処理を組み立てる" },
  { icon: Server, name: "API", sub: "データの受け渡し" },
  { icon: Database, name: "SQLite / Prisma", sub: "学習履歴を保存する" },
];

export default function DevelopmentGuide() {
  const [activeId, setActiveId] = useState("big-picture");
  const active = chapters.find((chapter) => chapter.id === activeId) ?? chapters[0];
  const Icon = active.icon;

  return (
    <div className="infoPage developmentPage">
      <InfoAppLink />
      <section className="infoSubHero developmentHero"><Link className="backToInfo" href="/guide"><ArrowLeft size={16} />使い方ガイドへ戻る</Link><span className="eyebrow">HOW EM PASS IS BUILT</span><h1>アプリの中身を、<em>やさしく分解する。</em></h1><p>プログラミングが初めてでも大丈夫。EM PASSがどこで動き、コードがどう画面になるのかを、身近なたとえと図で紹介します。</p><div className="developmentHeroBadges"><span><Zap size={15} />ひとつずつ学ぶ</span><span><Braces size={15} />コードを読む</span><span><Cloud size={15} />動かして試す</span></div></section>
      <section className="architectureSection"><div className="infoSectionHeading"><div><span className="eyebrow">THE ARCHITECTURE</span><h2>タップの先で起きていること。</h2></div><span className="sectionIndex">01 / 04</span></div><div className="architectureFlow">{stack.map((item, index) => { const StackIcon = item.icon; return <div className="architectureNode" key={item.name}><div className="architectureIcon"><StackIcon size={23} /></div><strong>{item.name}</strong><span>{item.sub}</span>{index < stack.length - 1 && <ArrowRight className="architectureArrow" size={18} />}</div>; })}</div></section>
      <section className="developmentWorkspace"><nav className="chapterTabs" aria-label="開発解説の章">{chapters.map((chapter) => { const ChapterIcon = chapter.icon; return <button key={chapter.id} type="button" className={activeId === chapter.id ? "isActive" : ""} onClick={() => setActiveId(chapter.id)}><ChapterIcon size={17} /><span>{chapter.label}</span></button>; })}</nav><article className="chapterDetail"><div className="chapterDetailIcon"><Icon size={26} /></div><span className="screenDetailKicker">CHAPTER / {String(chapters.findIndex((chapter) => chapter.id === active.id) + 1).padStart(2, "0")}</span><h2>{active.title}</h2><p>{active.text}</p><div className="chapterKeyPoint"><Check size={18} /><span>大切なこと: {active.id === "github" ? "変更を小さく記録すると、失敗しても戻れます。" : active.id === "setup" ? "まずは動かすこと。仕組みは後から少しずつ理解できます。" : "役割を分けると、複雑な仕組みも読みやすくなります。"}</span></div></article></section>
      <section className="setupTimeline"><div className="timelineIntro"><span className="eyebrow">FIRST SETUP</span><h2>初めて動かすときの順番</h2><p>開発環境は、料理をするためのキッチンのようなもの。道具をそろえてから、レシピを実行します。</p></div><div className="timelineSteps"><div><span>01</span><Terminal size={19} /><strong>Node.jsを入れる</strong><small>JavaScriptを動かす道具</small></div><div><span>02</span><GitBranch size={19} /><strong>GitHubから取得</strong><small>プロジェクトを手元へ</small></div><div><span>03</span><Layers3 size={19} /><strong>npm install</strong><small>必要な部品をそろえる</small></div><div><span>04</span><PlayIcon /><strong>npm run dev</strong><small>開発サーバーを起動</small></div></div></section>
      <section className="infoBottomCta compactCta"><span className="eyebrow">BACK TO THE PRODUCT</span><h2>仕組みを知ったら、実際に触ってみる。</h2><Link className="button lightButton" href="/guide">使い方ガイドへ戻る <ArrowRight size={18} /></Link></section>
    </div>
  );
}

function PlayIcon() { return <span className="timelinePlay"><ArrowRight size={16} /></span>; }
