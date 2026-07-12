"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Dumbbell, Home, RotateCcw, UserRound } from "lucide-react";

const items = [
  { href: "/home", label: "ホーム", icon: Home },
  { href: "/practice", label: "演習", icon: Dumbbell },
  { href: "/camera", label: "写真で質問", icon: Camera, primary: true },
  { href: "/review", label: "復習", icon: RotateCcw },
  { href: "/profile", label: "マイページ", icon: UserRound },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  return (
    <nav className="bottomNav" aria-label="学習メニュー">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${item.primary ? "bottomNavPrimary" : ""} ${active ? "isActive" : ""}`}
          >
            <span className="bottomNavIcon"><Icon size={item.primary ? 24 : 21} /></span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
