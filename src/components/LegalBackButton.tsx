"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { safeInternalRedirect } from "@/lib/auth/redirects";

export default function LegalBackButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  function goBack() {
    const requested = safeInternalRedirect(searchParams.get("returnTo"));
    if (requested) return router.push(requested);
    try {
      const referrer = document.referrer ? new URL(document.referrer) : null;
      if (referrer && referrer.origin === window.location.origin) return router.push(`${referrer.pathname}${referrer.search}${referrer.hash}`);
    } catch { /* use the public fallback */ }
    router.push("/");
  }
  return <button type="button" className="legalBackButton" aria-label="前のページへ戻る" onClick={goBack}>← 戻る</button>;
}
