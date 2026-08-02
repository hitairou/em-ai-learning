"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function GuestStartButton({ variant = "primary" }: { variant?: "primary" | "light" | "subtle" }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setSubmitting(true);
    setError("");
    window.location.assign("/legal/consent?guest=1");
  }

  return (
    <span className="guestStartWrap">
      <button className={`button ${variant === "light" ? "lightButton" : variant === "subtle" ? "subtleButton" : "primaryButton"}`} type="button" disabled={submitting} onClick={start}>
        {submitting ? "開始中..." : "ゲストで始める"}
        {!submitting && <ArrowRight size={18} />}
      </button>
      {error && <small className="guestStartError">{error}</small>}
    </span>
  );
}
