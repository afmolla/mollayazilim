"use client";

import { useEffect, useState } from "react";
import { useWithBase } from "@/components/SitePrefixProvider";

type Stats = { onlineNow: number; todayUniques: number; todayHits: number };

/** Panel oturumu varsa üstte anlık sayaç gösterir; yoksa görünmez. */
export function SiteAnalyticsBadge() {
  const wb = useWithBase();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let alive = true;
    async function tick() {
      try {
        const res = await fetch(wb("/api/panel/analytics"), { credentials: "same-origin", cache: "no-store" });
        if (!alive) return;
        if (res.status === 401) {
          setStats(null);
          return;
        }
        if (!res.ok) return;
        const j = (await res.json()) as Stats;
        setStats(j);
      } catch {
        // ignore
      }
    }
    void tick();
    const t = setInterval(tick, 10_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [wb]);

  if (!stats) return null;

  return (
    <div className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--muted)] md:inline-flex">
      <span className="font-semibold text-[var(--text)]">Online</span>
      <span className="tabular-nums text-[var(--brand)]">{stats.onlineNow}</span>
      <span className="opacity-60">·</span>
      <span className="font-semibold text-[var(--text)]">Bugün</span>
      <span className="tabular-nums text-[var(--brand)]">{stats.todayUniques}</span>
    </div>
  );
}

