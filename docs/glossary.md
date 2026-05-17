# 用語集（初心者向け）

各用語は，このプロジェクトでの具体例つきで説明します．

## GitHub
チームでコードやIssueを共有するWebサービスです．このプロジェクトでは `hitairou/em-ai-learning` が作業場所です．

## Repository（リポジトリ）
プロジェクトのファイル置き場です．例：`hitairou/em-ai-learning`．

## Issue（イシュー）
やる作業を1枚のチケットとして管理する仕組みです．例：`#4 問題出題画面の改善`．

## Project（プロジェクト）
Issueをカードとして並べる作業ボードです．列（Status）で進捗を管理します．

## Branch（ブランチ）
作業用の分岐です．`main` を直接変更しないために使います．例：`feature/5-diagnosis-engine`．

## Pull Request（PR）
ブランチの変更を `main` に入れてよいか相談する仕組みです．変更内容をレビューします．

## Review（レビュー）
PRの変更を確認してコメントすることです．良ければ承認し，問題があれば修正を依頼します．

## Merge（マージ）
PRの変更を `main` に取り込むことです．ここで初めて本番候補に入ります．

## Commit（コミット）
変更をひとまとめにして履歴として保存することです．

## Clone（クローン）
GitHub上のリポジトリを自分のPCにコピーして作業できるようにすることです．

## Push（プッシュ）
自分のPCの変更をGitHubへ送ることです．

## Pull（プル）
GitHub上の最新変更を自分のPCへ取り込むことです．

## GitHub Actions
ビルドやデプロイなどを自動で実行する仕組みです．`Actions` タブで見ます．

## Workflow（ワークフロー）
Actionsの「手順書」です．例：`docker-publish.yml`．

## docker-publish
`main` への変更でDocker imageを作り，GHCRへ保存するworkflowです．

## deploy-to-server
担当者が手動で実行し，サーバー（ESPRIMO）のコンテナを更新するworkflowです．

## Docker
アプリを「コンテナ」として動かす仕組みです．環境差を減らせます．

## Image（イメージ）
コンテナの元になる実行パッケージです．

## Container（コンテナ）
imageから起動した実行中のアプリです．このプロジェクトでは `em-ai-learning` が該当します．

## GHCR
GitHubのDocker image置き場（GitHub Container Registry）です．例：`ghcr.io/hitairou/em-ai-learning:main`．

## nginx
Webアクセスを受けて，裏側のアプリに転送するソフトです（リバースプロキシ）．

## certbot
HTTPS証明書（Let’s Encrypt）を取得・更新するツールです．

## HTTPS
暗号化されたWeb通信です．URLが `https://` で始まります．

## localStorage
ブラウザにデータを保存する仕組みです．このMVPでは理解度スコアを保存します．

## Next.js
ReactベースのWebアプリフレームワークです．

## TypeScript
型（type）を使ってミスを減らすJavaScriptの拡張です．

## Copilot
AI支援機能の総称です．GitHub上のagentやVS CodeのChatを含みます．

## GitHub Copilot Student
学生向けにCopilotが使えるプランです．申請が必要な場合があります．

## Copilot Chat
VS Code内でAIに相談しながら修正する機能です．

## Copilot coding agent
GitHub上でIssueを元に作業を進め，PRを作ってくれる機能です（利用できない場合もあります）．

## Agentsタブ
GitHub上でagent機能を使う画面です．見えない場合はVS Code手順を使います．

## LLM
大規模言語モデルです．将来的に解説生成などで利用します．

## API
アプリ同士が通信するための窓口です．

## Secrets
パスワードや鍵などの機密情報を安全に保存する仕組みです．IssueやPRに貼らないでください．

## 環境変数
実行時に渡す設定値です（例：`NODE_ENV`）．

## NATループバック
LAN内から自分のグローバルドメインにアクセスできない現象です．この環境では `https://edesign.tairoh.com` がLAN内PCから開けない場合があります．スマホ回線で確認します．

