import { runWithSiteContext, type SiteRequestContext } from "@/lib/site-context";
import { dataSubdirForPrefix, portfolioPrefixes } from "@/lib/site-config";
import { siteFromProxyHeaders } from "@/lib/site-proxy-headers";

/**
 * Panel / vitrin API: proxy `x-site-prefix` + `x-data-subdir` ile gelir.
 */
export async function withSiteFromRequest<T>(req: Request, fn: () => Promise<T>): Promise<T> {
  const rawPrefix = req.headers.get("x-site-prefix")?.trim() ?? "";
  const rawSubdir = req.headers.get("x-data-subdir")?.trim() ?? "";
  const molla = siteFromProxyHeaders(rawPrefix, rawSubdir);
  if (molla) {
    return runWithSiteContext({ prefix: molla.prefix, subdir: molla.subdir }, fn);
  }
  const prefix = rawPrefix;
  const subdir = rawSubdir;
  if (prefix && subdir) {
    const ctx: SiteRequestContext = { prefix, subdir };
    return runWithSiteContext(ctx, fn);
  }
  let urlPath = "";
  try {
    urlPath = new URL(req.url).pathname;
  } catch {
    urlPath = "";
  }
  for (const base of portfolioPrefixes()) {
    if (urlPath === base || urlPath === `${base}/` || urlPath.startsWith(`${base}/`)) {
      return runWithSiteContext({ prefix: base, subdir: dataSubdirForPrefix(base) }, fn);
    }
  }
  const ref = req.headers.get("referer") ?? "";
  let refPath = "";
  try {
    refPath = new URL(ref).pathname;
  } catch {
    refPath = "";
  }
  for (const base of portfolioPrefixes()) {
    if (refPath === base || refPath === `${base}/` || refPath.startsWith(`${base}/`)) {
      return runWithSiteContext({ prefix: base, subdir: dataSubdirForPrefix(base) }, fn);
    }
  }
  const first = portfolioPrefixes()[0];
  return runWithSiteContext(
    { prefix: first, subdir: dataSubdirForPrefix(first) },
    fn,
  );
}
