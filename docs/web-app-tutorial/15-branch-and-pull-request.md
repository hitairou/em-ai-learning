[← 前：14．Gitで履歴管理する](./14-git-basics.md)  
[目次へ戻る](./README.md)  
[次：16．GitHubへpushする →](./16-github-push.md)

# 15．ブランチとPull Requestを理解する

## この章で学ぶこと
- ブランチとPRの目的
- Issue番号とブランチ名の紐づけ
- レビューの流れ

## 作業手順
## 15-1．ブランチ作成

```bash
git switch -c add-question-pages
```

## 15-2．解説

ブランチは作業場所である．

```txt
main
  安定版

add-question-pages
  作業用ブランチ
```

作業用ブランチで修正し，GitHub上でPull Requestを作る．

## 15-3．Pull Requestの意味

Pull Requestは，

```txt
このブランチの変更をmainに入れてよいか確認する場所
```

である．

チーム開発では，mainへ直接pushしない．  
ブランチで作業し，Pull Requestを通してmainへ取り込む．

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
[← 前：14．Gitで履歴管理する](./14-git-basics.md)  
[目次へ戻る](./README.md)  
[次：16．GitHubへpushする →](./16-github-push.md)
