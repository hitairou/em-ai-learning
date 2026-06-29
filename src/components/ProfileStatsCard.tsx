export default function ProfileStatsCard({ solved, correctRate, streak }: { solved: number; correctRate: number; streak: number }) {
  return <div className="statsGrid"><div><span>解いた問題</span><strong>{solved}<small>問</small></strong></div><div><span>正答率</span><strong>{correctRate}<small>%</small></strong></div><div><span>連続学習</span><strong>{streak}<small>日</small></strong></div></div>;
}
