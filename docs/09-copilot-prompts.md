# 09 Copilot用プロンプト集（コピペで使える）

前へ：[08 用語集（初心者向け）](./08-glossary.md) / 次へ：[90 GitHub Copilot cloud agent（有料プラン向け補助）](./90-copilot-cloud-agent.md)

このページは，主に **VS CodeのCopilot Chat** に投げる依頼文テンプレ集です．
（本文は旧ファイル `docs/copilot-agent-prompts.md` から移行しています）

共通ルール（全部に必ず入れる）：
- `main` へ直接pushしない
- 新しいブランチで作業する
- Pull Requestを作る
- `npm run lint` と `npm run build` を実行する
- 変更したファイルを説明する
- 既存機能を壊さない
- SecretsやAPIキーに触らない
- `deploy-to-server` を実行しない
- サーバー設定（nginx，certbot）に触らない

## 文言修正テンプレ（最初におすすめ）
「`src/app/page.tsx` の説明文を，静電界が対象だと伝わるように1〜2文だけ改善してください．変更範囲は `src/app/page.tsx` と `src/app/globals.css` のみ．`main` へ直接pushしないでブランチを作り，PRを作成してください．`npm run lint` と `npm run build` を実行して成功することを確認し，変更したファイルをPR本文に説明してください．SecretsやAPIキーには触らないでください．」

## UI改善テンプレ（小）
「`src/components/QuestionViewer.tsx` の選択肢ボタンの見た目を少し改善してください（余白，ホバー，選択中の強調）．変更範囲は `src/components/QuestionViewer.tsx` と `src/app/globals.css` のみ．PRを作り，`npm run lint` と `npm run build` を確認してください．」

## 問題追加テンプレ（小）
「`src/data/questions.ts` に静電界の基礎問題を1問追加してください．既存の型（`src/types/learning.ts`）に合わせてください．変更後に `npm run build` が通ることを確認し，PRを作成してください．」

## バグ修正テンプレ
「再現手順：<ここに再現手順>．期待：<期待>．実際：<実際>．原因を調べ，最小の修正で直してください．修正後に `npm run lint` と `npm run build` を確認し，PRを作成してください．」

---

## 補助：GitHub Copilot cloud agentを使える人向け
Copilot Free / Studentでは，Agentsタブが見えても `Available on paid plans` と表示されて使えない場合があります．
使える人だけ `docs/90-copilot-cloud-agent.md` を参照してください．

---
前へ：[08 用語集（初心者向け）](./08-glossary.md) / 次へ：[90 GitHub Copilot cloud agent（有料プラン向け補助）](./90-copilot-cloud-agent.md)

