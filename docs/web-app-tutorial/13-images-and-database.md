[← 前：12．個別問題ページをDBから表示する](./12-dynamic-question-page.md)  
[目次へ戻る](./README.md)  
[次：14．Gitで履歴管理する →](./14-git-basics.md)

# 13．画像ファイルとDBの関係

## この章で学ぶこと
- 画像ファイルとDBの役割分担
- public配下の意味
- 画像パスを扱う注意点

## 作業手順
## 13-1．画像を置く場所

画像は通常 `public/images` に置く．

```txt
public/
  images/
    electric-field.png
```

表示するコードは次である．

```tsx
<img src="/images/electric-field.png" alt="電場の模式図" />
```

## 13-2．DBとの違い

SQLiteには画像本体を入れない．  
SQLiteには画像パスや説明文を保存する．

```txt
画像本体
  public/images/electric-field.png

DBに保存する値
  /images/electric-field.png
```

## 13-3．なぜ分けるのか

画像本体をDBに入れると，DBファイルが重くなる．  
Webアプリでは，画像はファイルとして保存し，DBには参照情報を入れる設計が基本である．

---

## コード
この章は概念説明が中心です（画像とDBの役割分担）．

## コード解説
本文中の『なぜそうするか』の説明（解説）を飛ばさずに読み，必要ならもう一度戻って確認してください．

## この章で理解すべきポイント
- この章の内容を自分の言葉で説明できる
- 手順を見ながら同じ作業を再現できる
- どのファイルが関係するかを1つ以上言える

## 前後ページ
---
[← 前：12．個別問題ページをDBから表示する](./12-dynamic-question-page.md)  
[目次へ戻る](./README.md)  
[次：14．Gitで履歴管理する →](./14-git-basics.md)
