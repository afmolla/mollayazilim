"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useWithBase } from "@/components/SitePrefixProvider";

/** Her sayfa görüntülemede sunucuya basit hit kaydı atar (admin istatistiği için). */
export function VfAnalyticsTracker() {
  const pathname = usePathname() ?? "/";
  const wb = useWithBase();

  useEffect(() => {
    const p = pathname || "/";
    const url = wb("/api/track");
    try {
      void fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: p }),
        cache: "no-store",
      });
    } catch {
      // ignore
    }
  }, [pathname, wb]);

  return null;
}

