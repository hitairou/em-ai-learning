# VS Code + Copilot Chat（標準手順）

このプロジェクトの初心者向け **標準手順** は，VS Code + GitHub Copilot Chatです．
GitHub上のCopilot cloud agentは有料プラン向けで，全員が使える前提にできません．
`Agents` タブが見えなかったり，画面に `Available on paid plans` と出た場合は，この資料の手順で進めてください．

## まず覚える（超短い説明）
- VS Code：コードや文章を編集するアプリ
- Git：変更履歴を管理する仕組み
- GitHub：チームでコードを共有する場所
- Copilot Chat：VS Code内でAIに相談しながら修正できる機能

## 1．必要なものをインストールする
### 1-1．VS Code
1. ブラウザで `Visual Studio Code` を検索して開く
2. `Download for Windows` を押す
3. インストーラを実行する
4. 途中に `Add to PATH` があればチェックして進める

### 1-2．Git（Git for Windows）
1. ブラウザで `Git for Windows` を検索して開く
2. `Download` を押す
3. 基本は `Next` で進める（迷ったらデフォルト）

### 1-3．Node.js
1. ブラウザで `Node.js` 公式サイトを開く
2. `LTS` を選ぶ
3. インストールする

## 2．VS CodeにCopilot拡張を入れる
1. VS Codeを開く
2. 左側の `Extensions`（四角が並んだアイコン）を押す
3. 検索欄に `GitHub Copilot` と入力する
4. `GitHub Copilot` を `Install`
5. `GitHub Copilot Chat` も `Install`
6. 画面の案内に従い，GitHubにログインする
   - 左下のアカウントアイコン → `Sign in with GitHub`
   - ブラウザで認証
7. Copilot Chatが開けることを確認する
   - 左側に `Copilot Chat` のアイコンが出ているか確認する
   - 見当たらない場合は，Extensionsで `GitHub Copilot Chat` が有効か確認する

## 3．リポジトリをcloneする
1. ブラウザで `hitairou/em-ai-learning` を開く
2. 緑の `Code` ボタンを押す
3. `HTTPS` のURLをコピーする
4. VS Codeに戻る
5. `Ctrl + Shift + P` を押す（コマンドパレット）
6. `Git: Clone` と入力して選ぶ
7. コピーしたURLを貼り付ける
8. 保存先フォルダを選ぶ
9. `Open` を押す

## 4．ローカル起動（動作確認）
1. VS Code上部メニュー `Terminal` → `New Terminal` を押す
2. ターミナルで以下を実行する
   - `npm install`
   - `npm run dev`
3. ブラウザで `http://localhost:3000` を開く
4. `http://localhost:3000/practice` と `http://localhost:3000/progress` も開く

## 5．作業ブランチを作る
1. VS Code左下のブランチ名（例：`main`）を押す
2. `Create new branch` を選ぶ
3. ブランチ名を入力する：`feature/<issue番号>-<内容>`
   - 例：`feature/13-top-text`
4. Enterを押す

## 6．Copilot Chatに依頼する（例文あり）
1. VS Code左側の `Copilot Chat` アイコンを押す
2. チャット欄に依頼文を書く
3. **対象ファイル**と**変更範囲**を必ず書く
4. 生成された変更を確認して適用する
5. わからない場合は，Copilotに「変更内容を初心者向けに説明して」と追加で聞く

### 例文（コピペ可）
- 「`src/app/page.tsx` のトップページ説明文を，静電界に特化した学習支援システムだと分かるように1〜2文だけ改善してください．大きな構造変更はしないでください．」
- 「`src/data/questions.ts` に静電界の基礎問題を1問追加してください．既存の型定義に合わせ，`npm run build` が通るようにしてください．」
- 「`src/lib/feedback.ts` のテンプレート解説を，初学者にも分かりやすい表現にしてください．関数名や引数は変えないでください．」

## 7．変更確認（必ずやる）
1. 左側の `Source Control`（枝分かれアイコン）を押す
2. 変更ファイル一覧を見る
3. 各ファイルをクリックする
4. 赤は削除，緑は追加
5. **想定外のファイル**（`.github/workflows`，Docker関連など）が触られていないか確認する

## 8．動作確認（最低限）
ターミナルで以下を実行する
- `npm run lint`
- `npm run build`

## 9．commitする
1. `Source Control` の `Message` 欄に変更内容を書く
   - 例：`トップページ説明文を改善`
2. `Commit` を押す

## 10．pushする
1. `Sync Changes` または `Publish Branch` を押す
2. GitHubにブランチが上がったことを確認する

## 11．Pull Requestを作る
1. ブラウザで `hitairou/em-ai-learning` を開く
2. `Compare & pull request` が出ていれば押す
3. 出ていない場合：`Pull requests` → `New pull request`
4. タイトルを書く
5. PRテンプレに沿って内容を書く
6. `Create pull request` を押す

## よくあるトラブル（まず見る場所）
- `npm install` で止まる：ターミナルのエラー行
- `npm run dev` で止まる：ターミナルのエラー行
- `localhost` が開けない：ターミナルに表示されたURLとポート
- Copilotが出ない：VS Code右下のサインイン状態，Extensionsが有効か
- pushできない：GitHubにログインできているか，権限があるか

困ったら：`docs/troubleshooting-for-members.md` を見てください．
