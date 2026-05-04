/**
 * İstemci ve `siteUrl()` için isteğe bağlı URL öneki (ör. portföyde `/kuafor` göstermek).
 * Next.js `basePath` kullanılmaz; Vercel kök deploy her zaman `/` altında çalışır.
 *
 * Boş bırakın: `withBase("/panel")` → `/panel`
 * `NEXT_PUBLIC_BASE_PATH=/kuafor`: link ve fetch → `/kuafor/panel` (yerelde `npm run dev`
 * gateway bu öneki Next’e iletmeden önce kaldırır).
 */
function normalizeBasePath(raw: string | undefined): string {
  const v = (raw ?? "").trim();
  if (!v || v === "/") return "";
  const withLeading = v.startsWith("/") ? v : `/${v}`;
  return withLeading.replace(/\/+$/, "") || "";
}

export const BASE_PATH = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);

export function withBase(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!BASE_PATH) return p;
  return `${BASE_PATH}${p}`;
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
