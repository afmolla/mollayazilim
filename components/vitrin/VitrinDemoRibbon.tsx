"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useSitePrefix } from "@/components/SitePrefixProvider";
import { AMBALAJ_PREFIX } from "@/lib/site-config";

const STORAGE_KEY = "molla-vitrin-demo-ribbon-dismissed";

function readDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function notifyRibbon() {
  listeners.forEach((fn) => fn());
}

/** Portföy vitrinlerinde demo şeridi — esnek ambalaj sitesinde gösterilmez */
export function VitrinDemoRibbon() {
  const prefix = useSitePrefix();
  const isEsnekAmbalaj = prefix === AMBALAJ_PREFIX || prefix.startsWith(`${AMBALAJ_PREFIX}/`);

  const hidden = useSyncExternalStore(
    subscribe,
    readDismissed,
    () => true
  );

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
      notifyRibbon();
    } catch {
      /* ignore */
    }
  }, []);

  if (isEsnekAmbalaj || hidden) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[90] border-t border-amber-500/40 bg-amber-950/95 px-4 py-2 text-center text-sm text-amber-100 shadow-lg backdrop-blur-sm"
      role="status"
    >
      <span className="font-medium">Demo vitrin</span>
      <span className="mx-2 opacity-80">—</span>
      Bu site örnek içerikle gösterilmektedir.
      <button
        type="button"
        onClick={dismiss}
        className="ml-3 rounded-md border border-amber-400/50 px-2 py-0.5 text-xs hover:bg-amber-800/60"
      >
        Kapat
      </button>
    </div>
  );
}
