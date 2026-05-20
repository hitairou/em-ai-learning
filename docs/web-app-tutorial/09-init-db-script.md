[← 前：8．SQLiteを導入する](./08-sqlite-introduction.md)  
[目次へ戻る](./README.md)  
[次：10．DBアクセス関数を作る →](./10-db-access-functions.md)

# 9．DB初期化スクリプトを作る

## この章で学ぶこと
- DB初期化（テーブル作成・初期データ投入）の考え方
- スクリプトとして実行する理由
- 失敗しやすいポイント

## 作業手順
## 9-1．目的

`data/app.db` を作り，`questions` テーブルを作り，初期問題を入れる．

## 9-2．コード

`scripts/init-db.js`

```js
const Database = require("better-sqlite3");

const db = new Database("data/app.db");

db.exec(`
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  body TEXT NOT NULL,
  answer TEXT NOT NULL
);
`);

const count = db.prepare("SELECT COUNT(*) as count FROM questions").get().count;

if (count === 0) {
  const insert = db.prepare(`
    INSERT INTO questions (title, category, body, answer)
    VALUES (?, ?, ?, ?)
  `);

  insert.run(
    "電場の定義",
    "静電場",
    "電場Eとは何か説明せよ．",
    "電場とは，単位正電荷にはたらく力である．"
  );

  insert.run(
    "ガウスの法則",
    "静電場",
    "ガウスの法則の意味を説明せよ．",
    "閉曲面を貫く電束は，内部の電荷量に比例する．"
  );

  insert.run(
    "ファラデーの電磁誘導",
    "電磁誘導",
    "ファラデーの電磁誘導の法則を説明せよ．",
    "誘導起電力は，磁束の時間変化に比例して生じる．"
  );
}

console.log("Database initialized.");
```

実行する．

```bash
mkdir data
mkdir scripts
node scripts/init-db.js
```

## 9-3．コード解説

### `require("better-sqlite3")`

```js
const Database = require("better-sqlite3");
```

Node.jsで外部パッケージを読み込む書き方である．  
`better-sqlite3` を使ってSQLiteを操作する．

### `new Database("data/app.db")`

```js
const db = new Database("data/app.db");
```

SQLiteファイルを開く．  
存在しない場合は作成される．

### `db.exec(...)`

```js
db.exec(`
CREATE TABLE IF NOT EXISTS questions (
...
);
`);
```

複数行のSQLを実行する．  
ここではテーブル作成を行っている．

### `CREATE TABLE IF NOT EXISTS`

```sql
CREATE TABLE IF NOT EXISTS questions
```

`questions` テーブルが存在しない場合だけ作成する．  
何度スクリプトを実行してもエラーにならない．

### `id INTEGER PRIMARY KEY AUTOINCREMENT`

```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
```

`id` を主キーにし，自動連番にする．

```txt
1件目
  id = 1

2件目
  id = 2
```

### `TEXT NOT NULL`

```sql
title TEXT NOT NULL
```

文字列型で，空欄禁止という意味である．

### 件数確認

```js
const count = db.prepare("SELECT COUNT(*) as count FROM questions").get().count;
```

`questions` テーブルに何件入っているか数えている．

SQLは次である．

```sql
SELECT COUNT(*) as count FROM questions
```

結果は次のような形になる．

```js
{ count: 0 }
```

最後の `.count` で数値だけ取り出している．

### `if (count === 0)`

```js
if (count === 0) {
```

DBが空のときだけ初期データを入れる．  
これにより，スクリプトを2回実行しても同じ問題が重複しない．

### `INSERT INTO`

```sql
INSERT INTO questions (title, category, body, answer)
VALUES (?, ?, ?, ?)
```

`questions` テーブルに1行追加するSQLである．  
`?` は後から値を入れる場所である．

### `insert.run(...)`

```js
insert.run(
  "電場の定義",
  "静電場",
  "電場Eとは何か説明せよ．",
  "電場とは，単位正電荷にはたらく力である．"
);
```

1件の問題を追加している．  
`insert.run` が3回あるので，3件追加される．

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
[← 前：8．SQLiteを導入する](./08-sqlite-introduction.md)  
[目次へ戻る](./README.md)  
[次：10．DBアクセス関数を作る →](./10-db-access-functions.md)
