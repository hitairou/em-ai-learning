import Link from "next/link";

export default function SkillProgressCard({ topic, score, attempts, href }: { topic: string; score: number; attempts?: number; href?: string }) {
  const content = (
    <>
      <div className="skillRowTop">
        <strong>{topic}</strong>
        <span>{score}%</span>
      </div>
      <div className="meter"><span style={{ width: `${score}%` }} /></div>
      {attempts !== undefined && <small>{attempts}問の履歴から算出</small>}
    </>
  );
  if (href) return <Link className="skillRow skillRowLink" href={href}>{content}</Link>;
  return (
    <div className="skillRow">
      {content}
    </div>
  );
}
