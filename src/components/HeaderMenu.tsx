"use client";

import Link from "next/link";
import { BookOpen, Code2, HelpCircle, Menu, Presentation, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const links = [
  { href: "/guide/slideshow", label: "EM PASS紹介スライド", description: "アプリの全体像を短時間で見る", icon: Presentation },
  { href: "/guide", label: "使い方ガイド", description: "まずはここから", icon: HelpCircle },
  { href: "/guide/screens", label: "画面別ガイド", description: "機能をくわしく見る", icon: BookOpen },
  { href: "/development", label: "仕組み・開発", description: "アプリの中身を知る", icon: Code2 },
];

export default function HeaderMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function closeOnOutside(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutside);
    return () => document.removeEventListener("pointerdown", closeOnOutside);
  }, [open]);

  return (
    <div className="headerMenu" ref={menuRef}>
      <button className="headerMenuButton" type="button" onClick={() => setOpen((value) => !value)} aria-label="ガイドメニュー" aria-expanded={open} title="ガイドメニュー">
        {open ? <X size={20} /> : <Menu size={21} />}
      </button>
      {open && <nav className="headerMenuPanel" aria-label="ガイドメニュー">{links.map((link) => { const Icon = link.icon; return <Link href={link.href} key={link.href} onClick={() => setOpen(false)}><Icon size={19} /><span><strong>{link.label}</strong><small>{link.description}</small></span></Link>; })}</nav>}
    </div>
  );
}
