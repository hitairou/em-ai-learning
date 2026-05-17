# デプロイ手順（GitHub Actions / 2段階方式）

公開URL：`https://edesign.tairoh.com`

このリポジトリは **既存の ops/man 方式に合わせた「2段階」デプロイ** を採用します。

## 全体像
1. `docker-publish.yml`：`main` への push で Docker image を GHCR に build & push
2. `deploy-to-server.yml`：手動（workflow_dispatch）で、指定 tag の image をサーバーにデプロイ

## 前提（サーバー側）
- Ubuntu 24.04 系
- x86_64 / `linux/amd64`
- Nginx は `http://127.0.0.1:3010` を upstream としてリバースプロキシ
- アプリコンテナは `-p 127.0.0.1:3010:3000` で起動（ホスト:3010 → コンテナ:3000）
- サーバー側で GHCR login は行わない（Runner が pull して tar.gz を転送する）

## 必要な GitHub Secrets
`Settings` → `Secrets and variables` → `Actions` → `Repository secrets`

- `SSH_HOST`：デプロイ先ホスト名 or IP
- `SSH_USER`：SSHユーザー名
- `SSH_PORT`：SSHポート（例：`2222`）
- `SSH_KEY`：秘密鍵（PEM 形式推奨）

## 初回デプロイ手順（推奨）
1. `main` に push
2. Actions の `Build and publish Docker image` が成功し、GHCR に `:main` が作成されることを確認
3. Actions の `deploy-to-server` を `workflow_dispatch` で手動実行し、`tag=main` を指定して実行
4. `https://edesign.tairoh.com` をブラウザで確認

## 手動デプロイ（tag の指定）
`deploy-to-server.yml` の `tag` に以下を指定できます。
- `main`
- `${{ github.sha }}`（`docker-publish.yml` が付与するコミットSHAタグ）

## 注意（禁止事項）
- `docker system prune` を実行しない
- `ops-ecorun` / `man-ecorun` / `n8n` / `homeassistant` に触らない（停止/再起動しない）
- Nginx / certbot / UFW / netplan / SSH設定を変更しない
- `em-ai-learning` コンテナ以外を操作しない

