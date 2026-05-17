import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/AppHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "電気磁気学AI学習支援システム",
  description: "静電界における誤解診断Webアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AppHeader />
        <main className="container">{children}</main>
        <footer className="footer">
          <div className="footerInner">
            <small>
              © {new Date().getFullYear()} 電気磁気学AI学習支援（プロトタイプ）
            </small>
          </div>
        </footer>
      </body>
    </html>
  );
}
