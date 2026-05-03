/**
 * Tek domainde portföy: bu proje `mollayazilim.com/kuafor/...` altında çalışır.
 * Başka vitrin (ör. /emlak) için ayrı build + ayrı BASE_PATH ile ikinci kopya deploy edilir.
 */
export const BASE_PATH = "/kuafor";

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
