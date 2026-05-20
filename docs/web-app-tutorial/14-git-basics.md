[← 前：13．画像ファイルとDBの関係](./13-images-and-database.md)  
[目次へ戻る](./README.md)  
[次：15．ブランチとPull Requestを理解する →](./15-branch-and-pull-request.md)

# 14．Gitで履歴管理する

## この章で学ぶこと
- Gitで履歴管理する理由
- add/commitの基本
- diffで変更を見る習慣

## 作業手順
## 14-1．状態確認

```bash
git status
```

## 14-2．コミット

```bash
git add .
git commit -m "Create electromagnetism support tutorial app"
```

## 14-3．解説

GitはローカルPC内で履歴を管理する．

```txt
git add
  コミット対象に入れる

git commit
  ローカル履歴として保存する

git push
  GitHubへ送る
```

`git commit` しただけでは，GitHubには反映されない．  
GitHubへ反映するには `git push` が必要である．

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
[← 前：13．画像ファイルとDBの関係](./13-images-and-database.md)  
[目次へ戻る](./README.md)  
[次：15．ブランチとPull Requestを理解する →](./15-branch-and-pull-request.md)
