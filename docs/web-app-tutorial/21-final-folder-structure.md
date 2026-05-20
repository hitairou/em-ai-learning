[← 前：20．DNS，ルーター，Nginxの違い](./20-dns-router-nginx.md)  
[目次へ戻る](./README.md)  
[次：22．このチュートリアルで到達する理解 →](./22-understanding-check.md)

# 21．最終フォルダ構成

## この章で学ぶこと
- 最終的なフォルダ構成の全体像
- どのファイルがどの責務か
- 実物リポジトリへの橋渡し

## 作業手順
```txt
em-support-tutorial/
  app/
    layout.tsx
    page.tsx
    questions/
      page.tsx
      [id]/
        page.tsx
  components/
    QuestionCard.tsx
  lib/
    db.ts
  data/
    app.db
  public/
    images/
  scripts/
    init-db.js
  Dockerfile
  .dockerignore
  package.json
  tsconfig.json
  next.config.ts
```

## 21-1．役割

```txt
app/
  ページとAPIを置く

components/
  React部品を置く

lib/
  DB接続や共通処理を置く

data/
  SQLiteのdbファイルを置く

public/
  画像やPDFなどの静的ファイルを置く

scripts/
  DB初期化などの補助スクリプトを置く

Dockerfile
  Dockerコンテナの作り方を書く

package.json
  npmパッケージと実行コマンドを管理する
```

---

## コード
この章のコードは，上の『作業手順』内のコードブロックを参照してください．

## コード解説
本文中の『なぜそうするか』の説明（解説）を飛ばさずに読み，必要ならもう一度戻って確認してください．

## この章で理解すべきポイント
- この章の内容を自分の言葉で説明できる
- 手順を見ながら同じ作業を再現できる
- どのファイルが関係するかを1つ以上言える

## 前後ページ
---
[← 前：20．DNS，ルーター，Nginxの違い](./20-dns-router-nginx.md)  
[目次へ戻る](./README.md)  
[次：22．このチュートリアルで到達する理解 →](./22-understanding-check.md)
