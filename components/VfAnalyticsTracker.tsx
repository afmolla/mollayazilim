"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useWithBase } from "@/components/SitePrefixProvider";
import { useCookieConsent, hasAnalyticsConsent } from "@/components/CookieConsent";

/** Her sayfa görüntülemede hit kaydı — analitik onayı gerekir. */
export function VfAnalyticsTracker() {
  const pathname = usePathname() ?? "/";
  const wb = useWithBase();
  const { consent, ready } = useCookieConsent();

  useEffect(() => {
    if (!ready || !hasAnalyticsConsent(consent)) return;
    const p =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : pathname || "/";
    if (p.startsWith("/panel") || p.includes("/panel/")) return;
    const url = wb("/api/track");
    const referer = typeof document !== "undefined" ? document.referrer.slice(0, 500) : "";
    try {
      void fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: p, ...(referer ? { referer } : {}) }),
        cache: "no-store",
      });
    } catch {
      // ignore
    }
  }, [pathname, wb, consent, ready]);

  return null;
}

