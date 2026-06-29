export default function SkillProgressCard({ topic, score, attempts }: { topic: string; score: number; attempts?: number }) {
  return (
    <div className="skillRow">
      <div className="skillRowTop">
        <strong>{topic}</strong>
        <span>{score}%</span>
      </div>
      <div className="meter"><span style={{ width: `${score}%` }} /></div>
      {attempts !== undefined && <small>{attempts}問の履歴から算出</small>}
    </div>
  );
}
