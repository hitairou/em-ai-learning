"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function GuestStartButton({ variant = "primary" }: { variant?: "primary" | "light" | "subtle" }) {
  return (
    <span className="guestStartWrap">
      <Link className={`button ${variant === "light" ? "lightButton" : variant === "subtle" ? "subtleButton" : "primaryButton"}`} href="/legal/consent?guest=1">
        ゲストで始める <ArrowRight size={18} />
      </Link>
    </span>
  );
}
