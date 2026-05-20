[← 前：5．React部品を作る](./05-react-component.md)  
[目次へ戻る](./README.md)  
[次：7．トップページから問題一覧へリンクする →](./07-link-navigation.md)

# 6．問題一覧ページを作る

## この章で学ぶこと
- 問題一覧ページの作り方
- 配列データを画面に描画する方法
- 最低限のUI構造の作り方

## 作業手順
## 6-1．目的

`/questions` にアクセスしたとき，問題一覧を表示するページを作る．

## 6-2．コード

`app/questions/page.tsx`

```tsx
import { QuestionCard } from "@/components/QuestionCard";

const questions = [
  { id: 1, title: "電場の定義", category: "静電場" },
  { id: 2, title: "ガウスの法則", category: "静電場" },
  { id: 3, title: "ファラデーの電磁誘導", category: "電磁誘導" },
];

export default function QuestionsPage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">問題一覧</h1>

      <div className="mt-6 grid gap-4">
        {questions.map((question) => (
          <QuestionCard
            key={question.id}
            id={question.id}
            title={question.title}
            category={question.category}
          />
        ))}
      </div>
    </main>
  );
}
```

## 6-3．URLとの対応

Next.jsでは，`app` フォルダの構造がURLに対応する．

```txt
app/page.tsx
  → /

app/questions/page.tsx
  → /questions
```

## 6-4．コード解説

### `import { QuestionCard }`

```tsx
import { QuestionCard } from "@/components/QuestionCard";
```

5章で作った `QuestionCard` 部品を読み込んでいる．  
`@/` はプロジェクトのルートを表すエイリアスである．

### `const questions`

```tsx
const questions = [
  { id: 1, title: "電場の定義", category: "静電場" },
  { id: 2, title: "ガウスの法則", category: "静電場" },
  { id: 3, title: "ファラデーの電磁誘導", category: "電磁誘導" },
];
```

問題データを配列として直接書いている．  
この段階ではSQLiteを使っていない．

### `questions.map(...)`

```tsx
{questions.map((question) => (
```

`map` は配列の全要素を1つずつ処理するメソッドである．

```txt
questions配列に3件ある
  ↓
mapが3回処理する
  ↓
QuestionCardが3個作られる
```

つまり，「全データを出す」指定は `questions.map(...)` で行っている．

### `question`

```tsx
questions.map((question) => (
```

`question` は，配列から1件ずつ取り出されたデータである．

1回目は，

```tsx
{ id: 1, title: "電場の定義", category: "静電場" }
```

2回目は，

```tsx
{ id: 2, title: "ガウスの法則", category: "静電場" }
```

になる．

### `<QuestionCard ... />`

```tsx
<QuestionCard
  key={question.id}
  id={question.id}
  title={question.title}
  category={question.category}
/>
```

取り出した1件のデータを，`QuestionCard` に渡している．

実質的には，1件目では次のようになる．

```tsx
<QuestionCard
  key={1}
  id={1}
  title="電場の定義"
  category="静電場"
/>
```

### `key`

```tsx
key={question.id}
```

`key` はReactが一覧表示を管理するための識別子である．  
画面には表示されない．

### `grid gap-4`

```tsx
<div className="mt-6 grid gap-4">
```

カード一覧の見た目を整えている．

```txt
mt-6
  上余白

grid
  グリッド配置

gap-4
  要素間の余白
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
[← 前：5．React部品を作る](./05-react-component.md)  
[目次へ戻る](./README.md)  
[次：7．トップページから問題一覧へリンクする →](./07-link-navigation.md)
