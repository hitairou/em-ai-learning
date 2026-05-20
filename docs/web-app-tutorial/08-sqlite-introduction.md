[← 前：7．トップページから問題一覧へリンクする](./07-link-navigation.md)  
[目次へ戻る](./README.md)  
[次：9．DB初期化スクリプトを作る →](./09-init-db-script.md)

# 8．SQLiteを導入する

## この章で学ぶこと
- SQLiteが何か，なぜ使うか（概要）
- Node.jsからDBを使う流れ
- この後の章でやることの見取り図

## 作業手順
## 8-1．目的

問題データをTypeScriptファイルに直接書くのではなく，SQLiteのDBファイルに保存する．

## 8-2．インストール

```bash
npm install better-sqlite3
npm install -D @types/better-sqlite3
```

## 8-3．解説

```txt
SQLite
  .dbファイルに表形式データを保存する仕組み

better-sqlite3
  Node.jsからSQLiteを操作するためのパッケージ

@types/better-sqlite3
  TypeScript用の型情報
```

## 8-4．SQLiteに入れるデータ

SQLiteには，主に構造化データを入れる．

```txt
問題タイトル
カテゴリ
問題文
解答
学習履歴
ユーザー名
作成日時
更新日時
```

画像本体は通常SQLiteに入れない．  
画像は `public/images` や外部ストレージに置き，SQLiteには画像パスを保存する．

---

## コード
この章は導入（考え方）中心です．

## コード解説
本文中の『なぜそうするか』の説明（解説）を飛ばさずに読み，必要ならもう一度戻って確認してください．

## この章で理解すべきポイント
- この章の内容を自分の言葉で説明できる
- 手順を見ながら同じ作業を再現できる
- どのファイルが関係するかを1つ以上言える

## 前後ページ
---
[← 前：7．トップページから問題一覧へリンクする](./07-link-navigation.md)  
[目次へ戻る](./README.md)  
[次：9．DB初期化スクリプトを作る →](./09-init-db-script.md)
