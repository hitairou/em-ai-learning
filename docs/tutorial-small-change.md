# チュートリアル（小さな変更で流れを体験）

テーマ：トップページまたは問題演習画面の文言を **1箇所だけ** 改善します．

目的：GitHub Project，Issue，Copilot（agentまたはChat），PR，Review，Merge，Deployの流れを体験することです．

重要：
- 初心者メンバーは `deploy-to-server` を実行しません（小若さん，またはインフラ担当のみ）
- サーバー設定やSecretsには触りません
- `main` へ直接pushしません（必ずブランチ＋PR）

## 0．準備
1. GitHubで `hitairou/em-ai-learning` を開く
2. 上部メニュー `Projects` を押す
3. `電気磁気学AI学習支援Webアプリ` を開く

## 1．練習Issueを開く
1. Projectの `Todo` または `Backlog` にある練習Issueカードを探す
2. カードをクリックしてIssueを開く
3. 右側の `Assignees` で自分を選ぶ
4. `Status` を `In Progress` にする

## 2．Copilot coding agentが使える場合（第一候補）
1. Issue画面でCopilot関連ボタン（`Assign to Copilot` 等）を探す
2. 指示文を書く（下の例をコピペしてOK）
3. 実行する
4. 作成されたPRを開く（`Pull requests` タブ）
5. `Files changed` を見て，変更ファイルが想定どおりか確認する
6. OKならレビュー依頼する（チームに確認してもらう）

### 指示文例（コピペ可）
「トップページの説明文を，静電界が対象だと伝わるように1〜2文だけ改善してください．変更してよいファイルは `src/app/page.tsx` と `src/app/globals.css` だけです．`main` へ直接pushせず，ブランチで作業しPRを作ってください．`npm run lint` と `npm run build` を確認してください．」

## 3．Agentsが使えない場合（VS Code + Copilot Chat）
この場合は `docs/vscode-copilot-fallback.md` の手順どおりです．
流れだけ要約すると，次の順です．
1. cloneする
2. `npm install` → `npm run dev` で動作確認
3. ブランチ作成（例：`feature/13-top-text`）
4. Copilot Chatで小さな変更を作る
5. `npm run lint` / `npm run build`
6. commit → push
7. GitHubでPR作成

## 4．PRを確認する（全員共通）
1. PRの `Conversation` を読む（何を変えたか）
2. `Files changed` を押す
3. 変更ファイルが想定範囲内か確認する
   - OK：`src/app/page.tsx`，`src/app/globals.css` など
   - NG：`.github/workflows/*`，`Dockerfile`，`next.config.ts`，Secrets関連
4. 問題があればPRコメントで質問・修正依頼する

## 5．mergeと反映の流れ
1. PRが `main` にmergeされる
2. GitHub Actionsの `Build and publish Docker image`（docker-publish）が自動実行される
3. インフラ担当が `deploy-to-server` を手動実行する（tagは `main`）
4. スマホのモバイル回線で `https://edesign.tairoh.com` を確認する
   - LAN内はNATループバックで開けない場合があります

## 6．うまくいかないとき
まず `docs/troubleshooting-for-members.md` を見てください．

