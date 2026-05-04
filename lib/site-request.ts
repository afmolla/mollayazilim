import { cache } from "react";
import { headers } from "next/headers";
import { dataSubdirForPrefix, portfolioPrefixes } from "@/lib/site-config";

export type SiteRequestInfo = { prefix: string; subdir: string };

/**
 * İstek başına bir kez: proxy `x-site-prefix` / `x-data-subdir` (build’de yok → ilk önek).
 * AsyncLocalStorage RSC alt ağacında taşınmadığı için `cache` + `headers` kullanılır.
 */
export const getRequestSite = cache(async (): Promise<SiteRequestInfo> => {
  try {
    const h = await headers();
    let prefix = h.get("x-site-prefix")?.trim() ?? "";
    let subdir = h.get("x-data-subdir")?.trim() ?? "";
    /** Kök marka sitesi: `proxy.ts` boş prefix + `molla` subdir gönderir — bunu kuafor’a çevirme. */
    if (subdir === "molla" && !prefix) {
      return { prefix: "", subdir: "molla" };
    }
    if (!prefix) {
      const first = portfolioPrefixes()[0];
      prefix = first;
      subdir = dataSubdirForPrefix(first);
    }
    return { prefix, subdir };
  } catch {
    const first = portfolioPrefixes()[0];
    return { prefix: first, subdir: dataSubdirForPrefix(first) };
  }
});
