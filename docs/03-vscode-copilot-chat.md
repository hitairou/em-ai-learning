# 03 VS Code + GitHub Copilot Chat（初心者向け・標準手順）

前へ：[02 GitHubアカウント作成，Copilot Studentの準備](./02-github-account-and-copilot-student.md) / 次へ：[04 GitHub Project（作業ボード）の使い方](./04-github-project-tutorial.md)

このプロジェクトでは，GitHub上のCopilot cloud agent（Agentsタブ）は **有料プラン向け**で，全員が使える前提にしません．  
初心者メンバーの標準手順は **VS Code + GitHub Copilot Chat** です．

もしGitHubの画面に `Available on paid plans. Try it with Copilot Pro` と表示されたら，迷わずこの手順で進めてください．

公開URL：`https://edesign.tairoh.com`

---

## 0．全体の流れ（16ステップ）
最初に「何をしている作業か」をイメージできるように，全体像を先に示します．

1. **必要なアプリを入れる**：VS Code，Git，Node.jsを準備する
2. **GitHubにログインする**：GitHubとCopilotを使える状態にする
3. **VS Codeでリポジトリをcloneする**：GitHub上のプロジェクトを自分のPCにコピーする（clone）
4. **npm installで必要な部品を入れる**：アプリを動かすためのライブラリをまとめて入れる
5. **npm run devでローカル起動する**：自分のPCで動かして確認する（`http://localhost:3000`）
6. **GitHubでIssueを確認する**：今回やる作業（チケット）を決める
7. **VS CodeでIssue番号付きのブランチを作る**：`main` を直接触らず安全に作業する分岐を作る（branch）
8. **Copilot Chatに修正を依頼する**：AIに小さな修正を手伝ってもらう
9. **変更内容を確認する**：差分（diff）を見て，意図した変更だけか確認する
10. **npm run lint / npm run buildで確認する**：書き方のルールとビルド可否を確認する
11. **commitする**：変更を一区切りとして保存する（commit）
12. **Branch の発行でpushする**：自分のPCの変更をGitHubへ送る（push）
13. **GitHubでPull Requestを作る**：`main` に入れてよいか確認してもらう依頼（PR）
14. **PR本文でIssueと紐づける**：`Closes #14` のように書いて，マージ時にIssueを自動で閉じる
15. **マージ後にIssue，Actions，デプロイを確認する**：ビルド成功を見て，デプロイは担当者が実行する
16. **VS Codeでmainに戻り，git pullして最新化する**：自分のPCの`main`は自動で最新にならないので更新する

---

## 1．必要なアプリを入れる

### 【ブラウザで行う】VS Codeを入れる
1. ブラウザで `Visual Studio Code` を検索して開く
2. `Download for Windows` を押す
3. インストーラを実行する
4. 途中に `Add to PATH` があればチェックして進める

### 【ブラウザで行う】Gitを入れる（Git for Windows）
1. ブラウザで `Git for Windows` を検索して開く
2. `Download` を押す
3. 基本は `Next` で進める（迷ったらデフォルト）

### 【ブラウザで行う】Node.jsを入れる（LTS）
1. ブラウザで `Node.js` 公式サイトを開く
2. `LTS` を選ぶ
3. インストールする

### 【PowerShellで行う】wingetで一括インストール（できる人向け）
Windowsにwingetがある場合は次でもOKです．

```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
```

### 【PowerShellで行う】インストール後の確認
```powershell
git --version
node -v
npm -v
```
数字が表示されればOKです．

---

## 2．GitHubにログインする

### 【ブラウザで行う】GitHubログイン確認
1. ブラウザで `https://github.com/` を開く
2. 右上からログインする
3. `hitairou/em-ai-learning` が見えることを確認する
   - 見えない場合：招待未承認の可能性があります（通知／メールを確認）

### 【VS Codeで行う】VS CodeでGitHubにログインする
1. VS Codeを開く
2. 左下のアカウントアイコン（人の形）を押す
3. `Sign in with GitHub` を押す
4. ブラウザが開くので承認する
5. VS Codeに戻ってログインできたことを確認する

---

## 3．VS Codeでリポジトリをcloneする

### 【GitHubで行う】clone用URLをコピーする
1. GitHubで `hitairou/em-ai-learning` を開く
2. 緑の `Code` ボタンを押す
3. `HTTPS` を選び，URLをコピーする

### 【VS Codeで行う】cloneする
1. VS Codeを開く
2. `Ctrl + Shift + P` を押す（コマンドパレット）
3. `Git: Clone` と入力して選ぶ
4. コピーしたURLを貼り付ける
5. 保存先フォルダを選ぶ
6. `Open` を押す

---

## 4．npmコマンドの意味（初心者向け）

