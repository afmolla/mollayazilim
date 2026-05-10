"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "molla-vitrin-demo-ribbon-dismissed";

/** Tüm portföy vitrinlerinde: demo olduğu bariz olsun */
export function VitrinDemoRibbon() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setHidden(false);
    }
  }, []);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setHidden(true);
  }, []);

  if (hidden) return null;

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-3 pb-[env(safe-area-inset-bottom)] pt-2 md:pb-3"
    >
      <div className="pointer-events-auto flex max-w-3xl flex-wrap items-center justify-center gap-3 rounded-2xl border border-amber-400/35 bg-amber-950/92 px-4 py-2.5 text-center shadow-lg shadow-black/40 backdrop-blur-md md:gap-4 md:px-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-100 md:text-[13px]">
          <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-amber-200">DEMO</span>
          <span className="ml-2 text-amber-50/95">
            Bu site örnek vitrindir — gerçek işletme veya ilan verisi değildir.
          </span>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white hover:bg-white/15"
        >
          Anladım
        </button>
      </div>
    </div>
  );
}
