import type { Metadata } from "next";
import LegalFooter from "@/components/LegalFooter";
import { TERMS_VERSION, UPLOAD_POLICY_VERSION, getLegalConfig } from "@/lib/legal/config";

export const metadata: Metadata = { title: "利用規約", description: "EM PASSの利用規約" };
export default function TermsPage() {
  const legal = getLegalConfig();
  return <LegalDocument title="利用規約" eyebrow="TERMS OF USE">
    <p>制定日・改定日：2026年8月2日 / 規約バージョン：{TERMS_VERSION}</p>
    <h2>1. サービスの目的</h2><p>EM PASSは、大学レベルの電磁気学1・2を学ぶ利用者向けの独立した学習支援サービスです。特定の大学、学部、教員、教育機関による公式・公認・監修サービスではありません。</p>
    <h2>2. AI機能と学習上の注意</h2><p>AIによる回答、採点、解説、類題には誤りが含まれる場合があります。利用者は教科書、授業資料その他の信頼できる資料で確認してください。本サービスは実際の試験問題や将来の出題内容を提供・保証するものではありません。</p>
    <h2>3. アカウント</h2><p>利用者は実在する自分のメールアドレスを使用し、他人のメールアドレスで登録してはなりません。登録情報を正確に管理し、認証情報と確認コードを第三者へ貸与・共有しないものとします。認証機能への総当たり、大量登録、大量送信その他の不正利用を禁止します。</p><p>メール配送の遅延、受信側の迷惑メールフィルタ、メールサービスの障害等により認証メールが届かない場合があります。</p>
    <h2>4. アップロード資料</h2><p>利用者は、送信・解析に必要な権利または適法な利用根拠を有する資料だけをアップロードしてください。未実施または実施中の試験問題、流出問題、外部提供禁止資料、市販教材の全部または実質的部分、第三者の権利を侵害する資料、他人の氏名・学籍番号・メールアドレス・顔写真・採点結果を含む資料、違法目的で取得した資料、学習と無関係な資料、マルウェア等の有害ファイルは禁止します。</p>
    <h2>5. 知的財産権と禁止行為</h2><p>サービスのコード、デザイン、文章等の権利は運営者または正当な権利者に帰属します。法令違反、不正アクセス、リバースエンジニアリング、他者への迷惑行為、サービス運営を妨げる行為を禁止します。</p>
    <h2>6. 変更・停止・アカウント</h2><p>運営者は、必要に応じてサービスを変更・停止できます。規約違反や安全上の必要がある場合、通知のうえ、または緊急時には事後通知として、アカウントを制限・停止・削除することがあります。</p>
    <h2>7. 免責・責任制限</h2><p>運営者は、法令で認められる範囲で、サービスの正確性、継続性、特定目的への適合性を保証しません。消費者契約法その他の強行規定に反する範囲で責任を免除するものではありません。</p>
    <h2>8. 準拠法・改定</h2><p>本規約は日本法に準拠します。改定時は本ページへの掲載その他適切な方法で告知し、改定日とバージョンを表示します。アップロードポリシーバージョン：{UPLOAD_POLICY_VERSION}。</p>
    <p>運営者：{legal.operator} / 連絡先：<a href={`mailto:${legal.contact}`}>{legal.contact}</a></p>
    <LegalFooter />
  </LegalDocument>;
}

function LegalDocument({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return <div className="legalPage"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><div className="legalBody">{children}</div></div>;
}
