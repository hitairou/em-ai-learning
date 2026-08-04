"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProblemSearchButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [questionId, setQuestionId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function closeOnOutsidePointer(event: PointerEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [open]);

  function toggleOpen() {
    setOpen((value) => !value);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = questionId.trim();
    if (!value || !/^\d+$/.test(value)) {
      setError("問題IDは数字で入力してください");
      return;
    }

    setLoading(true);
    setError("");
    const response = await fetch(`/api/problems/search?questionId=${encodeURIComponent(value)}`);
    const data = await response.json().catch(() => ({}));
    if (response.ok && data.href) {
      router.push(data.href);
      return;
    }
    setError(data.error ?? "該当する問題が見つかりません");
    setLoading(false);
  }

  return (
    <div className="problemSearch" ref={searchRef}>
      <button className="pageTitleSearchButton" type="button" onClick={toggleOpen} aria-label="問題IDで検索" aria-expanded={open} title="問題IDで検索">
        {open ? <X size={21} /> : <Search size={21} />}
      </button>
      {open && (
        <form className="problemSearchForm" onSubmit={handleSubmit}>
          <label htmlFor="problem-search-id">問題ID</label>
          <div className="problemSearchControls">
            <input id="problem-search-id" type="number" inputMode="numeric" pattern="[0-9]*" min="1" step="1" value={questionId} onChange={(event) => setQuestionId(event.target.value)} placeholder="例: 1" autoFocus />
            <button className="button primaryButton smallButton" type="submit" disabled={loading}>{loading ? "検索中" : "検索"}</button>
          </div>
          {error && <p className="problemSearchError" role="alert">{error}</p>}
        </form>
      )}
    </div>
  );
}
