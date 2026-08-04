import type { Metadata, Viewport } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import "./info-responsive.css";
import AppHeader from "@/components/AppHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { getCurrentUser } from "@/lib/auth/user";
import LegalFooter from "@/components/LegalFooter";

export const metadata: Metadata = {
  title: { default: "EM PASS | 電磁気AI学習支援", template: "%s | EM PASS" },
  description: "電磁気1・2の苦手を診断し、今日やるべき問題へ導くAI学習支援アプリ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return (
    <html lang="ja" data-scroll-behavior="smooth">
      <body>
        <AppHeader user={user ? { name: user.name, role: user.role, selectedCourse: user.selectedCourse } : null} />
        <main className={user ? "appMain" : "publicMain"}>{children}</main>
        {user && <BottomNavigation />}
        <LegalFooter />
      </body>
    </html>
  );
}
