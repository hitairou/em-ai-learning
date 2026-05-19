"use client";

import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "theme";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const nextTheme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : systemTheme;

    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  return (
    <button type="button" className="buttonSecondary" onClick={toggleTheme}>
      {theme === "dark" ? "ライトモード" : "ダークモード"}
    </button>
  );
}
