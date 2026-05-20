[← 前：18．Dockerで本番実行環境を作る](./18-docker.md)  
[目次へ戻る](./README.md)  
[次：20．DNS，ルーター，Nginxの違い →](./20-dns-router-nginx.md)

# 19．Nginxで外部公開の入口を作る

## この章で学ぶこと
- Nginxが何をするか（入口）
- リバースプロキシの基本
- アプリとNginxの役割分担

## 作業手順
## 19-1．Nginx設定例

```nginx
server {
    server_name em-support.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 19-2．解説

Nginxは，外部から来たHTTPアクセスを内部アプリへ転送する．

```txt
https://em-support.example.com
  ↓
Nginx
  ↓
http://127.0.0.1:3000
  ↓
Next.js
```

### `server_name`

```nginx
server_name em-support.example.com;
```

このドメインで来たアクセスを受ける．

### `location /`

```nginx
location / {
```

すべてのパスを対象にする．

### `proxy_pass`

```nginx
proxy_pass http://127.0.0.1:3000;
```

内部で動いているNext.jsへ転送する．

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
[← 前：18．Dockerで本番実行環境を作る](./18-docker.md)  
[目次へ戻る](./README.md)  
[次：20．DNS，ルーター，Nginxの違い →](./20-dns-router-nginx.md)
