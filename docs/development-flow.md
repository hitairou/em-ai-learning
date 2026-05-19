# 共同開発フロー（6人チーム想定）

公開URL：`https://edesign.tairoh.com`

## 開発の基本方針
- **`main` へ直接 push しない**
- まず **Issue を作ってから作業**する（作業の目的・範囲を明確にする）
- 実装は機能単位で分割し、レビュー可能なサイズで Pull Request を出す

## ローカル開発の始め方
```bash
git clone https://github.com/hitairou/em-ai-learning.git
cd em-ai-learning
npm install
npm run dev
```

## Issue の使い方
- 追加したい機能/修正したい点はまず Issue 化
- Issue には「やること」「完了条件」「関連ファイル」を書く
- 作業開始時に担当者を割り当て、ラベルを付ける

## ブランチ運用
- ブランチ名は `feature/<issue番号>-<内容>` を推奨
  - 例：`feature/5-diagnosis-engine`
- UI 改修は `feature/<issue>-ui-*` のようにしてもOK

## Pull Request 運用
- 作業完了後に PR を作成
- PR テンプレに沿って「何を」「なぜ」「どう確認したか」を書く
- レビュー後に `main` に merge

## CI/CD とデプロイ
- `main` に merge されると `docker-publish` が走り、GHCR に image が push される
- サーバー反映は `deploy-to-server` を **手動**で実行（`tag=main` 推奨）
- サーバー側は nginx が `http://127.0.0.1:3010` を upstream としてプロキシする

## 役割分担案（例）
- コンテンツ（問題作成・難易度・タグ）: `問題`
- 診断エンジン（誤解タイプ・ルール）: `診断`
- スコアリング（理解度計算・可視化指標）: `理解度`
- UI/UX: `UI`
- LLM接続・プロンプト: `LLM`
- インフラ（Docker/Actions/デプロイ）: `インフラ`
- 資料・デモシナリオ: `発表` / `資料`
- アンケート・評価設計: `アンケート`

## メンバー招待（GitHub ID が確定してから）
1. リポジトリの `Settings` → `Collaborators` でメンバーを招待
2. 権限は原則 `Write`（必要に応じて調整）
3. 全員がブランチ運用と PR レビューを守る

## GitHub Project（ボード）運用
Project（Board）で `バックログ / 未着手 / 作業中 / レビュー中 / 完了` を使います。

### CLI（gh）でProjectを作る場合
`gh project` を使うには token scope が必要です。`gh auth status` に `project` / `read:project` が無い場合は、**対話モードのターミナル**で次を実行して認証してください。

```bash
gh auth refresh -h github.com -s read:project,project
```

その後の例:
```bash
gh project create --owner hitairou --title "電気磁気学AI学習支援Webアプリ"
gh project list --owner hitairou
```

### GitHub UIでProjectを作る場合（推奨・確実）
もし CLI で Project 操作がうまくいかない場合:
- GitHub UI から `Projects` → `New project`（Board）で作成
- 列を追加して運用開始
- Issue をボードに追加して進捗管理

列（例）:
- バックログ
- 未着手
- 作業中
- レビュー中
- 完了
