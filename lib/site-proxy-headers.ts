/** Proxy boş string header bazen düşürülür; kök marka sitesi için dolu sentinel kullanılır. */
export const MOLLA_SITE_PREFIX_SENTINEL = "__molla__";

/** Middleware’in ilettiği tarayıcı URL yolu (rewrite iç rotadan önce). */
export const VITRIN_URL_PATH_HEADER = "x-vitrin-url-path";

export type SiteFromProxy = { prefix: string; subdir: string };

/** `proxy.ts` üst bilgilerinden vitrin bağlamı (kök Molla dahil). */
export function siteFromProxyHeaders(rawPrefix: string, rawSubdir: string): SiteFromProxy | null {
  const p = rawPrefix.trim();
  const s = rawSubdir.trim();
  if (p === MOLLA_SITE_PREFIX_SENTINEL || s === "molla") {
    return { prefix: "", subdir: "molla" };
  }
  return null;
}
