# GitHub Project（作業ボード）の使い方

## GitHub Projectとは何か
GitHub Projectは，チームの作業を「カード（Issue）」で見える化するボードです．
誰が何をしているか，次に何をするかを共有する場所です．

このプロジェクトのProject名：**電気磁気学AI学習支援Webアプリ**

## 列（Status）の意味
- Backlog：まだ着手しない候補
- Todo：次にやる作業（担当が決まったもの）
- In Progress：作業中
- Review：確認待ち（PR作成済み，レビュー待ち）
- Done：完了

## Projectを開く（画面操作）
1. GitHubで `hitairou/em-ai-learning` を開く
2. 上部メニューの `Projects` を押す
3. 一覧から `電気磁気学AI学習支援Webアプリ` を押す
4. ボードが開いたら，`Backlog` や `Todo` のカードを見る

## 自分の担当Issueを決める（既存Issueを使う）
1. `Backlog` のカードを1つ押す
2. Issue本文を読む（何をするか，完了条件は何か）
3. 右側の `Assignees`（担当者）で自分を選ぶ
4. Project上の `Status` を `Todo` または `In Progress` に変更する
5. 作業が終わったら `Review` に移す（PRを作った後）
6. `main` にmergeされたら `Done` に移す

## 新しくIssueを作る（必要な場合）
1. 上部メニューの `Issues` を押す
2. `New issue` を押す
3. `Feature request`（または `Bug report`）を選ぶ
4. タイトルを書く
5. 本文に，以下を書く
   - 概要（何をするか）
   - やること（チェックリスト）
   - 完了条件（何ができたらOKか）
   - 関連ファイル（触りそうなファイル）
6. 右側の `Labels` を選ぶ（例：`ui`，`diagnosis` など）
7. 右側の `Assignees` で自分を選ぶ
8. `Submit new issue` を押す
9. 作成したIssueをProjectに追加して `Todo` にする

## ラベルの意味（このプロジェクト）
- `question`：問題文，選択肢，解説などコンテンツ
- `diagnosis`：誤解タイプ，診断ロジック
- `llm`：将来のLLM連携，プロンプト
- `scoring`：理解度スコア計算
- `ui`：画面，見た目，操作性
- `infra`：Docker，CI/CD，デプロイ
- `docs`：資料，README
- `presentation`：発表資料，デモシナリオ
- `survey`：評価，アンケート
- `bug`：不具合

## 間違えてIssueを作ったら
- 削除はしなくてOKです．
- Issueにコメントで訂正を書いて，`Close issue` で閉じてください．

## このProjectを見てから何をするか（次の一手）
次にやる作業は，VS Codeでブランチを作って作業することです．
手順は `docs/vscode-copilot-fallback.md` と `docs/tutorial-small-change.md` を見てください．
