import { cache } from "react";
import { headers } from "next/headers";
import { dataSubdirForPrefix, isPortfolioPath } from "@/lib/site-config";
import { siteFromProxyHeaders, VITRIN_URL_PATH_HEADER } from "@/lib/site-proxy-headers";

export type SiteRequestInfo = { prefix: string; subdir: string };

/**
 * İstek başına bir kez: proxy `x-site-prefix` / `x-data-subdir` (build’de yok → ilk önek).
 * AsyncLocalStorage RSC alt ağacında taşınmadığı için `cache` + `headers` kullanılır.
 */
export const getRequestSite = cache(async (): Promise<SiteRequestInfo> => {
  try {
    const h = await headers();
    const incomingPath = h.get(VITRIN_URL_PATH_HEADER)?.trim();
    if (incomingPath) {
      const matched = isPortfolioPath(incomingPath);
      if (matched) {
        return { prefix: matched, subdir: dataSubdirForPrefix(matched) };
      }
      return { prefix: "", subdir: "molla" };
    }

    let prefix = h.get("x-site-prefix")?.trim() ?? "";
    let subdir = h.get("x-data-subdir")?.trim() ?? "";
    const fromProxy = siteFromProxyHeaders(prefix, subdir);
    if (fromProxy) return fromProxy;
    if (!prefix) {
      return { prefix: "", subdir: "molla" };
    }
    return { prefix, subdir };
  } catch {
    return { prefix: "", subdir: "molla" };
  }
});
