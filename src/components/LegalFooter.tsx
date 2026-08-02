import Link from "next/link";
import { getLegalConfig } from "@/lib/legal/config";

export default function LegalFooter() {
  const legal = getLegalConfig();
  return <footer className="legalFooter">
    <p>EM PASSは独立して運営される非公式の学習支援サービスです。特定の大学・学部・教員による公認、監修、運営サービスではありません。</p>
    <nav aria-label="法務情報"><Link href="/terms">利用規約</Link><Link href="/privacy">プライバシーポリシー</Link><a href={`mailto:${legal.contact}`}>問い合わせ先</a></nav>
    <small>{legal.operator} / {legal.contact}</small>
  </footer>;
}