### 【VS Codeで行う】ターミナルを開く
1. VS Code上部メニュー `Terminal` → `New Terminal` を押す

### npm install
- 何をする：`package.json` を見て，必要なライブラリを `node_modules` に入れる
- いつやる：初回clone後，または `package.json` が変わった後

### npm run dev
- 何をする：開発用サーバーを起動する（developmentの略）
- 何が嬉しい：保存すると自動反映される
- どこを見る：`http://localhost:3000`

### npm run build
- 何をする：本番公開用に変換できるか確認する（ビルド）
- 注意：**buildが成功しても `localhost` は開けません**（devが必要）
- 使いどころ：PR前の確認

### npm run start
- 何をする：build済みのアプリを本番相当で起動する
- 初心者は通常 `npm run dev` でOK

### npm run lint
- 何をする：書き方の問題やルール違反を確認する

### 注意：npm audit fix --force について
`npm audit fix --force` は破壊的変更が入る場合があります．  
初心者は **勝手に実行しない**でください．必要なら管理者に相談します．

---

## 5．ローカル起動（動作確認）

### 【VS Codeで行う】依存関係インストール
```powershell
npm install
```

### 【VS Codeで行う】開発サーバー起動
```powershell
npm run dev
```

### 【ブラウザで行う】表示確認
1. ブラウザで `http://localhost:3000` を開く
2. 次も開く
   - `http://localhost:3000/practice`
   - `http://localhost:3000/progress`

止めるとき：
- ターミナルで `Ctrl + C`

---

## 6．GitHubでIssueを確認する

### 【GitHubで行う】Issueを開く
1. GitHubでリポジトリを開く
2. 上部の `Issues` を押す
3. 今回やるIssueを開く（練習なら `#13`）
4. 右側の `Assignees` で自分を選ぶ

### Issue番号とPR番号は別物（重要）
例：
- Issue `#14`
- ブランチ `feature/14-light-mode-background`
- Pull Request `#15`

PR番号は新しく採番されるので，番号が違うのは正常です．

---

## 7．ブランチを作る（Issue番号と紐づける）

### 【VS Codeで行う】ブランチ作成
1. VS Code左下のブランチ名（例：`main`）をクリック
2. `Create new branch` を選ぶ
3. ブランチ名を入力してEnter

ブランチ名の例：
- `feature/14-light-mode-background`
- `fix/14-light-mode-background`
- `docs/14-update-readme`

---

## 8．Copilot Chatに修正を依頼する

### 【VS Codeで行う】Copilot Chatを開く
VS Codeの表示名はバージョンで変わります（`Chat` / `Copilot` / `Agents` など）．

1. 左側のアクティビティバーに `Copilot Chat` のアイコンがあれば押す
2. 見えない場合：
   - 左側のアクティビティバー下部の `…` を押して，`Copilot Chat` を探して有効化する
   - それでも無い場合：左側の `Extensions` で `GitHub Copilot` と `GitHub Copilot Chat` が **Install済み・有効**か確認する
   - さらに：VS Code左下のアカウントで **GitHubにログイン済み**か確認する

### 【VS Codeで行う】依頼のコツ（重要）
- 変更したいファイルを具体的に書く（例：`src/app/page.tsx`）
- 変更範囲を小さくする（「1〜2文だけ」など）
- 触ってはいけないものを書く（Secrets，workflowなど）

依頼文例（コピペ可）：
「`src/app/page.tsx` のトップページ説明文を，静電界が対象だと伝わるように1〜2文だけ改善してください．変更してよいファイルは `src/app/page.tsx` と `src/app/globals.css` だけです．それ以外のファイルは変更しないでください．」

---

## 9．変更内容を確認する（差分を見る）

### 【VS Codeで行う】Source Controlで確認
1. 左側の `Source Control`（枝分かれアイコン）を押す
2. 変更ファイル一覧を見る
3. 各ファイルをクリックして差分を見る
4. 赤は削除，緑は追加です

想定外の変更が出たら：
- Copilotに「変更を `src/app/page.tsx` と `src/app/globals.css` だけに戻して」と依頼する

---

## 10．lintとbuildで確認する（PR前の必須）

### 【VS Codeで行う】コマンド実行
```powershell
npm run lint
npm run build
```
失敗したら，エラーの先頭3行をコピーしてIssueかPRに貼って相談してください．

---

## 11．commitする

### 【VS Codeで行う】commit手順
1. `Source Control` を開く
2. `Message` 欄にコミットメッセージを書く（例：`トップページ説明文を改善`）
3. `Commit` を押す

---

## 12．pushする（VS Codeでは「Branch の発行」と表示されることがある）

