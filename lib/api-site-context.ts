import { runWithSiteContext, type SiteRequestContext } from "@/lib/site-context";
import { dataSubdirForPrefix, portfolioPrefixes } from "@/lib/site-config";

/**
 * Panel / vitrin API: proxy `x-site-prefix` + `x-data-subdir` ile gelir.
 */
export async function withSiteFromRequest<T>(req: Request, fn: () => Promise<T>): Promise<T> {
  const prefix = req.headers.get("x-site-prefix")?.trim() ?? "";
  const subdir = req.headers.get("x-data-subdir")?.trim() ?? "";
  if (prefix && subdir) {
    const ctx: SiteRequestContext = { prefix, subdir };
    return runWithSiteContext(ctx, fn);
  }
  const ref = req.headers.get("referer") ?? "";
  let path = "";
  try {
    path = new URL(ref).pathname;
  } catch {
    path = "";
  }
  for (const base of portfolioPrefixes()) {
    if (path === base || path === `${base}/` || path.startsWith(`${base}/`)) {
      return runWithSiteContext({ prefix: base, subdir: dataSubdirForPrefix(base) }, fn);
    }
  }
  const first = portfolioPrefixes()[0];
  return runWithSiteContext(
    { prefix: first, subdir: dataSubdirForPrefix(first) },
    fn,
  );
}
