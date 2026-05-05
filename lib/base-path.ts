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

/** Bilinen portföy öneklerini kaldırır; iç route (`/hizmetler`) döner. */
export function stripSitePrefix(path: string): string {
  const raw = (path ?? "").split("?")[0] || "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
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
  const base = getBasePathFromPathname(pathname ?? null);
  const internal = stripSitePrefix(h.startsWith("/") ? h : `/${h}`);
  if (!base) return internal;
  const already = h === base || h.startsWith(`${base}/`);
  if (already) return h.startsWith("/") ? h : `/${h}`;
  return withBaseFromPrefix(base, internal);
}

/** @deprecated stripSitePrefix kullanın; uyumluluk için pathname ile aynı. */
export function stripBasePath(pathname: string): string {
  return stripSitePrefix(pathname);
}
