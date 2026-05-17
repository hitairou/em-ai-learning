# Copilot用プロンプト集（コピペで使える）

このファイルは，GitHub Copilot coding agent または VS Code Copilot Chat に投げる「依頼文テンプレ」です．
初心者は，まず **文言修正テンプレ** から試してください．

共通ルール（全部に必ず入れる）：
- `main` へ直接pushしない
- 新しいブランチで作業する
- Pull Requestを作る
- `npm run lint` と `npm run build` を実行する
- 変更したファイルを説明する
- 既存機能を壊さない
- SecretsやAPIキーに触らない
- `deploy-to-server` を実行しない
- サーバー設定（nginx，certbot）に触らない

## 悪い依頼と良い依頼
### 悪い例
「UIをいい感じにして」

### 良い例
「トップページの機能一覧カードの余白を広げ，見出しを読みやすくしてください．変更範囲は `src/app/page.tsx` と `src/app/globals.css` に限定してください．`main` へ直接pushせず，Pull Requestを作成してください．`npm run lint` と `npm run build` も確認してください．」

---

## 1．文言修正テンプレ（最初におすすめ）
「`src/app/page.tsx` の説明文を，静電界が対象だと伝わるように1〜2文だけ改善してください．変更範囲は `src/app/page.tsx` のみ．`main` へ直接pushしないでブランチを作り，PRを作成してください．`npm run lint` と `npm run build` を実行して成功することを確認し，変更したファイルをPR本文に説明してください．SecretsやAPIキーには触らないでください．」

## 2．UI改善テンプレ（小）
「`src/components/QuestionViewer.tsx` の選択肢ボタンの見た目を少し改善してください（余白，ホバー，選択中の強調）．変更範囲は `src/components/QuestionViewer.tsx` と `src/app/globals.css` のみ．`main` へ直接pushせずPRを作り，`npm run lint` と `npm run build` を確認してください．」

## 3．問題追加テンプレ（小）
「`src/data/questions.ts` に静電界の基礎問題を1問追加してください．既存の型（`src/types/learning.ts`）に合わせてください．変更後に `npm run build` が通ることを確認し，PRを作成してください．」

## 4．誤解タイプ整理テンプレ
「誤解タイプの説明文を初心者向けに整理したいです．`src/lib/diagnosis.ts` と `src/lib/feedback.ts` の文章を読みやすくしてください．関数名や引数は変えないでください．`npm run lint` / `npm run build` を確認し，PRを作ってください．」

## 5．学習アドバイス改善テンプレ
「`src/lib/feedback.ts` のテンプレ学習アドバイスを，初学者にとって分かりやすい表現に改善してください．文体は丁寧で短めに．関数名や引数は変更しないでください．PRを作成し，`npm run lint` / `npm run build` を確認してください．」

## 6．理解度表示改善テンプレ
「`src/components/LearningScorePanel.tsx` の理解度表示を少し見やすくしてください（ラベルの見出しや説明文など）．大きな構造変更はせず，見た目と文言調整中心にしてください．PRを作成し，`npm run lint` / `npm run build` を確認してください．」

## 7．ドキュメント修正テンプレ
「`docs/*` の文章を初心者向けに読みやすく整えてください（専門用語には短い説明を添える）．コードの変更はしないでください．PRを作成してください．」

## 8．バグ修正テンプレ
「再現手順：<ここに再現手順>．期待：<期待>．実際：<実際>．原因を調べ，最小の修正で直してください．修正後に `npm run lint` と `npm run build` を確認し，PRを作成してください．」

## 9．PRレビュー修正依頼テンプレ（PRコメントで使う）
「レビューコメントの指摘点を反映してください．変更範囲は指摘箇所に限定し，`npm run lint` / `npm run build` を再確認してください．」

## 10．変更を小さくする依頼テンプレ
「変更が大きくなりそうなので，今回は `<対象>` のみを最小修正してください．ファイルは `<ファイル名>` のみ触ってください．PRで差分が小さくなるようにお願いします．」

