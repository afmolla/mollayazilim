import { portfolioPrefixes } from "@/lib/site-config";

/** Tam URL yolundan (`/restaurant/hizmetler`) portföy önekini çıkarır. Kök `/panel` vb. için "". */
export function inferPrefixFromPathname(pathname: string): string {
  const p = (pathname ?? "").split("?")[0] || "/";
  for (const base of portfolioPrefixes()) {
    if (p === base || p === `${base}/` || p.startsWith(`${base}/`)) {
      return base;
    }
  }
  return "";
}

/** href içindeki yol, sorgu ve hash parçalarını ayırır */
function splitHrefParts(href: string): { path: string; suffix: string } {
  const h = href.trim();
  const q = h.indexOf("?");
  const hash = h.indexOf("#");
  let pathEnd = h.length;
  if (q >= 0) pathEnd = Math.min(pathEnd, q);
  if (hash >= 0) pathEnd = Math.min(pathEnd, hash);
  const path = h.slice(0, pathEnd) || "/";
  const suffix = h.slice(pathEnd);
  return { path, suffix };
}

/** Bilinen portföy öneklerini kaldırır; iç route (`/hizmetler`) döner. Sorgu/hash korunmaz. */
export function stripSitePrefix(path: string): string {
  const { path: rawPath } = splitHrefParts(path ?? "");
  const withSlash = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  for (const base of portfolioPrefixes()) {
    if (withSlash === base || withSlash === `${base}/`) return "/";
    if (withSlash.startsWith(`${base}/`)) {
      return withSlash.slice(base.length) || "/";
    }
  }
  return withSlash;
}

export function getBasePathFromPathname(pathname: string | null | undefined): string {
  if (pathname) return inferPrefixFromPathname(pathname);
  if (typeof window !== "undefined") {
    return inferPrefixFromPathname(window.location.pathname);
  }
  return "";
}

export function withBaseFromPrefix(prefix: string, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!prefix) return p;
  return `${prefix}${p}`;
}

export function withBase(path: string, pathname?: string | null): string {
  return withBaseFromPrefix(getBasePathFromPathname(pathname ?? null), path);
}

export function publicHref(href: string, pathname?: string | null): string {
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
  const { path, suffix } = splitHrefParts(h);
  const base = getBasePathFromPathname(pathname ?? null);
  const pathNorm = path.startsWith("/") ? path : `/${path}`;
  const internal = stripSitePrefix(pathNorm);
  if (!base) return `${internal}${suffix}`;
  const already = pathNorm === base || pathNorm.startsWith(`${base}/`);
  if (already) return `${pathNorm.startsWith("/") ? pathNorm : `/${pathNorm}`}${suffix}`;
  return `${withBaseFromPrefix(base, internal)}${suffix}`;
}

/** @deprecated stripSitePrefix kullanın; uyumluluk için pathname ile aynı. */
export function stripBasePath(pathname: string): string {
  return stripSitePrefix(pathname);
}
