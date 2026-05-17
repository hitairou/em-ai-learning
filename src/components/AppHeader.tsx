import Link from "next/link";

export default function AppHeader() {
  return (
    <header className="header">
      <div className="headerInner">
        <Link className="brand" href="/">
          電気磁気学AI学習支援
        </Link>
        <nav className="nav">
          <Link className="navLink" href="/practice">
            問題演習
          </Link>
          <Link className="navLink" href="/progress">
            理解度
          </Link>
        </nav>
      </div>
    </header>
  );
}

