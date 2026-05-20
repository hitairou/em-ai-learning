# Webアプリ実践チュートリアル（初学者向け）

このフォルダは，電磁気学AI支援システム（本リポジトリ）のWebアプリ構成を理解するための実践チュートリアルです．
正式資料本体はこの docs/web-app-tutorial/ 配下にあります．

## このチュートリアルの目的
- Next.js（App Router）で『ページがどう作られるか』を順番に理解する
- コードを読みながら『なぜその技術を使うか』『ファイル同士がどうつながるか』を理解する

## 対象読者
- GitHubに招待されたばかりの初学者
- VS Codeでコードを開いて読めるようになりたい人

## 学べる内容
- Node.jsとnpmの基本（インストール，コマンドの意味）
- Next.jsの基本（ページ，リンク，動的ルーティング）
- SQLiteを使う最小の考え方（導入〜表示）
- Git/GitHubの基本（commit，branch，PR）
- Docker/Nginx/DNSの位置づけ（概要）

## 完成するミニWebアプリの概要
- 電磁気学の『問題一覧』を表示する
- クリックすると『問題詳細』ページを表示する
- SQLiteに問題データを保存し，DBから表示する

## 読む順番
上から順に読み，章末の『前後ページ』リンクで移動してください．

## 各章へのリンク一覧
- [0．このチュートリアルで理解する全体像](./00-overview.md)
- [1．Node.jsとnpmを確認する](./01-nodejs-and-npm.md)
- [2．Next.jsプロジェクトを作る](./02-create-next-app.md)
- [3．初期フォルダ構成を確認する](./03-folder-structure.md)
- [4．トップページを作る](./04-home-page.md)
- [5．React部品を作る](./05-react-component.md)
- [6．問題一覧ページを作る](./06-question-list-page.md)
- [7．トップページから問題一覧へリンクする](./07-link-navigation.md)
- [8．SQLiteを導入する](./08-sqlite-introduction.md)
- [9．DB初期化スクリプトを作る](./09-init-db-script.md)
- [10．DBアクセス関数を作る](./10-db-access-functions.md)
- [11．DBから問題一覧を表示する](./11-render-questions-from-db.md)
- [12．個別問題ページをDBから表示する](./12-dynamic-question-page.md)
- [13．画像ファイルとDBの関係](./13-images-and-database.md)
- [14．Gitで履歴管理する](./14-git-basics.md)
- [15．ブランチとPull Requestを理解する](./15-branch-and-pull-request.md)
- [16．GitHubへpushする](./16-github-push.md)
- [17．ビルドと本番起動](./17-build-and-production-start.md)
- [18．Dockerで本番実行環境を作る](./18-docker.md)
- [19．Nginxで外部公開の入口を作る](./19-nginx.md)
- [20．DNS，ルーター，Nginxの違い](./20-dns-router-nginx.md)
- [21．最終フォルダ構成](./21-final-folder-structure.md)
- [22．このチュートリアルで到達する理解](./22-understanding-check.md)
- [23．実物の電磁気学AI支援システムを見るときの読み方](./23-how-to-read-real-repository.md)
- [24．補足：OpenAI APIについて](./24-openai-api-note.md)
- [25．まとめ](./25-summary.md)

## 学習前に必要なもの
- Windows PC
- Node.js（LTS）とnpm
- Git
- VS Code

## このチュートリアルではOpenAI APIを扱わない理由
初学者がまず『Webアプリの構造（画面・データ・ルーティング・公開）』を理解することを優先し，APIキー管理など運用が必要な要素は後回しにしています．
