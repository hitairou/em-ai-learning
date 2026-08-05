"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Code2,
  Compass,
  Gauge,
  GitBranch,
  Lightbulb,
  Menu,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Slide = {
  eyebrow: string;
  title: string;
  lead: string;
  variant: string;
  accent: "teal" | "lime" | "coral";
};

const slides: Slide[] = [
  { eyebrow: "WELCOME TO EM PASS", title: "電磁気の学びを、\n次の一歩へ。", lead: "わからない問題を抱えたまま、勉強方法に迷う時間を減らします。EM PASSは、診断から復習までをひとつにつなぐ学習アプリです。", variant: "cover", accent: "teal" },
  { eyebrow: "01 / WHY", title: "勉強しているのに、\n何が苦手かわからない。", lead: "電磁気は、公式を覚えるだけでは解けません。法則の選択、条件の読み取り、符号、単位など、つまずく場所が人によって違います。", variant: "problem", accent: "coral" },
  { eyebrow: "02 / THE IDEA", title: "最初に、\n学び方を整える。", lead: "EM PASSは、いきなり大量の問題を出しません。まず今の理解を確かめ、次に取り組むべき内容を小さく提案します。", variant: "idea", accent: "lime" },
  { eyebrow: "03 / THE LOOP", title: "診断 → 演習 → 復習。\n学びが循環します。", lead: "一度解いて終わりではなく、弱点を見つけ、問題に取り組み、もう一度確かめる。この短いループを毎日の学習にします。", variant: "loop", accent: "teal" },
  { eyebrow: "04 / HOME", title: "ホームで、\n今日やることが見える。", lead: "診断スコアや最近の取り組みから、今日おすすめの問題を表示。迷わず学習を始められます。", variant: "home", accent: "teal" },
  { eyebrow: "05 / DIAGNOSIS", title: "診断は、\n現在地を知る時間。", lead: "基礎的な選択問題に答えると、単元ごとの理解度を確認できます。結果は次の学習内容につながります。", variant: "diagnosis", accent: "lime" },
  { eyebrow: "06 / PERSONAL PATH", title: "一人ひとりに、\n違うスタート地点。", lead: "同じ電磁気の学習でも、得意な単元と復習したい単元は異なります。診断結果から自分に合う入口を選べます。", variant: "path", accent: "coral" },
  { eyebrow: "07 / PRACTICE", title: "演習では、\n一問に集中する。", lead: "基礎、標準、試験対策。目的に合わせたモードと単元を選び、今必要な一問に向き合えます。", variant: "practice", accent: "teal" },
  { eyebrow: "08 / SEARCH", title: "問題IDから、\n目的の問題へ直行。", lead: "先生や友人から共有された問題、もう一度解きたい問題も、検索アイコンから数字のIDで直接開けます。", variant: "search", accent: "lime" },
  { eyebrow: "09 / ANSWER", title: "答えだけでなく、\n考え方を残す。", lead: "使う法則、途中式、最終答え。書いた過程が、あとで自分の理解を振り返る手がかりになります。", variant: "answer", accent: "coral" },
  { eyebrow: "10 / PHOTO", title: "手書きの解答も、\n写真で提出できます。", lead: "ノートに書いた途中式を撮影して回答。入力が難しい式や図も、学習の流れを止めずに送れます。", variant: "photo", accent: "lime" },
  { eyebrow: "11 / HINT", title: "行き詰まったら、\nヒントを一段ずつ。", lead: "いきなり答えを見るのではなく、考える方向、使う法則、確認する条件へと段階的に進みます。", variant: "hint", accent: "teal" },
  { eyebrow: "12 / NUMBERS", title: "数値の丸め方も、\n学習の一部です。", lead: "有効数字3桁など、正答を適切に丸めた数値は正解として扱います。単位も含めて、意味のある答えを評価します。", variant: "numbers", accent: "coral" },
  { eyebrow: "13 / AI FEEDBACK", title: "採点のあとに、\n次の一手がわかる。", lead: "正誤だけでなく、法則、符号、単位、方向などの観点から、どこを見直すかをフィードバックします。", variant: "feedback", accent: "teal" },
  { eyebrow: "14 / REVIEW", title: "復習は、\n苦手を放置しない場所。", lead: "間違えた問題や気になる単元をまとめて確認。解説を読み、もう一度考え、理解を積み直せます。", variant: "review", accent: "lime" },
  { eyebrow: "15 / SIMILAR", title: "似た問題で、\n理解を確かめる。", lead: "解説を読んだあと、同じ考え方を使う類題へ進めます。解けるようになったかを、その場で試せます。", variant: "similar", accent: "coral" },
  { eyebrow: "16 / PROGRESS", title: "小さな前進を、\n記録に残す。", lead: "回答数、正答数、単元ごとの履歴を見ながら、学習の変化を確認できます。続ける理由が見つかります。", variant: "progress", accent: "teal" },
  { eyebrow: "17 / BEGINNERS", title: "初めてでも、\n使い方がわかる。", lead: "アプリの使い方、各画面の役割、困ったときの進み方をガイドで確認できます。口頭説明の補助にも使えます。", variant: "beginner", accent: "lime" },
  { eyebrow: "18 / TECHNOLOGY", title: "学習体験を支える、\nWebの仕組み。", lead: "Next.js、HTML、CSS、データベース、AI。画面の裏側で、それぞれが役割を分担しています。", variant: "technology", accent: "coral" },
  { eyebrow: "19 / TRUST", title: "学習データを扱うから、\n安全性も大切に。", lead: "ログイン、同意、データ保存、AI送信の扱いを整え、学習に集中できる環境を目指しています。", variant: "trust", accent: "teal" },
  { eyebrow: "20 / START", title: "今日の一問から、\n始めてみよう。", lead: "診断からでも、気になる問題からでも大丈夫です。EM PASSと一緒に、自分の学び方をつくっていきましょう。", variant: "start", accent: "lime" },
];

