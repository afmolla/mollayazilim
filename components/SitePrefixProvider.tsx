"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { withBaseFromPrefix } from "@/lib/base-path";

const Ctx = createContext<string>("");

export function SitePrefixProvider(props: { prefix: string; children: ReactNode }) {
  const v = props.prefix?.trim() || "";
  const stable = useMemo(() => v, [v]);
  return <Ctx.Provider value={stable}>{props.children}</Ctx.Provider>;
}

export function useSitePrefix(): string {
  return useContext(Ctx);
}

/**
 * Proxy ile `/restaurant` → içte `/anasayfa` yeniden yazıldığında `usePathname()` iç/dış URL ile
 * uyuşmayabiliyor; hydration takılması / yanlış href üretimini önlemek için önek sunucudan (`SitePrefixProvider`) gelir.
 */
export function usePrefixedPath(): (path: string) => string {
  const prefix = useSitePrefix();
  return useCallback((path: string) => withBaseFromPrefix(prefix, path), [prefix]);
}

/** fetch / Link için kısayol */
export function useWithBase(): (path: string) => string {
  return usePrefixedPath();
}

/**
 * menü `href` alanı iç rotadır (`/hizmetler`); canlıda vitrin öneki (`/kuafor`, `/restaurant`) ekler.
 * Harici URL’lere dokunmaz.
 */
export function usePrefixedNavHref(): (href: string) => string {
  const wb = useWithBase();
  return useCallback(
    (href: string) => {
      const h = (href ?? "").trim();
      if (!h || h === "#") return h;
      if (
        h.startsWith("http://") ||
        h.startsWith("https://") ||
        h.startsWith("//") ||
        h.startsWith("mailto:") ||
        h.startsWith("tel:")
      ) {
        return h;
      }
      return wb(h.startsWith("/") ? h : `/${h}`);
    },
    [wb]
  );
}
