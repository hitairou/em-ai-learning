# GitHub Copilot cloud agent（有料プラン向け補助）チュートリアル

この資料は，GitHub上の **Copilot cloud agent / Agents** を使える人向けの補助資料です．
このプロジェクトの標準手順は `docs/vscode-copilot-fallback.md`（VS Code + Copilot Chat）です．
Copilot Free / Studentでは，Agentsタブが見えても `Available on paid plans. Try it with Copilot Pro` と表示されて実行できない場合があります．

## Copilot cloud agentとは何か
- GitHub上でIssueをもとにAIへ作業を任せる機能です．
- AIが次のことを行います（環境により差があります）．
  - ブランチ作成
  - ファイル修正
  - Pull Request（PR）作成
- 人間は，PRの変更内容を確認して，必要なら修正依頼を出します．

## 人間がやること（重要）
1. Issueを選ぶ
2. 目的をはっきりさせる（何を変えるかを小さく）
3. Copilot agentに依頼する
4. PRを開いて説明を読む
5. `Files changed` を見て変更内容を確認する
6. 必要ならPRにコメントして修正依頼する
7. OKならレビューしてもらい，`main` にmergeする

## agentに向いている作業（補助として）
- 文言修正
- UIの軽微な変更
- 問題データ追加
- READMEやdocs修正
- 小さなコンポーネント改善
- 学習アドバイス文の改善

## agentに向かない作業（禁止）
- Secrets変更
- SSH鍵操作
- サーバー設定（nginx，certbot）
- `deploy-to-server` 実行
- 大規模なDockerやGitHub Actions変更
- APIキーを扱う作業

## 画面操作（Issueから作業を開始する）
1. GitHubで `hitairou/em-ai-learning` を開く
2. 上部メニューの `Issues` を押す
3. 作業したいIssueを開く
4. Issue本文を読む
5. 右側の `Assignees` で自分を選ぶ
6. Projectの `Status` を `In Progress` に変更する

## 画面操作（Agentsタブが見える場合）
1. 上部メニューの `Agents` を押す
2. `New task` または `New agent task` のようなボタンを押す
3. Repositoryに `hitairou/em-ai-learning` を選ぶ
4. 対象Issueを選ぶ（またはIssue番号を入力する）
5. 指示文を書く（例は下）
6. 実行ボタンを押す
7. agentがPRを作ったら，`Pull requests` からPRを開く

## 画面操作（Issue画面にCopilotボタンがある場合）
1. Issue画面で `Assign to Copilot` / `Ask Copilot` / `Start coding agent` などのボタンを探す
2. ボタンを押して指示文を書く
3. 実行後，作成されたPRを開く

## PR確認のしかた（初心者向け）
1. PRを開く
2. `Conversation` タブで，何をしたか説明を読む
3. `Files changed` タブを押す
4. 変更されたファイル名を見る（想定外のファイルが無いか）
5. 赤い行は削除，緑の行は追加です
6. わからなければ，PRにコメントで質問してOKです

## agentへ依頼するときの重要ルール（コピペ可）
- `main` へ直接pushしない
- 新しいブランチで作業する
- Pull Requestを作る
- 変更範囲を小さくする（ファイルを指定する）
- `npm run lint` と `npm run build` を確認する
- SecretsやAPIキーに触らない
- `deploy-to-server` を実行しない
- サーバー設定に触らない

## 依頼文テンプレ（短い例）
より多くの例は `docs/copilot-agent-prompts.md` を見てください（VS Code用が中心です）．

### 例1：文言修正（小）
「`src/app/page.tsx` のトップページの説明文を，静電界が対象だと伝わるように1〜2文だけ改善してください．変更範囲は `src/app/page.tsx` のみでお願いします．`main` へ直接pushせずPRを作ってください．`npm run lint` と `npm run build` を確認してください．」

### 例2：問題追加（小）
「`src/data/questions.ts` に静電界の基礎問題を1問追加してください．既存の型定義に合わせてください．`main` へ直接pushせずPRを作成し，`npm run build` が通ることを確認してください．」
