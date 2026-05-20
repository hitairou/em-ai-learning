[← 前：9．DB初期化スクリプトを作る](./09-init-db-script.md)  
[目次へ戻る](./README.md)  
[次：11．DBから問題一覧を表示する →](./11-render-questions-from-db.md)

# 10．DBアクセス関数を作る

## この章で学ぶこと
- DBアクセス関数（読み書き）の分離
- アプリ側からDBを呼ぶ形
- 保守しやすい構造

## 作業手順
## 10-1．目的

ページ側から直接SQLを書かずに済むよう，DB処理を `lib/db.ts` にまとめる．

## 10-2．コード

`lib/db.ts`

```ts
import Database from "better-sqlite3";

const db = new Database("data/app.db");

export type Question = {
  id: number;
  title: string;
  category: string;
  body: string;
  answer: string;
};

export function getQuestions(): Question[] {
  return db.prepare("SELECT * FROM questions ORDER BY id").all() as Question[];
}

export function getQuestionById(id: number): Question | undefined {
  return db
    .prepare("SELECT * FROM questions WHERE id = ?")
    .get(id) as Question | undefined;
}
```

## 10-3．コード解説

### `import Database from "better-sqlite3"`

TypeScriptで外部パッケージを読み込む書き方である．

### `const db = new Database("data/app.db")`

9章で作ったDBファイルを開いている．

### `export type Question`

```ts
export type Question = {
  id: number;
  title: string;
  category: string;
  body: string;
  answer: string;
};
```

SQLiteの1行に対応するTypeScript型である．  
これにより，`question.title` のように安全に扱える．

### `getQuestions(): Question[]`

```ts
export function getQuestions(): Question[] {
```

問題一覧を返す関数である．  
`Question[]` は，Question型の配列を意味する．

### `SELECT * FROM questions ORDER BY id`

```sql
SELECT * FROM questions ORDER BY id
```

`questions` テーブルから全列を取得し，id順に並べる．

### `.all()`

```ts
.all()
```

複数件の結果をすべて取得する．  
一覧ページでは複数の問題を表示するため，`.all()` を使う．

### `as Question[]`

```ts
as Question[]
```

SQL結果をQuestion型配列として扱う指定である．  
TypeScriptに対して，戻り値の形を伝えている．

### `getQuestionById(id: number)`

```ts
export function getQuestionById(id: number): Question | undefined {
```

IDを指定して1件だけ問題を取得する関数である．

### `WHERE id = ?`

```sql
SELECT * FROM questions WHERE id = ?
```

指定したIDに一致する行だけ取得する．

### `.get(id)`

```ts
.get(id)
```

1件だけ取得する．  
`?` に `id` の値を入れてSQLを実行している．

### `Question | undefined`

```ts
Question | undefined
```

問題が見つかればQuestion型，見つからなければ `undefined` を返す．

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
[← 前：9．DB初期化スクリプトを作る](./09-init-db-script.md)  
[目次へ戻る](./README.md)  
[次：11．DBから問題一覧を表示する →](./11-render-questions-from-db.md)
