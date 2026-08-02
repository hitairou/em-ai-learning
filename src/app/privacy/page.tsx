import type { Metadata } from "next";
import LegalFooter from "@/components/LegalFooter";
import { PRIVACY_VERSION, getLegalConfig } from "@/lib/legal/config";

export const metadata: Metadata = { title: "プライバシーポリシー", description: "EM PASSのプライバシーポリシー" };
export default function PrivacyPage() {
  const legal = getLegalConfig();
  return <div className="legalPage"><span className="eyebrow">PRIVACY POLICY</span><h1>プライバシーポリシー</h1><div className="legalBody">
    <h2>メール認証</h2><p>メール認証のため、メールアドレス、認証コード送信日時、認証日時、失敗回数を処理します。Mailgunへメールアドレスと認証メール本文を送信します。認証メールでは開封追跡・クリック追跡を使用しません。未認証の仮登録情報は標準24時間で削除します。</p>
    <p>制定日・改定日：2026年8月2日 / バージョン：{PRIVACY_VERSION}</p>
    <h2>取得する情報</h2><p>ユーザー名、メールアドレス、認証情報のハッシュ、選択科目・学習目的、診断・演習の回答、正誤・回答時間・ヒント利用回数・誤答分類、質問内容、アップロード画像・PDF、抽出テキスト、AI解析結果・採点結果・解説・類題、Cookie・セッション情報、セキュリティ・障害対応に必要なログを取得します。</p>
    <h2>利用目的</h2><p>アカウント管理、認証、学習履歴の保存、苦手分野の分析、AI採点・質問解析・類題生成、不正利用防止、障害調査、品質改善、問い合わせ対応のために利用します。</p>
    <h2>OpenAI APIへの送信</h2><p>問題文、回答、質問文、PDF抽出テキスト、アップロード画像、学習状況の一部をOpenAI APIへ送信する場合があります。OpenAI APIの入力・出力は標準ではOpenAIのモデル学習に使用されず、本アプリはResponses APIに<code>store: false</code>を指定します。ただしOpenAI側に一切保存されないことを意味せず、不正利用監視、セキュリティ、法令対応等のため一定期間処理・保持される場合があります。最新の取扱いはOpenAI公式のデータ管理方針を確認してください。個人情報を含む画像・PDFは送信しないでください。</p>
    <h2>本サービス側の保存期間</h2><p>元の画像・PDFはアップロードから設定された保存期限（現在の設定：{legal.retentionDays}日）後に自動削除します。元ファイル削除後も、抽出テキスト、AI解析結果、質問履歴は利用者が削除するかアカウントを削除するまで保持します。質問履歴削除時は対応する元ファイルも削除し、アカウント削除時は属する学習履歴、質問履歴、アップロードファイルを削除します。バックアップからの完全消去には運用上必要な期間を要する場合があります。</p>
    <h2>安全管理・Cookie・問い合わせ</h2><p>アクセス制御、認証、所有者確認、アップロード形式・サイズ検証等の安全管理措置を講じます。Cookieはセッション維持、認証、ゲスト同意の改ざん防止に使用します。開示・訂正・削除等は<a href={`mailto:${legal.contact}`}>{legal.contact}</a>へご連絡ください。改定時は本ページにバージョンと日付を表示します。</p>
    <p>運営者：{legal.operator} / 連絡先：<a href={`mailto:${legal.contact}`}>{legal.contact}</a></p><LegalFooter />
  </div></div>;
}