const icons = [Compass, Target, Sparkles, RotateCcw, Gauge, BrainCircuit, Users, BookOpen, Search, Check, Upload, Lightbulb, Sparkles, RotateCcw, ArrowRight, Clock3, CircleHelp, Code2, ShieldCheck, Play];

function SlideVisual({ slide, index }: { slide: Slide; index: number }) {
  const Icon = icons[index] ?? Sparkles;
  if (slide.variant === "cover" || slide.variant === "start") {
    return <div className="slideVisual slideVisualCover"><div className="coverOrbit orbitOne" /><div className="coverOrbit orbitTwo" /><div className="coverCore"><Sparkles size={30} /><strong>EM<br />PASS</strong><small>LEARNING LOOP</small></div><span className="coverBadge badgeA"><Compass size={17} />診断</span><span className="coverBadge badgeB"><BookOpen size={17} />演習</span><span className="coverBadge badgeC"><RotateCcw size={17} />復習</span></div>;
  }
  if (slide.variant === "loop") return <div className="slideVisual slideVisualLoop"><div className="loopLine" /><div className="loopCard loopCardA"><Compass size={24} /><strong>診断</strong><small>現在地を知る</small></div><div className="loopCard loopCardB"><BookOpen size={24} /><strong>演習</strong><small>一問に向き合う</small></div><div className="loopCard loopCardC"><RotateCcw size={24} /><strong>復習</strong><small>理解を積み直す</small></div><div className="loopCenter"><Sparkles size={20} />学びの循環</div></div>;
  if (slide.variant === "technology") return <div className="slideVisual slideVisualTech"><div className="techNode techBrowser"><Code2 size={21} /><strong>ブラウザ</strong><small>HTML / CSS</small></div><ArrowRight className="techArrow" /><div className="techNode techNext"><Code2 size={21} /><strong>Next.js</strong><small>画面と処理</small></div><ArrowRight className="techArrow" /><div className="techNode techData"><GitBranch size={21} /><strong>データ</strong><small>問題・履歴</small></div><div className="techBeam" /></div>;
  return <div className={`slideVisual slideVisual${slide.variant[0].toUpperCase()}${slide.variant.slice(1)}`}><div className="mockWindow"><div className="mockWindowBar"><span /><span /><span /><small>EM PASS</small></div><div className="mockWindowBody"><div className="mockSidebar"><i /><i /><i /><i /></div><div className="mockContent"><div className="mockKicker">{slide.eyebrow}</div><div className="mockTitle"><b /><b /><b /></div><div className="mockRows"><span /><span /><span /></div><div className="mockAccent"><Icon size={24} /><strong>{slide.variant === "numbers" ? "1.23 V" : slide.variant === "search" ? "問題ID 834" : slide.variant === "feedback" ? "次に見直すこと" : slide.variant === "review" ? "復習リスト" : "今日の一問"}</strong><small>{index + 1} / 20</small></div></div></div></div><div className="visualFloat visualFloatOne"><Icon size={18} /></div><div className="visualFloat visualFloatTwo"><Check size={17} /></div></div>;
}

