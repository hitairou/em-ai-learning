[← 前：17．ビルドと本番起動](./17-build-and-production-start.md)  
[目次へ戻る](./README.md)  
[次：19．Nginxで外部公開の入口を作る →](./19-nginx.md)

# 18．Dockerで本番実行環境を作る

## この章で学ぶこと
- Dockerの考え方（環境を固める）
- imageとcontainerの違い
- 本番運用での位置づけ

## 作業手順
## 18-1．Dockerfile

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
```

## 18-2．コード解説

### `FROM node:22-alpine`

Node.js入りの軽量Linuxを使う．

### `WORKDIR /app`

コンテナ内の作業場所を `/app` にする．

### `COPY package*.json ./`

依存関係情報をコンテナへコピーする．

### `RUN npm install`

必要なnpmパッケージをインストールする．

### `COPY . .`

アプリ本体をコンテナへコピーする．

### `RUN npm run build`

本番用ビルドを実行する．

### `EXPOSE 3000`

コンテナ内で3000番ポートを使うことを示す．

### `CMD ["npm", "run", "start"]`

コンテナ起動時に本番サーバーを起動する．

## 18-3．Docker実行

```bash
docker build -t em-support-tutorial .
docker run -p 3000:3000 em-support-tutorial
```

## 18-4．永続データ

SQLiteのDBファイルはコンテナ外に置く設計にする．

```bash
docker run -p 3000:3000 -v $(pwd)/data:/app/data em-support-tutorial
```

```txt
Dockerコンテナ
  アプリ本体

data/app.db
  永続データ
```

コンテナを作り直してもDBを残すために，DBはvolumeで外に出す．

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
[← 前：17．ビルドと本番起動](./17-build-and-production-start.md)  
[目次へ戻る](./README.md)  
[次：19．Nginxで外部公開の入口を作る →](./19-nginx.md)
