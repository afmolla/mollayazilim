import { getSiteContext } from "@/lib/site-context";

function normalizeBasePath(raw: string | undefined): string {
  const v = (raw ?? "").trim();
  if (!v || v === "/") return "";
  const withLeading = v.startsWith("/") ? v : `/${v}`;
  return withLeading.replace(/\/+$/, "") || "";
}

/**
 * İstek içi: middleware + root layout `runWithSiteContext` ile set edilir.
 * Build / istemci: `NEXT_PUBLIC_BASE_PATH` (tanımsız → `/kuafor`).
 */
function resolvedBasePath(): string {
  const ctx = getSiteContext();
  if (ctx?.prefix) return ctx.prefix;
  const raw = process.env.NEXT_PUBLIC_BASE_PATH;
  if (raw === undefined) return normalizeBasePath("/kuafor");
  return normalizeBasePath(raw);
}

export function getBasePath(): string {
  return resolvedBasePath();
}

/** Geriye dönük: modül yüklemede sabit değil; dinamik kullanımda `getBasePath()` tercih edin */
export const BASE_PATH = "";

export function withBase(path: string): string {
  const base = getBasePath();
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!base) return p;
  return `${base}${p}`;
}

/**
 * Menü / CMS’te saklı iç yollar (`/hizmetler`) → tarayıcıda `{base}/hizmetler`.
 */
export function publicHref(href: string): string {
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
  const base = getBasePath();
  if (!base) return h.startsWith("/") ? h : `/${h}`;
  if (h === base || h.startsWith(`${base}/`)) return h;
  return withBase(h);
}

export function stripBasePath(pathname: string): string {
  const base = getBasePath();
  if (!base) return pathname || "/";
  if (pathname === base || pathname === `${base}/`) {
    return "/";
  }
  if (pathname.startsWith(`${base}/`)) {
    return pathname.slice(base.length) || "/";
  }
  return pathname || "/";
}
