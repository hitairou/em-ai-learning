# メンバー向けスタートガイド（最初に読む）

このプロジェクトは，電気磁気学（静電界）を対象にした **AI学習支援Webアプリ** を作る共同開発です．

- 学習者が問題を解く
- 回答パターンから「誤解タイプ」を診断する
- 解説と理解度表示で学習を支援する

公開URL：`https://edesign.tairoh.com`
リポジトリ：`hitairou/em-ai-learning`（private）

## まずやること一覧（上から順に）
1. GitHubアカウントを作成する（未作成の場合）
2. GitHub Student Developer Pack / GitHub Copilot Studentを有効化する
3. リポジトリ招待を承認する（privateリポジトリを見るために必要）
4. VS Code + GitHub Copilot Chatで開発できる環境を準備する（標準手順）
5. GitHub Projectを開いて，全体の作業状況を見る
6. Issueを1つ選ぶ（自分が担当する作業を決める）
7. VS Codeでブランチを作り，Copilot Chatを使って小さな修正を行う（標準手順）
8. （使える人だけ）GitHub上のCopilot cloud agent / Agentsを試す
9. Pull Request（PR）を確認する（変更内容をチェックする）
10. レビューを受ける（チームメンバーに確認してもらう）
11. `main` にmergeされる（ここで初めて本番候補に入る）
12. インフラ担当（小若さん等）が `deploy-to-server` を実行する（メンバーは実行しない）
13. 公開URLで反映を確認する

## 大事なこと
- **全部のコードを理解しなくても大丈夫**です．最初は小さな変更から始めます．
- ただし，最低限「流れ」だけは覚えてください．
  - Issueで作業内容を決める
  - AIに小さな作業を依頼する（または自分で修正する）
  - PRで変更内容を確認する
  - `main` に入れる（merge）
  - インフラ担当がデプロイしてサイトに反映する

## 覚えるべき最小概念（超短い説明）
- Repository（リポジトリ）：このプロジェクトのコード置き場
- Issue（イシュー）：やる作業のチケット（「何をするか」を書く）
- Project（プロジェクト）：Issueをカードとして並べる作業ボード
- Branch（ブランチ）：作業用の分岐（`main` を汚さないため）
- Pull Request（PR）：変更を`main`に入れてよいか相談する場所
- Review（レビュー）：PRを確認してコメントすること
- Merge（マージ）：PRの変更を`main`へ取り込むこと
- GitHub Actions：自動でビルドやデプロイを動かす仕組み
- Deploy（デプロイ）：変更を公開サイトに反映すること
- Copilot：AI支援（VS CodeのCopilot Chatが標準）
- VS Code：コード編集アプリ（このプロジェクトの標準手順）

## GitHub画面の見方（どこを押すか）
1. ブラウザでGitHubを開く
2. 右上の検索欄に `hitairou/em-ai-learning` と入力して検索する
3. リポジトリが見えない場合：
   - 招待未承認，または権限不足の可能性があります．招待メールや通知を確認してください．
4. リポジトリを開いたら，上部に次のタブがあります（上の横並びのメニュー）：
   - `Code`：ファイル一覧
   - `Issues`：作業チケット一覧
   - `Pull requests`：PR一覧（レビューもここ）
   - `Actions`：自動ビルド・デプロイの実行結果
   - `Projects`：作業ボード
   - `Agents`：表示される場合があります（ただしCopilot Free / Studentでは「Available on paid plans」と出て使えない場合があります）

## どの資料をどの順番で読むか
1. `docs/member-start-guide.md`（この資料）
2. `docs/github-account-and-copilot-student.md`
3. `docs/vscode-copilot-fallback.md`（標準手順）
4. `docs/github-project-tutorial.md`
5. 実践：`docs/tutorial-small-change.md`
6. `docs/deploy-tutorial.md`
7. 困ったとき：`docs/troubleshooting-for-members.md`
8. `docs/glossary.md`
