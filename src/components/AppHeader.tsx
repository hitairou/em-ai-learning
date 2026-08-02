"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import HeaderCourseSwitcher from "@/components/HeaderCourseSwitcher";
import type { Course } from "@/types/learning";

interface HeaderUser {
  name: string;
  role: string;
  selectedCourse: string | null;
}

export default function AppHeader({ user }: { user: HeaderUser | null }) {
  const pathname = usePathname();
  if (pathname === "/onboarding/diagnostic") return null;

  return (
    <header className="siteHeader">
      <div className="headerInner">
        {user?.selectedCourse ? (
          <div className="headerIdentity courseTitleIdentity">
            <HeaderCourseSwitcher current={user.selectedCourse as Course} />
          </div>
        ) : (
          <div className="headerIdentity">
            <Link className="brand" href={user ? "/home" : "/"} prefetch={user ? false : undefined}>
              <span className="brandMark">E</span>
              <span>
                EM PASS
                <small>電磁気AI学習支援</small>
              </span>
            </Link>
          </div>
        )}
        {user ? (
          <div className="desktopHeaderActions">
            <nav className="desktopNav" aria-label="メインナビゲーション">
              <Link href="/home" prefetch={false}>ホーム</Link>
              <Link href="/camera" prefetch={false}>写真で質問</Link>
              <Link href="/practice" prefetch={false}>演習</Link>
              <Link href="/review" prefetch={false}>復習</Link>
              <Link href="/profile" prefetch={false}>マイページ</Link>
              {user.role === "admin" && (
                <Link href="/admin/problems" prefetch={false}><ShieldCheck size={16} />管理</Link>
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
