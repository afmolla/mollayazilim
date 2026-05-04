/**
 * Portföy kökü: `https://alan.com/` yapım, `https://alan.com/kuafor` vitrin.
 * Varsayılan önek **`/kuafor`**. Sadece kökte tek site: Vercel’de `NEXT_PUBLIC_BASE_PATH=`
 * (boş) veya `.env` içinde boş bırakıp `NEXT_PUBLIC_BASE_PATH=` kullanın.
 */
function normalizeBasePath(raw: string | undefined): string {
  const v = (raw ?? "").trim();
  if (!v || v === "/") return "";
  const withLeading = v.startsWith("/") ? v : `/${v}`;
  return withLeading.replace(/\/+$/, "") || "";
}

function resolvedBasePath(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_PATH;
  if (raw === undefined) return normalizeBasePath("/kuafor");
  return normalizeBasePath(raw);
}

export const BASE_PATH = resolvedBasePath();

export function withBase(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!BASE_PATH) return p;
  return `${BASE_PATH}${p}`;
}

/**
 * Menü / CMS’te saklı iç yollar (`/hizmetler`) → tarayıcıda `/kuafor/hizmetler`.
 * Harici URL, `mailto:`, `tel:`, `#` dokunulmaz; zaten önekli yol çiftlenmez.
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
  if (!BASE_PATH) return h.startsWith("/") ? h : `/${h}`;
  if (h === BASE_PATH || h.startsWith(`${BASE_PATH}/`)) return h;
  return withBase(h);
}

export function stripBasePath(pathname: string): string {
  if (!BASE_PATH) return pathname || "/";
  if (pathname === BASE_PATH || pathname === `${BASE_PATH}/`) {
    return "/";
  }
  if (pathname.startsWith(`${BASE_PATH}/`)) {
    return pathname.slice(BASE_PATH.length) || "/";
  }
  return pathname || "/";
}
