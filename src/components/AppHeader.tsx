import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";

interface HeaderUser {
  name: string;
  role: string;
}

export default function AppHeader({ user }: { user: HeaderUser | null }) {
  return (
    <header className="siteHeader">
      <div className="headerInner">
        <Link className="brand" href={user ? "/home" : "/"}>
          <span className="brandMark">E</span>
          <span>
            EM PASS
            <small>徳島大学 電磁気学習室</small>
          </span>
        </Link>
        {user ? (
          <div className="desktopHeaderActions">
            <nav className="desktopNav" aria-label="メインナビゲーション">
              <Link href="/home">ホーム</Link>
              <Link href="/camera">写真で質問</Link>
              <Link href="/practice">演習</Link>
              <Link href="/review">復習</Link>
              <Link href="/profile">マイページ</Link>
              {user.role === "admin" && (
                <Link href="/admin/problems"><ShieldCheck size={16} />管理</Link>
              )}
            </nav>
            <span className="headerUser">{user.name}</span>
            <Link className="iconButton" href="/logout" aria-label="ログアウト">
              <LogOut size={18} />
            </Link>
          </div>
        ) : (
          <div className="authLinks">
            <Link href="/login">ログイン</Link>
            <Link className="button smallButton" href="/signup">無料で始める</Link>
          </div>
        )}
      </div>
    </header>
  );
}
