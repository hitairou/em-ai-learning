[← 前：15．ブランチとPull Requestを理解する](./15-branch-and-pull-request.md)  
[目次へ戻る](./README.md)  
[次：17．ビルドと本番起動 →](./17-build-and-production-start.md)

# 16．GitHubへpushする

## この章で学ぶこと
- GitHubへpushする意味
- push後に何が起きるか
- 失敗しやすい認証ポイント

## 作業手順
## 16-1．リモート登録

```bash
git remote add origin https://github.com/ユーザー名/em-support-tutorial.git
```

## 16-2．mainをpush

```bash
git push -u origin main
```

## 16-3．作業ブランチをpush

```bash
git push -u origin add-question-pages
```

## 16-4．解説

ローカルでブランチを作っただけではGitHubには存在しない．  
`git push` した時点でGitHub上にブランチが作られる．

```txt
ローカルでブランチ作成
  GitHubにはまだない

git push
  GitHubに同名ブランチが作られる
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
[← 前：15．ブランチとPull Requestを理解する](./15-branch-and-pull-request.md)  
[目次へ戻る](./README.md)  
[次：17．ビルドと本番起動 →](./17-build-and-production-start.md)
