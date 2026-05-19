# 06 デプロイの説明（初心者向け，実行は担当者のみ）

前へ：[05 チュートリアル（小さな変更で流れを体験）](./05-tutorial-small-change.md) / 次へ：[07 トラブル対応集（初心者向け）](./07-troubleshooting-for-members.md)

この資料は「デプロイとは何か」「どこを見ればよいか」を初心者向けに説明します．  
ただし，**deploy-to-serverの実行は小若さん，またはインフラ担当のみ**です．

公開URL：`https://edesign.tairoh.com`

## デプロイとは何か
デプロイは，作った変更を公開サイトに反映する作業です．

## このプロジェクトの流れ（重要）
1. PRを `main` にmerge
2. `docker-publish` が自動実行（GitHub Actions）
3. Docker imageが `GHCR` に保存される
4. インフラ担当が `deploy-to-server` を手動実行
5. サーバーの `em-ai-learning` コンテナが更新される
6. `https://edesign.tairoh.com` に反映される

注意：
- **`main` にmergeしただけでは，すぐにはサーバー反映されません**（手動デプロイが必要）．

## 【GitHubで行う】GitHub Actions画面の見方（見るだけでOK）
1. GitHubで `hitairou/em-ai-learning` を開く
2. 上部メニューの `Actions` を押す
3. 左側の一覧から `Build and publish Docker image` を押す
4. 緑のチェック（成功）ならOKです
5. 赤い×（失敗）なら，クリックしてログを見ます

## 【GitHubで行う】失敗したらどこを見るか（担当者向け）
- `Actions` → 該当workflow run → `job` → `step` → `logs`

## よくある注意
- LAN内から `https://edesign.tairoh.com` が開けない場合があります（NATループバック）．その場合はスマホ回線で確認します．

---
前へ：[05 チュートリアル（小さな変更で流れを体験）](./05-tutorial-small-change.md) / 次へ：[07 トラブル対応集（初心者向け）](./07-troubleshooting-for-members.md)

