"use client";

import { useRouter } from "next/navigation";

export default function DiagnosticSkipButton() {
  const router = useRouter();

  function skip() {
    const confirmed = window.confirm(
      "5問診断をスキップしますか？\n\n"
      + "5問診断を行うと、現在の理解度、苦手単元、誤答原因を最初に推定できるため、ホームの診断スコアやおすすめ問題、復習の優先度がより適切になります。\n\n"
      + "スキップしても学習は始められますが、最初のおすすめ精度は演習履歴がたまるまで低くなります。",
    );
    if (!confirmed) return;
    router.push("/home");
  }

  return (
    <button className="button ghostButton diagnosticSkipAction" type="button" onClick={skip}>
      スキップして始める
    </button>
  );
}
