[← 前：1．Node.jsとnpmを確認する](./01-nodejs-and-npm.md)  
[目次へ戻る](./README.md)  
[次：3．初期フォルダ構成を確認する →](./03-folder-structure.md)

# 2．Next.jsプロジェクトを作る

## この章で学ぶこと
- Next.jsプロジェクトの作成（create-next-app）
- 開発サーバー起動（npm run dev）
- 初回起動で確認するポイント

## 作業手順
## 2-1．プロジェクト作成

```bash
npx create-next-app@latest em-support-tutorial
```

質問には次のように答える．

```txt
TypeScript: Yes
ESLint: Yes
Tailwind CSS: Yes
src directory: No
App Router: Yes
Turbopack: Yes
import alias: Yes
```

移動する．

```bash
cd em-support-tutorial
```

開発サーバーを起動する．

```bash
npm run dev
```

ブラウザで開く．

```txt
http://localhost:3000
```

## 2-2．解説

`create-next-app` は，Next.jsプロジェクトの雛形を作る公式ツールである．

このコマンドにより，次が自動で準備される．

```txt
Next.js
React
TypeScript
Tailwind CSS
ESLint
package.json
appフォルダ
設定ファイル
```

## 2-3．なぜNext.jsを使うのか

ReactだけでWebアプリを作る場合，ページのURL管理，ビルド設定，サーバー処理，API処理を自分で組む必要がある．  
Next.jsは，それらをあらかじめ用意している．

```txt
React
  画面部品を作る

Next.js
  ページ構造，URL，サーバー処理，ビルド，本番起動をまとめて扱う
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
[← 前：1．Node.jsとnpmを確認する](./01-nodejs-and-npm.md)  
[目次へ戻る](./README.md)  
[次：3．初期フォルダ構成を確認する →](./03-folder-structure.md)
