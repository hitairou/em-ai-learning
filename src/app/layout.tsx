import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import AppHeader from "@/components/AppHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { getCurrentUser } from "@/lib/auth/user";

export const metadata: Metadata = {
  title: { default: "EM PASS | 徳島大学 電磁気学習室", template: "%s | EM PASS" },
  description: "電磁気1・2の苦手を診断し、今日やるべき問題へ導くAI学習支援アプリ",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return (
    <html lang="ja" data-scroll-behavior="smooth">
      <body>
        <AppHeader user={user ? { name: user.name, role: user.role } : null} />
        <main className={user ? "appMain" : "publicMain"}>{children}</main>
        {user && <BottomNavigation />}
      </body>
    </html>
  );
}
