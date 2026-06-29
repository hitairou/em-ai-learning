import Link from "next/link";
import ProblemEditorForm from "@/components/ProblemEditorForm";
import { requireAdmin } from "@/lib/auth/user";

export const metadata = { title: "問題管理" };
export default async function AdminProblemsPage() { await requireAdmin(); return <div className="contentPage widePage"><div className="adminHeader"><div><span className="eyebrow">ADMIN</span><h1>問題管理</h1><p>診断・演習・過去問構造を一元管理します。</p></div><Link className="button secondaryButton" href="/admin/materials">教材管理へ</Link></div><ProblemEditorForm /></div>; }
