# デプロイの説明（初心者向け，実行は担当者のみ）

この資料は「デプロイとは何か」「どこを見ればよいか」を初心者向けに説明します．
ただし，**deploy-to-serverの実行は小若さん，またはインフラ担当のみ**です．

公開URL：`https://edesign.tairoh.com`

## デプロイとは何か
デプロイは，作った変更を公開サイトに反映する作業です．
このプロジェクトでは，`main` に入った変更を **Docker image** にしてサーバーへ反映します．

## このプロジェクトの流れ（重要）
1. PRを `main` にmerge
2. `docker-publish` が自動実行（GitHub Actions）
3. Docker imageが `GHCR`（GitHub Container Registry）に保存される
4. インフラ担当が `deploy-to-server` を手動実行
5. ESPRIMO上の `em-ai-learning` コンテナが更新される
6. `https://edesign.tairoh.com` に反映される

注意：
- **`main` にmergeしただけでは，すぐにはサーバー反映されません**（手動デプロイが必要）．

## GitHub Actions画面の見方（見るだけでOK）
1. GitHubで `hitairou/em-ai-learning` を開く
2. 上部メニューの `Actions` を押す
3. 左側の一覧から `Build and publish Docker image` を押す
4. 緑のチェック（成功）ならOKです
5. 赤い×（失敗）なら，クリックしてログを見ます

## deploy-to-server（担当者が実行する手順）
1. `Actions` を押す
2. 左側の一覧から `deploy-to-server` を押す
3. `Run workflow` を押す
4. `tag` に `main` と入力する
5. `Run workflow` を押す
6. 実行結果が緑のチェックになれば成功です
7. 公開URLを確認します（LAN内で開けない場合はスマホ回線で確認）

## 失敗したらどこを見るか（担当者向け）
- `Actions` → 該当workflow run → `job` → `step` → `logs`

## よくある失敗（初心者向け理解）
- `npm run build` が失敗してimageが作れない
- `lint` が失敗して止まる
- SSH接続に失敗する（鍵や接続先の問題）
- healthcheck失敗（起動はしたが，`127.0.0.1:3010` が応答しない）
- `docker-publish` がまだ終わっていない
- 古いtagを指定した

## NATループバック（重要）
LAN内PCから `https://edesign.tairoh.com` が開けない場合があります．
そのときは **スマホのモバイル回線**で確認してください．

