[← 前：4．トップページを作る](./04-home-page.md)  
[目次へ戻る](./README.md)  
[次：6．問題一覧ページを作る →](./06-question-list-page.md)

# 5．React部品を作る

## この章で学ぶこと
- Reactコンポーネントの考え方（部品化）
- propsの基本
- UIを分割する理由

## 作業手順
## 5-1．目的

ページの中で何度も使う表示を部品化する．  
ここでは，問題カードを `QuestionCard` として作る．

## 5-2．コード

`components/QuestionCard.tsx`

```tsx
type QuestionCardProps = {
  id: number;
  title: string;
  category: string;
};

export function QuestionCard({ id, title, category }: QuestionCardProps) {
  return (
    <div className="rounded border p-4">
      <p className="text-sm text-gray-500">問題ID: {id}</p>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-2">{category}</p>
    </div>
  );
}
```

## 5-3．このコードの役割

このコードは，次のようなカードを作る部品である．

```txt
問題ID: 1
電場の定義
静電場
```

## 5-4．コード解説

### `type QuestionCardProps`

```tsx
type QuestionCardProps = {
  id: number;
  title: string;
  category: string;
};
```

これはTypeScriptの型定義である．  
`QuestionCard` に渡すデータの形を決めている．

```txt
id
  数値

title
  文字列

category
  文字列
```

この型により，`id` に文字列を渡したとき，TypeScriptがエラーとして検出する．

### `export function QuestionCard`

```tsx
export function QuestionCard({ id, title, category }: QuestionCardProps) {
```

`QuestionCard` というReact部品を作っている．  
`export` があるため，他のファイルから読み込める．

### `{ id, title, category }`

これはpropsの分割代入である．  
本来は次のように書ける．

```tsx
export function QuestionCard(props: QuestionCardProps) {
  return <p>{props.title}</p>;
}
```

分割代入を使うと，次のように短く書ける．

```tsx
export function QuestionCard({ id, title, category }: QuestionCardProps) {
```

### `<div className="rounded border p-4">`

カード全体の枠を作っている．

```txt
rounded
  角丸

border
  枠線

p-4
  内側余白
```

### `{id}`，`{title}`，`{category}`

```tsx
問題ID: {id}
{title}
{category}
```

波括弧 `{}` の中には，TypeScriptの値を埋め込める．  
これにより，渡されたデータを画面に表示する．

## 5-5．なぜ部品化するのか

毎回同じカード構造を書くと，修正が大変になる．  
部品化すると，1か所を直すだけで全カードの見た目を変えられる．

```txt
QuestionCard.tsxを修正
  ↓
QuestionCardを使っている全ページに反映
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
[← 前：4．トップページを作る](./04-home-page.md)  
[目次へ戻る](./README.md)  
[次：6．問題一覧ページを作る →](./06-question-list-page.md)
