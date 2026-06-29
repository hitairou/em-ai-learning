import Link from "next/link";
import MaterialUploader from "@/components/MaterialUploader";
import { requireAdmin } from "@/lib/auth/user";

export const metadata = { title: "教材管理" };
export default async function AdminMaterialsPage() { await requireAdmin(); return <div className="contentPage widePage"><div className="adminHeader"><div><span className="eyebrow">ADMIN</span><h1>教材管理</h1><p>PDF・画像・抽出テキストに科目と年度を付けて保存します。</p></div><Link className="button secondaryButton" href="/admin/problems">問題管理へ</Link></div><MaterialUploader /></div>; }
