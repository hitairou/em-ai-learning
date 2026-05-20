前へ：なし  
[目次へ戻る](./README.md)  
[次：1．Node.jsとnpmを確認する →](./01-nodejs-and-npm.md)

# 0．このチュートリアルで理解する全体像

## この章で学ぶこと
- このチュートリアル全体のゴール
- 使う技術（Node.js／npm／Next.js等）の役割
- 開発時（dev）と本番（build/start）の違い

## 作業手順
## 0-1．使う技術の役割

```txt
Node.js
  JavaScriptをPCやサーバー上で動かす実行環境

npm
  JavaScript系パッケージを導入・管理するツール

Next.js
  Reactを使ってWebアプリ全体を作るフレームワーク

TypeScript
  JavaScriptに型を追加した開発用言語

React
  画面を部品として作るライブラリ

TSX
  TypeScriptの中にHTMLのような画面構造を書ける形式

Tailwind CSS
  classNameに短い命令を書いて見た目を整えるCSSフレームワーク

SQLite
  1つのdbファイルに表形式データを保存する軽量データベース

better-sqlite3
  Node.jsからSQLiteを扱うためのパッケージ

Git
  ローカルPC内で変更履歴を管理するツール

GitHub
  Gitの履歴をクラウド上で共有するサービス

Docker
  Webアプリの実行環境をコンテナとしてまとめる仕組み

Nginx
  外部から来たアクセスを内部のWebアプリへ転送するWebサーバー
```

## 0-2．開発時と本番公開時の違い

開発時は，自分のPCで確認する．

```txt
自分のPC
  ↓
npm run dev
  ↓
Next.js開発サーバー
  ↓
http://localhost:3000
  ↓
ブラウザで確認
```

本番公開時は，外部からアクセスできるようにする．

```txt
ユーザー
  ↓
DNS
  ↓
グローバルIP
  ↓
ルーター
  ↓
サーバーPC
  ↓
Nginx
  ↓
Dockerコンテナ内のNext.js
  ↓
SQLiteや画像ファイル
  ↓
Webページ表示
```

---

## コード
この章は概念説明が中心です（コードは少なめです）．

## コード解説
本文中の『なぜそうするか』の説明（解説）を飛ばさずに読み，必要ならもう一度戻って確認してください．

## この章で理解すべきポイント
- この章の内容を自分の言葉で説明できる
- 手順を見ながら同じ作業を再現できる
- どのファイルが関係するかを1つ以上言える

## 前後ページ
---
前へ：なし  
[目次へ戻る](./README.md)  
[次：1．Node.jsとnpmを確認する →](./01-nodejs-and-npm.md)
