/**
 * Alt dizinde vitrin (ör. `mollayazilim.com/kuafor/...`): `NEXT_PUBLIC_BASE_PATH=/kuafor`.
 * Vercel’de ayrı proje olarak kök domainde yayın: değişkeni boş bırakın veya vermeyin.
 */
function normalizeBasePath(raw: string | undefined): string {
  const v = (raw ?? "").trim();
  if (!v || v === "/") return "";
  const withLeading = v.startsWith("/") ? v : `/${v}`;
  return withLeading.replace(/\/+$/, "") || "";
}

export const BASE_PATH = normalizeBasePath(
  process.env.NEXT_PUBLIC_BASE_PATH ?? process.env.BASE_PATH,
);

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
