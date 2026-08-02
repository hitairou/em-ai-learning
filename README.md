# EM PASS - 電磁気AI学習支援

大学レベルの電磁気学を対象に、5問診断、苦手別演習、AI採点、優先復習、写真・PDF質問を一つの学習履歴へまとめるWebアプリです。特定の大学・教育機関が公式に提供するサービスではありません。答えだけではなく、使う法則、途中式、符号、単位、ベクトル方向、境界条件を確認する設計です。

## 主な機能

- メール・パスワード認証（bcryptjs、署名付きJWT、httpOnly cookie）
- 電磁気1・2の選択と5問診断
- 回答時間・ヒント・誤答原因を含む単元別スキルプロファイル
- 基礎確認、標準演習、試験対策の3モード
- AI採点と、OpenAI API障害時のテンプレート採点
- 画像、PDF、テキストからの質問と類題生成
- 復習キュー、質問・演習履歴、プロフィール
- 問題・教材の管理画面（管理者のみ）

## 技術構成

- Next.js 16 App Router / React 19 / TypeScript
- Prisma 6 / SQLite
- OpenAI Responses API（サーバー側のみ）
- Zod / React Hook Form / KaTeX
- `output: "standalone"` のDockerイメージ

## ローカルセットアップ

前提: Node.js 20以上、npm

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

Windows PowerShellでは `cp` の代わりに次を使えます。

```powershell
Copy-Item .env.example .env
```

ブラウザで `http://localhost:3000` を開きます。

## 環境変数

| 変数 | 必須 | 用途 |
| --- | --- | --- |
| `DATABASE_URL` | 必須 | ローカル標準は `file:./dev.db` |
| `AUTH_SECRET` | 必須 | JWT署名用。32文字以上のランダム値 |
| `OPENAI_API_KEY` | 任意 | 未設定・APIエラー時は電磁気専用テンプレートへフォールバック |
| `UPLOAD_DIR` | 任意 | 未設定時は `data/uploads` |
| `SERVICE_OPERATOR_NAME` | 本番必須 | 規約・プライバシーポリシーに表示する運営者名 |
| `LEGAL_CONTACT_EMAIL` | 本番必須 | 法務問い合わせ先メールアドレス |
| `UPLOAD_RETENTION_DAYS` | 任意 | 元ファイルの保存日数（1〜365、標準30日） |

`OPENAI_API_KEY` はサーバー環境だけに設定してください。`NEXT_PUBLIC_` を付けたり、クライアントコードへ渡したりしないでください。

メール認証設定とMailgunのDNS手順は `docs/email-verification-mailgun.md` を参照してください。ローカル・CIでは `EMAIL_DELIVERY_MODE=test`、本番ではMailgunを使用します。`EMAIL_VERIFICATION_SECRET`は`openssl rand -base64 48`で生成し、Secretsへ登録してください。認証メールは初回送信と再送を合算し、UTC日付（UTC 00:00区切り）ごとに `MAILGUN_DAILY_SEND_LIMIT=90` 通までです。上限値は1〜90で、上限到達後はMailgunへ送信しません。

## seedユーザー

開発用のため、本番ではパスワード変更またはユーザー削除が必要です。

| 権限 | メール | パスワード |
| --- | --- | --- |
| 管理者 | `admin@em-study.local` | `Admin123!` |
| 一般 | `student@em-study.local` | `Student123!` |

seedには管理者1名、一般ユーザー1名、電磁気1・2の診断問題各5問、基礎演習各10問が含まれます。seedはupsert方式で再実行できます。

## 開発コマンド

```bash
npm run dev          # 開発サーバー
npm run lint         # ESLint
npm run build        # 本番ビルド
npm run db:generate  # Prisma Client生成
npm run db:migrate   # 開発migration
npm run db:deploy    # 本番migration適用
npm run db:seed      # seed投入
npm run uploads:cleanup:dry-run # 期限切れ元ファイルの削除対象確認
npm run uploads:cleanup          # 期限切れ元ファイルを削除
npm run registrations:cleanup:dry-run # 期限切れ仮登録の削除対象確認
```

## 写真・PDF質問

- 対応形式: `.png`、`.jpg`、`.jpeg`、`.webp`、`.pdf`
- 上限: 10MB
- 保存先: `UPLOAD_DIR`
- ファイル取得APIはログイン中の所有者を検証します
- PDFはサーバーでテキスト抽出します
- OpenAIキーがある場合、画像を視覚入力として解析します

## 管理画面

管理者でログインし、次を開きます。

- `/admin/problems`: 問題の作成・編集・削除、選択肢と誤答原因の設定
- `/admin/materials`: PDF・画像・抽出テキスト、科目、年度、タグの登録

回答履歴が存在する問題は、履歴整合性を守るため削除できません。

## Docker

Next.js standalone出力を `server.js` で起動し、起動前にPrisma migrationを適用します。

```bash
docker build -t em-ai-learning:local .
docker volume create em-ai-learning-data
docker run --rm -p 3000:3000 \
  -e AUTH_SECRET="replace-with-a-random-secret-of-32-characters" \
  -e OPENAI_API_KEY="" \
  -e SEED_ON_START=true \
  -v em-ai-learning-data:/data \
  em-ai-learning:local
```

`SEED_ON_START=true` はローカル確認用です。本番では外し、初期データの投入方法を別途管理してください。DBは `/data/prod.db`、アップロードは `/data/uploads` に保存されます。

### ESPRIMO Ubuntu / GHCR

本番公開URL: `https://edesign.tairoh.com`

```bash
docker run -d \
  --name em-ai-learning \
  --restart unless-stopped \
  -p 127.0.0.1:3010:3000 \
  -e AUTH_SECRET="$AUTH_SECRET" \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  -v em-ai-learning-data:/data \
  ghcr.io/<OWNER>/em-ai-learning:main
```

ホスト側の `3010` は既存サービスとの競合を避け、Nginxが `127.0.0.1:3010` を参照するためです。

## GitHub Actions

- `docker-publish.yml`：`main` push で Docker image を GHCR に build & push
- `deploy-to-server.yml`：通常はESPRIMO self-hosted runner、オフライン時は `transport=ssh` でGitHub-hosted runnerからデプロイ

必要な Secrets（Repository secrets）:
- `GHCR_READ_TOKEN`（read:packages の PAT。サーバー側 `docker login ghcr.io` 用）
- `AUTH_SECRET`（32文字以上のランダム値）
- `OPENAI_API_KEY`（任意。未設定時はフォールバック動作）

## 本番運用上の注意

- `AUTH_SECRET` は32文字以上のランダム値へ変更する
- seedのテストユーザーを公開環境に残さない
- `/data` を永続ボリューム化し、DBとアップロードをバックアップする
- OpenAI利用量、アップロード容量、認証失敗を監視する
- SQLiteは単一インスタンス向け。水平分割時はPostgreSQLへ移行する
- HTTPS配下でのみ運用し、秘密情報をGitへコミットしない

## 共同開発

メンバー向け資料と既存の開発・デプロイ手順は維持しています。

- `docs/01-member-start-guide.md`
- `docs/development-flow.md`
- `docs/deployment.md`
