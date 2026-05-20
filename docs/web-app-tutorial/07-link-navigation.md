[← 前：6．問題一覧ページを作る](./06-question-list-page.md)  
[目次へ戻る](./README.md)  
[次：8．SQLiteを導入する →](./08-sqlite-introduction.md)

# 7．トップページから問題一覧へリンクする

## この章で学ぶこと
- ページ間リンク（遷移）の作り方
- Next.jsのLinkの考え方
- ナビゲーションの基本

## 作業手順
## 7-1．目的

トップページから `/questions` へ移動できるようにする．

## 7-2．コード

`app/page.tsx`

```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">電磁気学AI支援システム</h1>
      <p className="mt-4">
        このページでは，電場，磁場，電磁誘導に関する問題を確認できる．
      </p>

      <Link
        href="/questions"
        className="mt-6 inline-block rounded bg-black px-4 py-2 text-white"
      >
        問題一覧へ
      </Link>
    </main>
  );
}
```

## 7-3．コード解説

### `import Link from "next/link"`

Next.jsのページ遷移用部品を読み込んでいる．

### `<Link href="/questions">`

```tsx
<Link href="/questions">
```

クリックすると `/questions` に移動する．  
通常のHTMLでは `<a>` を使うが，Next.jsでは `Link` を使う．

### `inline-block rounded bg-black px-4 py-2 text-white`

Tailwind CSSのクラスである．

```txt
inline-block
  横幅を内容に合わせつつ余白を効かせる

rounded
  角丸

bg-black
  背景を黒

px-4
  左右余白

py-2
  上下余白

text-white
  文字色を白
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
[← 前：6．問題一覧ページを作る](./06-question-list-page.md)  
[目次へ戻る](./README.md)  
[次：8．SQLiteを導入する →](./08-sqlite-introduction.md)
