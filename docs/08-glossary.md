# 08 用語集（初心者向け）

前へ：[07 トラブル対応集（初心者向け）](./07-troubleshooting-for-members.md) / 次へ：[09 Copilot用プロンプト集](./09-copilot-prompts.md)

このページは，初心者向けの用語集です．

（本文は旧ファイル `docs/glossary.md` の内容を移しました）

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

## docker-publish
`main` への変更でDocker imageを作り，GHCRへ保存するworkflowです．

## deploy-to-server
担当者が手動で実行し，サーバー（ESPRIMO）のコンテナを更新するworkflowです．

## Docker / Image / Container / GHCR
アプリをコンテナとして動かす仕組みです．imageは「実行パッケージ」，containerは「起動中の実体」です．GHCRはimageの置き場です．

## Copilot
AI支援機能の総称です．このプロジェクトの標準は **VS CodeのCopilot Chat** です．
GitHub上のCopilot cloud agentは，有料プランで使える場合がある補助機能です．

## Copilot cloud agent / Agentsタブ
GitHub上でagent機能を使う画面です．Copilot Free / Studentでは `Available on paid plans` と表示されて実行できない場合があります．

## NATループバック
LAN内から自分のグローバルドメインにアクセスできない現象です．この環境では `https://edesign.tairoh.com` がLAN内PCから開けない場合があります．スマホ回線で確認します．

---
前へ：[07 トラブル対応集（初心者向け）](./07-troubleshooting-for-members.md) / 次へ：[09 Copilot用プロンプト集](./09-copilot-prompts.md)

