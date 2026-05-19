import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function AppHeader() {
  return (
    <header className="header">
      <div className="headerInner">
        <Link className="brand" href="/">
          電気磁気学AI学習支援
        </Link>
        <div className="row">
          <nav className="nav">
            <Link className="navLink" href="/practice">
              問題演習
            </Link>
            <Link className="navLink" href="/progress">
              理解度
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

