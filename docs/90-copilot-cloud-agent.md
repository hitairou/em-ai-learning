# 90 GitHub Copilot cloud agent（有料プラン向け補助）

前へ：[09 Copilot用プロンプト集](./09-copilot-prompts.md) / 次へ：[00 Wiki Home（入口）](./00-wiki-home.md)

この資料は，GitHub上の **Copilot cloud agent / Agents** を使える人向けの補助資料です．  
このプロジェクトの標準手順は `docs/03-vscode-copilot-chat.md`（VS Code + Copilot Chat）です．

## 重要：Copilot Free / Student では使えない場合がある
Copilot Free / Studentでは，Agentsタブが見えても `Available on paid plans. Try it with Copilot Pro` と表示されて **実行できない場合** があります．  
その場合は，無理にagentを使おうとせず，標準手順へ進んでください：`docs/03-vscode-copilot-chat.md`

## 【GitHubで行う】使えるか確認する
1. GitHubで `hitairou/em-ai-learning` を開く
2. 上部に `Agents` タブがあるか確認する（見えない場合もあります）
3. `Agents` が見えても，画面内に `Available on paid plans` が出たら **この機能は使えません**
4. 使えない場合はこの資料は飛ばしてOKです（標準手順へ）：`docs/03-vscode-copilot-chat.md`

## 使える人向け：何ができるか
- Issueを元に，AIにブランチ作成・修正・PR作成までを任せられる（人間はレビューする）
- 小さい修正（文言，UI微調整，docs修正，問題データ追加）に向いている

## ただし，チームのルールは同じ（重要）
- `main` へ直接pushしない（ブランチ＋PR）
- 変更範囲を小さくする（1Issue＝1目的）
- SecretsやAPIキー，サーバー設定には触らない
- `deploy-to-server` を実行しない（担当者のみ）

## 【GitHubで行う】cloud agentに依頼する（概要）
GitHubのUIは変わることがあります．まずは次の「考え方」を押さえます．
1. GitHubで作業したいIssueを開く
2. 右側の `Assignees` で自分を選ぶ（任意）
3. `Agents` 側で「このIssueをやって」と依頼する画面を探す（Issue番号を指定できることが多いです）
4. 指示文に，次を必ず書く
   - 目的（何を直すか）
   - 変更してよいファイル（例：`src/app/page.tsx`）
   - 変更してはいけないもの（Secrets，`.github/workflows/*`，Docker，サーバー設定など）
   - `npm run lint` と `npm run build` を確認すること
5. agentがPRを作ったら，PRを開いて `Files changed` を確認する

指示文例（コピペ可）：
> Issue #13 の対応です．`src/app/page.tsx` のトップページ説明文を，静電界が対象だと伝わるように1〜2文だけ改善してください．変更してよいファイルは `src/app/page.tsx` と `src/app/globals.css` だけです．それ以外のファイルは変更しないでください．`main` へ直接pushせず，Pull Requestを作成してください．`npm run lint` と `npm run build` が通ることも確認してください．

## よくある注意
- agentのPRでも，**人間がレビューしてから**マージします（出力をそのまま信用しない）
- 画面に `Available on paid plans` が出たら，VS Code手順へ切り替えます

（本文は旧ファイル `docs/copilot-agent-tutorial.md` から移行しました）

---
前へ：[09 Copilot用プロンプト集](./09-copilot-prompts.md) / 次へ：[00 Wiki Home（入口）](./00-wiki-home.md)