export default function SlideShowGuide() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const slide = slides[active];
  const progress = useMemo(() => `${active + 1} / ${slides.length}`, [active]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === " ") { event.preventDefault(); setActive((value) => (value + 1) % slides.length); setPlaying(false); }
      if (event.key === "ArrowLeft") { event.preventDefault(); setActive((value) => (value - 1 + slides.length) % slides.length); setPlaying(false); }
      if (event.key === "Escape") setPlaying(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 4000);
    return () => window.clearInterval(timer);
  }, [playing]);

  const move = (direction: number) => { setActive((value) => (value + direction + slides.length) % slides.length); setPlaying(false); };

  return (
    <div className={`slideShowPage accent-${slide.accent}`}>
      <div className="slideShowTopbar"><Link href="/guide" className="slideBackLink"><ArrowLeft size={16} />ガイド概要へ戻る</Link><span className="slideShowBrand"><span>EM</span> PASS / INTRODUCTION</span><div className="slideShowTopActions"><Link href="/home" className="slideAppLink">学習アプリへ <ArrowRight size={15} /></Link><button type="button" className="slideIconButton" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "自動再生を停止" : "自動再生を開始"}>{playing ? <Pause size={16} /> : <Play size={16} />}</button></div></div>
      <main className="slideShowStage" aria-live="polite">
        <div className="slideShowCopy"><div className="slideMeta"><span>{slide.eyebrow}</span><b>{progress}</b></div><h1 key={slide.title}>{slide.title}</h1><p>{slide.lead}</p><div className="slideCopyRule" /><small>EM PASS / 学びを、自分のペースで。</small></div>
        <SlideVisual slide={slide} index={active} />
        <div className="slidePageNumber">{String(active + 1).padStart(2, "0")}</div>
      </main>
      <div className="slideShowControls"><button type="button" className="slideControlButton" onClick={() => move(-1)} aria-label="前のスライド"><ChevronLeft size={20} /></button><div className="slideProgressBar"><span style={{ width: `${((active + 1) / slides.length) * 100}%` }} /></div><button type="button" className="slideControlButton" onClick={() => move(1)} aria-label="次のスライド"><ChevronRight size={20} /></button><div className="slideDots" aria-label="スライド選択">{slides.map((item, index) => <button key={item.eyebrow} type="button" className={index === active ? "isActive" : ""} onClick={() => { setActive(index); setPlaying(false); }} aria-label={`${index + 1}枚目を表示`} />)}</div></div>
      <div className="slideShowHint"><Menu size={14} /> 左右キー・画面下のボタンで移動 <span>自動再生 {playing ? "ON" : "OFF"}</span></div>
    </div>
  );
}
