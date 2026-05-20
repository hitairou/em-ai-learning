[← 前：2．Next.jsプロジェクトを作る](./02-create-next-app.md)  
[目次へ戻る](./README.md)  
[次：4．トップページを作る →](./04-home-page.md)

# 3．初期フォルダ構成を確認する

## この章で学ぶこと
- Next.js（App Router）の基本的なフォルダ構造
- どのファイルがどの画面に対応するか
- 本リポジトリを読むための土台

## 作業手順
## 3-1．基本構成

```txt
em-support-tutorial/
  app/
    layout.tsx
    page.tsx
    globals.css
  public/
  package.json
  tsconfig.json
  next.config.ts
```

## 3-2．各ファイルの役割

```txt
app/page.tsx
  トップページ

app/layout.tsx
  全ページ共通の外枠

app/globals.css
  全体に効くCSS

public/
  画像やPDFなどの静的ファイルを置く場所

package.json
  npmパッケージと実行コマンドを管理するファイル

tsconfig.json
  TypeScriptの設定ファイル

next.config.ts
  Next.jsの設定ファイル
```

## 3-3．HTMLファイルはどこにあるのか

Next.jsでは，通常 `index.html` や `about.html` を直接書かない．  
代わりに，`page.tsx` を書く．

```txt
app/page.tsx
  ↓ Next.jsが処理
HTML + JavaScript + CSS
  ↓
ブラウザへ送信
```

開発者はTSXを書く．  
ブラウザは最終的にHTMLを受け取る．

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
[← 前：2．Next.jsプロジェクトを作る](./02-create-next-app.md)  
[目次へ戻る](./README.md)  
[次：4．トップページを作る →](./04-home-page.md)
