[← 前：16．GitHubへpushする](./16-github-push.md)  
[目次へ戻る](./README.md)  
[次：18．Dockerで本番実行環境を作る →](./18-docker.md)

# 17．ビルドと本番起動

## この章で学ぶこと
- npm run build の意味（本番変換）
- npm run start の意味（本番相当起動）
- devとの違い

## 作業手順
## 17-1．本番ビルド

```bash
npm run build
```

## 17-2．本番起動

```bash
npm run start
```

## 17-3．解説

```txt
npm run dev
  開発用サーバー

npm run build
  本番用に変換・最適化

npm run start
  本番モードで起動
```

開発中は `npm run dev` を使う．  
公開前には `npm run build` で本番用にビルドする．

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
[← 前：16．GitHubへpushする](./16-github-push.md)  
[目次へ戻る](./README.md)  
[次：18．Dockerで本番実行環境を作る →](./18-docker.md)
