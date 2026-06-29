import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import SkillProgressCard from "@/components/SkillProgressCard";

export default function DiagnosticResultCard({ score, level, weakTopics, recommendation }: { score: number; level: string; weakTopics: Array<{ topic: string; score: number }>; recommendation: string }) {
  return (
    <div className="resultStack">
      <section className="resultHero">
        <Target size={30} />
        <span>診断スコア</span>
        <strong>{score}<small>/100</small></strong>
        <p>{level}</p>
      </section>
      <section className="panel">
        <div className="sectionHeading"><div><span className="eyebrow">WEAK POINTS</span><h2>まずここから</h2></div></div>
        <div className="skillList">
          {weakTopics.length ? weakTopics.map((item) => <SkillProgressCard key={item.topic} {...item} />) : <p className="mutedText">苦手データはまだありません。</p>}
        </div>
      </section>
      <section className="recommendStrip"><span>今日の優先単元</span><strong>{recommendation}</strong></section>
      <Link className="button primaryButton fullButton" href="/home">今日の学習を始める <ArrowRight size={18} /></Link>
    </div>
  );
}
