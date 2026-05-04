import { cache } from "react";
import { headers } from "next/headers";
import { dataSubdirForPrefix, portfolioPrefixes } from "@/lib/site-config";
import { siteFromProxyHeaders } from "@/lib/site-proxy-headers";

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
    const fromProxy = siteFromProxyHeaders(prefix, subdir);
    if (fromProxy) return fromProxy;
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
