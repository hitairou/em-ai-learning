[← 前：10．DBアクセス関数を作る](./10-db-access-functions.md)  
[目次へ戻る](./README.md)  
[次：12．個別問題ページをDBから表示する →](./12-dynamic-question-page.md)

# 11．DBから問題一覧を表示する

## この章で学ぶこと
- DBから問題一覧を取得して表示する
- 取得→整形→表示の流れ
- エラー時の切り分け

## 作業手順
## 11-1．目的

6章では問題データをコードに直接書いた．  
ここではSQLiteから問題一覧を取得する．

## 11-2．コード

`app/questions/page.tsx`

```tsx
import Link from "next/link";
import { getQuestions } from "@/lib/db";

export default function QuestionsPage() {
  const questions = getQuestions();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">問題一覧</h1>

      <div className="mt-6 grid gap-4">
        {questions.map((question) => (
          <Link
            key={question.id}
            href={`/questions/${question.id}`}
            className="rounded border p-4 hover:bg-gray-50"
          >
            <p className="text-sm text-gray-500">問題ID: {question.id}</p>
            <h2 className="text-xl font-bold">{question.title}</h2>
            <p className="mt-2">{question.category}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
```

## 11-3．コード解説

### `import Link from "next/link"`

個別問題ページへ遷移するために使う．

### `import { getQuestions } from "@/lib/db"`

10章で作ったDB取得関数を読み込む．

### `const questions = getQuestions()`

SQLiteから問題一覧を取得する．

流れは次である．

```txt
app/questions/page.tsx
  ↓
getQuestions()
  ↓
lib/db.ts
  ↓
SELECT * FROM questions ORDER BY id
  ↓
data/app.db
```

### `href={`/questions/${question.id}`}`

```tsx
href={`/questions/${question.id}`}
```

テンプレートリテラルでURLを作っている．

例えば `question.id` が1なら，

```txt
/questions/1
```

になる．

### `hover:bg-gray-50`

マウスを乗せたとき背景色を薄く変えるTailwind CSS指定である．

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
[← 前：10．DBアクセス関数を作る](./10-db-access-functions.md)  
[目次へ戻る](./README.md)  
[次：12．個別問題ページをDBから表示する →](./12-dynamic-question-page.md)
