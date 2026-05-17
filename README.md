# 電気磁気学AI学習支援Webアプリ（共同開発用土台）

## プロジェクト概要
静電界（電気静力学）の学習者が、選択式問題を解くことで「誤解タイプ」を診断し、診断結果と学習アドバイスを表示する Web アプリです。

本リポジトリは **6人グループで GitHub を使って共同開発するための Next.js + TypeScript（App Router）MVP土台** です。

## 対象分野
- 電場と電位（ベクトル量・スカラー量、E = −∇V）
- 電場の向き（正電荷・負電荷、電位の減少方向）
- 距離依存性（点電荷：|E| ∝ 1/r²、V ∝ 1/r）
- 等電位面と電場の関係（直交）

## 目的
- 中間発表で「動く最小MVP」をデモできる状態にする
- 後から DB や LLM API に置き換えやすい内部構造で実装を進める

## 主な機能（現状のMVP）
- トップページ（概要・導線）
- 問題演習（静電界のサンプル問題 5問、1問ずつ回答）
- 回答後の表示：正誤、誤解タイプ、学習アドバイス（テンプレート生成）
- 理解度表示：分野別スコア（正答率）と回答履歴の概要

## ローカル起動方法
前提：Node.js と npm が入っていること

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## 開発に必要なコマンド
```bash
# 開発サーバ
npm run dev

# 本番ビルド（必須：成功すること）
npm run build

# Lint
npm run lint
```

## Docker（本番想定）
本番公開URL：`https://edesign.tairoh.com`

このプロジェクトは Next.js の `output: "standalone"` を有効化しており、Docker では `server.js`（standalone出力）を起動します。

### Docker build（ローカル）
```bash
docker build -t em-ai-learning:local .
```

### Docker run（ローカル）
```bash
docker run --rm -p 3000:3000 em-ai-learning:local
```

ブラウザで `http://localhost:3000` を開きます。

### ESPRIMO Ubuntu（想定）起動コマンド
（サーバー操作はこのリポジトリでは行いません）

```bash
docker run -d \
  --name em-ai-learning \
  --restart unless-stopped \
  -p 127.0.0.1:3010:3000 \
  ghcr.io/<OWNER>/em-ai-learning:main
```

#### ホスト側ポート `3010` を使う理由
- 既存サービス（`ops-ecorun` / `man-ecorun` / `n8n` / `homeassistant`）とポート競合を避けるため
- Nginx のリバースプロキシが `127.0.0.1:3010` を upstream として参照する前提のため

## GitHub Actions（2段階デプロイ）
このプロジェクトは **既存 ops/man 方式に合わせた2段階** でデプロイします。

- `docker-publish.yml`：`main` push で Docker image を GHCR に build & push
- `deploy-to-server.yml`：手動（workflow_dispatch）でサーバーへデプロイ（tar.gz 転送方式）

必要な Secrets（Repository secrets）:
- `SSH_HOST`
- `SSH_USER`
- `SSH_PORT`
- `SSH_KEY`

初回手順（推奨）:
1. `main` へ push
2. `Build and publish Docker image` の完了を確認
3. `deploy-to-server` を `tag=main` で手動実行
4. `https://edesign.tairoh.com` を確認

詳細は `docs/deployment.md` を参照してください。

## 共同開発の始め方（6人チーム）
### 1) clone
```bash
git clone https://github.com/hitairou/em-ai-learning.git
cd em-ai-learning
```

### 2) 起動
```bash
npm install
npm run dev
```

### 3) Issue → Branch → PR
- まず Issue を作る（または既存 Issue を担当する）
- ブランチ名例：`feature/5-diagnosis-engine`
- 作業後は Pull Request を作成し、レビュー後に `main` へマージ

開発フロー詳細：`docs/development-flow.md`
初期タスク一覧：`docs/initial-issues.md`

### 役割分担案
- `question`：問題作成・タグ/難易度
- `diagnosis`：誤解タイプ・診断ルール
- `scoring`：理解度指標・計算
- `ui`：画面・UX
- `llm`：プロンプト/将来のAPI接続
- `infra`：Docker/Actions/デプロイ
- `presentation`：発表資料・デモ
- `survey`：評価・アンケート

## メンバー向け資料（まずここから）
初めて参加する人は，最初に `docs/member-start-guide.md` を読んでください．
標準手順は `docs/vscode-copilot-fallback.md`（VS Code + GitHub Copilot Chat）です．
GitHub上のAgentsは有料プラン向けで，Copilot Free / Studentでは使えない場合があります（`Available on paid plans` と表示されたらVS Code手順へ進みます）．
`deploy-to-server` は小若さん，またはインフラ担当のみが実行します．

- `docs/member-start-guide.md`
- `docs/github-account-and-copilot-student.md`
- `docs/vscode-copilot-fallback.md`
- `docs/github-project-tutorial.md`
- `docs/tutorial-small-change.md`
- `docs/deploy-tutorial.md`
- `docs/troubleshooting-for-members.md`
- `docs/glossary.md`
- `docs/copilot-agent-prompts.md`
- `docs/copilot-agent-tutorial.md`（有料プランでAgentが使える人向け）

## 内部構造（主要ファイル）
- `src/types/learning.ts`：型定義（Question / Choice / MisconceptionType / DiagnosisResult / LearningScore など）
- `src/data/questions.ts`：静電界のサンプル問題 5問（選択肢に誤解タイプを付与）
- `src/lib/diagnosis.ts`：回答から正誤・誤解タイプ・診断文を返す
- `src/lib/scoring.ts`：回答結果から分野別理解度スコアを更新する
- `src/lib/feedback.ts`：LLM を使わず、テンプレートで学習アドバイス文を生成する
- `src/components/`：問題表示・診断結果表示・理解度表示などの UI

※ データは現時点では **DB ではなく localStorage** に保存します（サーバ不要・秘密情報不要）。

## 今後実装する機能（例）
- 問題数の拡張（タグ/難易度の充実、出題順の最適化）
- より精密な誤解診断（複数設問の回答パターンから推定）
- 学習アドバイスの高度化（LLM API 連携に差し替え）
- 教員用ビュー（クラス全体の傾向など）
- DB導入（ユーザー・履歴・問題管理）

## 共同開発時の注意
- **秘密情報（APIキー等）を作成しない／コミットしない**（このMVPは不要です）
- 変更は基本的にブランチで作業し、Pull Request でレビューしてから取り込む
- UI とロジックはできるだけ分離する（`src/lib/` に寄せる）
- 問題データは `src/data/questions.ts` に集約し、型（`src/types/learning.ts`）を崩さない
- LLM API 連携に備え、`src/lib/feedback.ts` の関数インターフェースは大きく崩さない
