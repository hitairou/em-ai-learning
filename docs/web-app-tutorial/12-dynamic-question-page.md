[← 前：11．DBから問題一覧を表示する](./11-render-questions-from-db.md)  
[目次へ戻る](./README.md)  
[次：13．画像ファイルとDBの関係 →](./13-images-and-database.md)

# 12．個別問題ページをDBから表示する

## この章で学ぶこと
- 動的ルーティングで個別問題ページを作る
- URLパラメータとDB検索の関係
- 一覧→詳細の基本形

## 作業手順
## 12-1．目的

`/questions/1` のようなURLで，IDに対応した問題を表示する．

## 12-2．コード

`app/questions/[id]/page.tsx`

```tsx
import { getQuestionById, getQuestions } from "@/lib/db";

export function generateStaticParams() {
  return getQuestions().map((q) => ({ id: String(q.id) }));
}

export default async function QuestionDetailPage(props: PageProps<"/questions/[id]">) {
  const { id } = await props.params;
  const question = getQuestionById(Number(id));

  if (!question) {
    return <main className="p-8">問題が見つからない．</main>;
  }

  return (
    <main className="p-8">
      <p className="text-sm text-gray-500">{question.category}</p>
      <h1 className="text-3xl font-bold">{question.title}</h1>
      <p className="mt-6">{question.body}</p>

      <section className="mt-8 rounded border p-4">
        <h2 className="font-bold">解答例</h2>
        <p className="mt-2">{question.answer}</p>
      </section>
    </main>
  );
}
```

## 12-3．コード解説

### `[id]`

`app/questions/[id]/page.tsx` の `[id]` は動的ルートである．

```txt
/questions/1
/questions/2
/questions/3
```

を同じファイルで処理できる．

### `generateStaticParams()`

```tsx
export function generateStaticParams() {
  return getQuestions().map((q) => ({ id: String(q.id) }));
}
```

静的に生成するページのID一覧を返している．  
`getQuestions()` で全問題を取得し，各問題のIDを文字列にして返す．

例えばDBに3件あるなら，次のような配列になる．

```ts
[
  { id: "1" },
  { id: "2" },
  { id: "3" }
]
```

### `PageProps<"/questions/[id]">`

```tsx
props: PageProps<"/questions/[id]">
```

Next.js v16系の型指定である．  
`/questions/[id]` のページで使える `params` の型をNext.js側に任せる．

### `await props.params`

```tsx
const { id } = await props.params;
```

Next.js v15以降では，`params` がPromiseとして扱われる．  
そのため，`await` してから `id` を取り出す．

従来のように，

```tsx
const id = props.params.id;
```

と書くと，`id` が正しく取れず，`Number(id)` が `NaN` になる．  
その結果，DB検索に失敗し，「問題が見つからない．」が表示される．

### `Number(id)`

```tsx
const question = getQuestionById(Number(id));
```

URLから取れる `id` は文字列である．  
SQLiteのIDは数値として扱うため，`Number(id)` で変換する．

```txt
"1"
  ↓
1
```

### `if (!question)`

```tsx
if (!question) {
  return <main className="p-8">問題が見つからない．</main>;
}
```

DBに該当IDの問題がない場合の表示である．

### 表示部分

```tsx
<p className="text-sm text-gray-500">{question.category}</p>
<h1 className="text-3xl font-bold">{question.title}</h1>
<p className="mt-6">{question.body}</p>
```

DBから取得した問題データを画面に表示している．

### `<section>`

```tsx
<section className="mt-8 rounded border p-4">
```

解答例のまとまりを作っている．  
`section` は意味のある区切りを表すHTMLタグである．

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
[← 前：11．DBから問題一覧を表示する](./11-render-questions-from-db.md)  
[目次へ戻る](./README.md)  
[次：13．画像ファイルとDBの関係 →](./13-images-and-database.md)
