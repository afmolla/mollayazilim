"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { withBase } from "@/lib/base-path";

const Ctx = createContext<string>("");

export function SitePrefixProvider(props: { prefix: string; children: ReactNode }) {
  const v = props.prefix?.trim() || "";
  const stable = useMemo(() => v, [v]);
  return <Ctx.Provider value={stable}>{props.children}</Ctx.Provider>;
}

export function useSitePrefix(): string {
  return useContext(Ctx);
}

/** İstemci: geçerli vitrin yolundan (`/restaurant/hizmetler`) önekli URL üretir. */
export function usePrefixedPath(): (path: string) => string {
  const pathname = usePathname() ?? "/";
  return useCallback((path: string) => withBase(path, pathname), [pathname]);
}

/** fetch / Link için kısayol */
export function useWithBase(): (path: string) => string {
  return usePrefixedPath();
}
