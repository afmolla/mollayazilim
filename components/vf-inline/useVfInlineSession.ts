"use client";
import { useWithBase } from "@/components/SitePrefixProvider";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/** ?vf_edit=1 ve panel oturumu — vitrin satır-içi düzenleme */
export function useVfInlineSession() {
  const wb = useWithBase();
  const searchParams = useSearchParams();
  const vfEdit = searchParams.get("vf_edit") === "1";
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (!vfEdit) {
      queueMicrotask(() => setSessionOk(null));
      return;
    }
    let cancelled = false;
    queueMicrotask(() => setSessionOk(null));
    void (async () => {
      try {
        const res = await fetch(wb("/api/panel/session"), { credentials: "same-origin", cache: "no-store" });
        const j = (await res.json()) as { ok?: boolean };
        if (!cancelled) setSessionOk(!!j.ok);
      } catch {
        if (!cancelled) setSessionOk(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [vfEdit]);

  const inline = vfEdit && sessionOk === true;
  return { vfEdit, sessionOk, inline };
}
