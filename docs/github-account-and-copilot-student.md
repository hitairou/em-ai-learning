# GitHubアカウント作成，Copilot Studentの準備

この資料は，GitHubやCopilotを初めて触る人向けです．

## 1．GitHubアカウントを作成する
1. ブラウザで `GitHub` を検索して開く（`https://github.com/`）
2. 右上の `Sign up` を押す
3. メールアドレスを入力する
4. パスワードを設定する
5. ユーザー名を決める
6. 画面の案内に沿ってメール認証を行う
7. GitHubにログインできることを確認する

### ユーザー名の注意
- 本名でなくてもOKです．
- ただし，チーム内で誰かわかる名前にしてください（後で共有します）．

## 2．2段階認証（Two-factor authentication）を設定する
2段階認証は，不正ログインを防ぐために重要です．

1. GitHub右上の自分のアイコンを押す
2. `Settings` を押す
3. 左メニューから `Password and authentication` を探して押す
4. `Two-factor authentication` を有効化して設定する（画面の案内に従う）

## 3．リポジトリ招待を承認する（privateリポジトリ閲覧に必要）
1. 招待メールを確認する（GitHubから届きます）
2. または，GitHub右上の通知（ベルアイコン）を開く
3. `Accept invitation` を押す
4. `hitairou/em-ai-learning` が見えることを確認する

## 4．Student Developer Packを申請する（Studentの場合）
1. ブラウザで `GitHub Education Student Developer Pack` を検索して開く
2. `Student Developer Pack` を選ぶ
3. 学校メール，または学生証明で申請する
4. 承認されるまで待つ（数日かかる場合があります）

## 5．GitHub Copilot Studentを有効化する
1. GitHub右上の自分のアイコンを押す
2. `Settings` を押す
3. 左メニューで `Copilot` を探して開く
4. Copilotを有効化する（画面の案内に従う）

## 6．Copilotが使えるか確認する方法
### GitHub上で確認
- リポジトリやIssue画面で `Copilot` の表示があるか確認します．

### VS Codeで確認
- `docs/vscode-copilot-fallback.md` の手順でVS CodeにCopilot拡張を入れると，Copilot Chatが表示されます．

## 7．Copilot coding agent / Agentsタブの確認方法
1. GitHubで `hitairou/em-ai-learning` を開く
2. 上部メニューに `Agents` タブがあるか確認する
3. `Agents` が無い場合でも異常ではありません（プラン，提供状況，権限で見えない場合があります）
4. `Agents` が見えても，Copilot Free / Studentでは `Available on paid plans. Try it with Copilot Pro` のように表示されて **cloud agentを実行できない場合があります**．

### Agentsタブが見えない場合
- 異常ではありません．このプロジェクトの標準手順はVS Code + Copilot Chatです．次の資料を使ってください：`docs/vscode-copilot-fallback.md`

### `Available on paid plans` と出た場合
- 有料プラン向けの機能です．無理に使おうとせず，標準手順（VS Code + Copilot Chat）へ進んでください：`docs/vscode-copilot-fallback.md`

## 注意（絶対にやらないこと）
- パスワードをIssueに書かない
- APIキーをIssueに書かない
- SSH秘密鍵を貼らない
- GitHub Tokenを貼らない
- Copilotの出力をそのまま信用しない（必ずPRで確認する）
