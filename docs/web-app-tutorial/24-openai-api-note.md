[← 前：23．実物の電磁気学AI支援システムを見るときの読み方](./23-how-to-read-real-repository.md)  
[目次へ戻る](./README.md)  
[次：25．まとめ →](./25-summary.md)

# 24．補足：OpenAI APIについて

## この章で学ぶこと
- OpenAI APIを後回しにする理由
- APIキー管理の注意
- 将来の拡張の考え方

## 作業手順
このチュートリアルではOpenAI APIを使わない．  
理由は，APIキーを発行していない段階では，OpenAI APIを使った実装を確定扱いにできないためである．

AI問題生成を追加する場合は，通常次のような構成になる．

```txt
.env.local
  OPENAI_API_KEYを保存

app/api/generate/route.ts
  APIルートを作る

ページ側
  fetch("/api/generate")で呼び出す
```

現段階では，まずNext.js，React，SQLite，Git，Docker，Nginxの基礎理解を優先する．

---

## コード
この章は補足説明中心です．

## コード解説
本文中の『なぜそうするか』の説明（解説）を飛ばさずに読み，必要ならもう一度戻って確認してください．

## この章で理解すべきポイント
- この章の内容を自分の言葉で説明できる
- 手順を見ながら同じ作業を再現できる
- どのファイルが関係するかを1つ以上言える

## 前後ページ
---
[← 前：23．実物の電磁気学AI支援システムを見るときの読み方](./23-how-to-read-real-repository.md)  
[目次へ戻る](./README.md)  
[次：25．まとめ →](./25-summary.md)
