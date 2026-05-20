[← 前：3．初期フォルダ構成を確認する](./03-folder-structure.md)  
[目次へ戻る](./README.md)  
[次：5．React部品を作る →](./05-react-component.md)

# 4．トップページを作る

## この章で学ぶこと
- トップページを作る流れ
- TSXで画面を書く感覚
- 変更が反映されるまでの確認手順

## 作業手順
## 4-1．コード

`app/page.tsx` を次のように書き換える．

```tsx
export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">電磁気学AI支援システム</h1>
      <p className="mt-4">
        このページでは，電場，磁場，電磁誘導に関する問題を確認できる．
      </p>
    </main>
  );
}
```

## 4-2．このコードの役割

このコードは，トップページに次を表示する．

```txt
電磁気学AI支援システム

このページでは，電場，磁場，電磁誘導に関する問題を確認できる．
```

## 4-3．コード解説

### `export default function HomePage()`

```tsx
export default function HomePage() {
```

`HomePage` という関数を作っている．  
`export default` は，「このファイルの代表として外に出す」という意味である．

Next.jsでは，`app/page.tsx` の `default export` が `/` のページとして表示される．

```txt
app/page.tsx
  ↓
export default function HomePage()
  ↓
http://localhost:3000/
```

### `return (...)`

```tsx
return (
  ...
);
```

Reactでは，関数が画面構造を返す．  
このHTMLのような書き方をJSXという．  
TypeScriptの中でJSXを書くため，拡張子は `.tsx` になる．

### `<main>`

```tsx
<main className="p-8">
```

`main` はHTMLタグである．  
ページの主要な内容を表す．

### `className`

Reactでは，HTMLの `class` の代わりに `className` を使う．

```html
<main class="p-8">
```

ではなく，

```tsx
<main className="p-8">
```

と書く．

### `p-8`

`p-8` はTailwind CSSのクラスである．  
`padding`，つまり内側余白を付ける．

### `<h1>`

```tsx
<h1 className="text-3xl font-bold">電磁気学AI支援システム</h1>
```

`h1` はページの一番大きな見出しである．

### `text-3xl font-bold`

Tailwind CSSの指定である．

```txt
text-3xl
  文字を大きくする

font-bold
  太字にする
```

### `<p>`

```tsx
<p className="mt-4">
```

`p` は段落を表すHTMLタグである．

### `mt-4`

`margin-top`，つまり上余白を付ける指定である．  
見出しと本文がくっつかないようにしている．

## 4-4．HTML，CSS，TypeScriptの関係

```txt
HTML
  ページの構造を表す

CSS
  見た目を整える

TypeScript
  処理やデータ構造を安全に書く

TSX
  TypeScriptの中にHTMLのような画面構造を書ける形式
```

このコードでは，HTMLのような構造をTSXで書き，Tailwind CSSで見た目を整えている．

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
[← 前：3．初期フォルダ構成を確認する](./03-folder-structure.md)  
[目次へ戻る](./README.md)  
[次：5．React部品を作る →](./05-react-component.md)