### 【VS Codeで行う】初回push
初回push時，VS Codeでは `Push` ではなく青いボタンで **「Branch の発行」** と表示されることがあります．  
これは「このローカルブランチをGitHubに初めてpushする」という意味なので，押してOKです．

流れ（この順）：
1. `Source Control` で変更ファイルを確認
2. `Message` にメッセージを書く
3. `Commit` する
4. 青い `Branch の発行` を押す
5. GitHub上にブランチが作られる
6. Pull Requestを作れるようになる

---

## 13．Pull Requestを作る

### 【GitHubで行う】PR作成
1. GitHubでリポジトリを開く
2. `Compare & pull request` が出ていれば押す
3. 出ていなければ `Pull requests` → `New pull request`
4. `base: main` と `compare: 自分のブランチ` になっていることを確認
5. タイトルを書く
6. PR本文をテンプレに沿って書く
7. `Create pull request` を押す

---

## 14．PR本文でIssueと紐づける（自動でIssueを閉じる）

### 【GitHubで行う】Closes / Fixes を書く
PR本文に次のように書きます：
- `Closes #14`
- または `Fixes #14`

こう書くと，PRが`main`にマージされたときにIssueが自動で閉じます．

---

## 15．マージ後にIssue，Actions，デプロイを確認する

### 【GitHubで行う】PRの確認とマージ
1. PRを開く
2. `Files changed` で変更ファイルが想定どおりか確認する
3. `Checks`（または `Actions`）が緑のチェックになっているか確認する
4. 問題がなければ `Merge` する

注意：
- 「メンバーはPR作成まで，マージは管理者が行う」などのルールがある場合は，そのルールに従ってください．

### 【GitHubで行う】IssueとProjectの更新
1. `Closes #番号` が書いてあれば，マージ後にIssueが自動で閉じます
2. 自動で閉じなかった場合は，Issueを開いて `Close issue` を押します
3. ProjectのStatusを必要に応じて `完了` にします（運用ルールに従う）

### 【GitHubで行う】Actionsの確認（ビルドとデプロイ）
用語：
- **ビルド（build）**：アプリを作れるかの確認
- **デプロイ（deploy）**：公開環境へ反映する作業

確認手順：
1. リポジトリ上部の `Actions` タブを開く
2. 最新のworkflowを見る
3. 緑のチェックなら成功，赤い×なら失敗
4. 失敗したら開いて `logs` を読む
   - build失敗：まずローカルで `npm run build` を確認する
   - deploy失敗：サーバー設定やSecretsの可能性があるので，管理者に相談する

注意：
- `deploy-to-server` は担当者（小若さん，インフラ担当）のみが実行します．

---

## 16．VS Codeでmainに戻り，最新化する（重要）
PRがマージされても，自分のPCの`main`は自動では最新になりません．

### 【VS Codeで行う】mainに戻って同期する
1. 左下のブランチ名をクリック
2. `main` を選ぶ
3. `Source Control` の同期ボタン（丸い矢印）を押す（表示がある場合）

### 【PowerShellで行う】確実に最新化する
```powershell
git checkout main
git pull origin main
```

### 【PowerShellで行う】古い作業ブランチを消す（任意）
```powershell
git branch -d feature/14-light-mode-background
```

### 画面表示が古いと感じたら
devサーバーを再起動します．

```powershell
# devサーバーを止める（ターミナルで）
Ctrl + C

# 再起動
npm run dev
```

---

## トラブルシューティング（強化版）

### localhostが開けない
- `npm run build` だけでは開けません．**`npm run dev` が必要**です．
- ターミナルに出ているURLとポート（例：`http://localhost:3000`）を確認してください．

### mainに戻ったのに変更が反映されない
- `git pull` していない可能性があります．`git pull origin main` を実行してください．
- `npm run dev` の表示が古い場合があります．ブラウザ更新，またはdevサーバー再起動をしてください．

### Copilot Chatが見つからない
- 表記ゆれがあります（`Chat` / `Copilot` / `Agents`）．
- 左側の `…` から探す
- Extensionsで `GitHub Copilot Chat` が有効か確認する
- VS CodeでGitHubログイン状態を確認する

### Pushできない
- GitHubにログインできているか
- リポジトリ権限があるか（招待承認済みか）
- 先にcommitしているか（commitしていないとpushできません）

### IssueとPRの番号が違う
- 正常です．Issue番号とPR番号は別物です．
- PR本文に `Closes #Issue番号` を書くと紐づけできます．

困ったら：`docs/07-troubleshooting-for-members.md` を見てください．

---
前へ：[02 GitHubアカウント作成，Copilot Studentの準備](./02-github-account-and-copilot-student.md) / 次へ：[04 GitHub Project（作業ボード）の使い方](./04-github-project-tutorial.md)
