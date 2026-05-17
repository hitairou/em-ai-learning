import Link from "next/link";

export default function Home() {
  return (
    <div className="stack">
      <section className="hero">
        <h1 className="title">電気磁気学AI学習支援システム</h1>
        <p className="subtitle">静電界における誤解診断Webアプリ</p>
        <div className="heroActions">
          <Link className="buttonPrimary" href="/practice">
            問題演習を始める
          </Link>
          <Link className="buttonSecondary" href="/progress">
            理解度を見る
          </Link>
        </div>
      </section>

      <section className="card">
        <h2 className="h2">対象分野（静電界）</h2>
        <ul className="list">
          <li>電場と電位の違い（ベクトル量 vs スカラー量）</li>
          <li>電場の向き（正電荷・負電荷、電位の勾配）</li>
          <li>距離依存性（点電荷の 1/r² と電位の 1/r）</li>
          <li>等電位面と電場の関係（直交・接線方向）</li>
        </ul>
      </section>

      <section className="card">
        <h2 className="h2">主な機能（MVP）</h2>
        <ul className="list">
          <li>5問の選択式問題を1問ずつ解く</li>
          <li>回答パターンから誤解タイプを推定</li>
          <li>診断結果と学習アドバイスを表示（テンプレート生成）</li>
          <li>分野別理解度スコアを可視化</li>
        </ul>
        <p className="muted">
          ※ 現時点ではデータベースもLLM APIも使いません（後から差し替え可能な構造にしています）。
        </p>
      </section>
    </div>
  );
}
