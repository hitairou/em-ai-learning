"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Camera, CheckCircle2, ClipboardCheck, Home, RotateCcw, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import InfoAppLink from "@/components/InfoAppLink";

const screens = [
  { id: "home", label: "ホーム", icon: Home, color: "teal", title: "今日やることを見つける場所", text: "診断スコア、今日のおすすめ、最近の弱点をひとつの画面で確認できます。迷ったときは、ここに戻れば大丈夫です。", actions: ["診断を始める", "今日の問題を開く", "弱点の一覧を見る"], purpose: "学習の入口として、診断スコア・今日のおすすめ・最近の弱点をまとめて確認します。", when: "何から始めるか迷ったときや、前回の続きから再開したいときに開きます。", tips: ["診断が未完了なら、まず診断への導線が表示されます。", "今日のおすすめは、選択中の科目と学習履歴をもとに変わります。", "弱点リストから復習画面へ移動し、間違えた問題を見返せます。"] },
  { id: "diagnostic", label: "診断", icon: ClipboardCheck, color: "coral", title: "5問で、学習の現在地を知る", text: "基礎・標準・応用の問題に答えると、分野ごとの理解度を推定します。診断は成績を決める試験ではなく、学習の入口をつくるためのものです。", actions: ["科目を選ぶ", "5問に回答する", "診断結果を見る"], purpose: "5問の回答から、単元ごとの理解度と次に取り組むべき分野を推定します。", when: "学習を始めたばかりのとき、または最近どこが苦手か分からなくなったときに使います。", tips: ["正解数だけでなく、どのトピックで迷ったかも結果に反映されます。", "診断は成績を決める試験ではなく、演習のおすすめを作るための案内です。", "診断後は結果画面から、すぐに今日の演習へ進めます。"] },
  { id: "practice", label: "演習", icon: Sparkles, color: "lime", title: "今の自分に合う問題を解く", text: "基礎・標準・試験対策のモード、単元、並び順を切り替えながら、公開済みの問題に取り組めます。", actions: ["モードを選ぶ", "問題IDで探す", "ヒント・写真回答を使う"], purpose: "モード、単元、並び順を選んで問題に取り組みます。問題ID検索から特定の問題を直接開くこともできます。", when: "理解を深めたいとき、特定の問題を解きたいとき、毎日の学習を続けたいときに使います。", tips: ["検索アイコンから問題IDを数字で入力すると、特定の問題を直接開けます。", "回答欄、選択肢、写真回答、ヒントを問題の形式に合わせて使えます。", "採点後は解説とAIフィードバックを読み、似た問題や復習へ進めます。"] },
  { id: "review", label: "復習", icon: RotateCcw, color: "blue", title: "間違いを、次の理解につなげる", text: "過去の回答を正誤、種別、単元で絞り込み、解説や回答履歴を見返せます。忘れた頃にもう一度解くための画面です。", actions: ["誤答だけを見る", "回答履歴を開く", "もう一度解く"], purpose: "過去の正誤、回答履歴、解説、誤答の傾向をまとめて確認します。", when: "一度解いた問題をやり直したいときや、苦手な単元だけを集中して見たいときに使います。", tips: ["誤答のみ・すべて表示を切り替えて、復習量を調整できます。", "種別、単元、並び順を組み合わせると、見たい問題を絞れます。", "履歴から当時の回答やAIフィードバックを開き、考え方の変化を確認できます。"] },
  { id: "camera", label: "写真質問", icon: Camera, color: "mint", title: "手元の問題を質問する", text: "問題文やノートを撮影・アップロードして、AIに整理や解説を頼めます。画像を送る前に、個人情報が写っていないか確認してください。", actions: ["写真を選ぶ", "質問を送る", "会話で深掘りする"], purpose: "手元の問題文やノートを画像・PDFで取り込み、AIとの質問画面を作ります。", when: "問題文を入力し直すのが大変なとき、解法の方針を相談したいときに使います。", tips: ["画像は文字が読める明るさで撮影し、必要な範囲だけを写します。", "個人情報や他人の答案が写っていないか、送信前に確認してください。", "解析後のチャットでは、要約・解説・追加質問を続けて依頼できます。"] },
];

export default function GuideScreens() {
  const [activeId, setActiveId] = useState("home");
  const active = screens.find((screen) => screen.id === activeId) ?? screens[0];
  const Icon = active.icon;

  return (
    <div className="infoPage screenGuidePage">
      <InfoAppLink />
      <section className="infoSubHero"><Link className="backToInfo" href="/guide"><ArrowLeft size={16} />使い方の概要へ戻る</Link><span className="eyebrow">SCREEN BY SCREEN</span><h1>画面ごとの使い方を、<em>ゆっくり見ていく。</em></h1><p>「このボタンは何だろう？」をなくすために、各画面の目的と使いどころをまとめました。</p></section>
      <section className="screenGuideWorkspace">
        <nav className="screenGuideTabs" aria-label="画面別ガイド">{screens.map((screen) => { const ScreenIcon = screen.icon; return <button key={screen.id} type="button" className={activeId === screen.id ? "isActive" : ""} onClick={() => setActiveId(screen.id)}><ScreenIcon size={18} /><span>{screen.label}</span></button>; })}</nav>
        <article className={`screenDetailCard screenDetail-${active.color}`}>
          <div className="screenDetailTop"><div className="screenDetailIcon"><Icon size={28} /></div><span className="screenDetailKicker">SCREEN / {String(screens.findIndex((screen) => screen.id === active.id) + 1).padStart(2, "0")}</span></div>
          <h2>{active.title}</h2><p className="screenDetailText">{active.text}</p>
          <div className="screenActionList">{active.actions.map((action, index) => <div key={action}><span>0{index + 1}</span><strong>{action}</strong><CheckCircle2 size={18} /></div>)}</div>
          <div className="screenDetailInfoGrid"><div><span>この画面の役割</span><p>{active.purpose}</p></div><div><span>こんなときに開く</span><p>{active.when}</p></div></div>
          <div className="screenTips"><strong>使いこなしのポイント</strong>{active.tips.map((tip) => <p key={tip}><CheckCircle2 size={15} />{tip}</p>)}</div>
          <div className="screenDetailHint"><Search size={17} /><span>画面上で迷ったら、ヘッダーや下部ナビゲーションからいつでも移動できます。</span></div>
        </article>
      </section>
      <section className="screenFlow"><div><span className="eyebrow">A TYPICAL SESSION</span><h2>ひとつの学習が、次の画面を連れてくる。</h2></div><div className="screenFlowLine">{["診断", "ホーム", "演習", "復習"].map((label, index) => <div key={label} className="screenFlowNode"><span>{String(index + 1).padStart(2, "0")}</span><strong>{label}</strong>{index < 3 && <ArrowRight size={17} />}</div>)}</div></section>
      <section className="infoBottomCta compactCta"><span className="eyebrow">LEARN THE SYSTEM</span><h2>アプリの中身も知りたいですか？</h2><Link className="button lightButton" href="/development">仕組み・開発ガイドへ <ArrowRight size={18} /></Link></section>
    </div>
  );
}
