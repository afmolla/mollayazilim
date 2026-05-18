"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useWithBase } from "@/components/SitePrefixProvider";

/** Her sayfa görüntülemede sunucuya basit hit kaydı atar (admin istatistiği için). */
export function VfAnalyticsTracker() {
  const pathname = usePathname() ?? "/";
  const wb = useWithBase();

  useEffect(() => {
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
  }, [pathname, wb]);

  return null;
}

