import { stripBasePath } from "@/lib/base-path";
import type { MenuItem } from "@/lib/menu-store";

/** Geçerli sayfa ile menü href eşleşmesi (hariç: newTab / harici URL) */
export function isNavActive(pathname: string, href: string, newTab?: boolean): boolean {
  if (newTab || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//")) {
    return false;
  }
  if (href === "#") return false;
  const p = stripBasePath(pathname).replace(/\/+$/, "") || "/";
  const h = stripBasePath(href).replace(/\/+$/, "") || "/";

  if (h === "/") {
    return p === "/" || p === "/anasayfa";
  }
  if (h === "/anasayfa") {
    return p === "/anasayfa" || p === "/";
  }

  return p === h || p.startsWith(`${h}/`);
}

/** Üst veya herhangi bir alt menü yolu aktif mi */
export function menuItemActive(pathname: string, item: MenuItem): boolean {
  if (item.href && item.href !== "#") {
    if (isNavActive(pathname, item.href, item.newTab)) return true;
  }
  for (const c of item.children ?? []) {
    if (menuItemActive(pathname, c)) return true;
  }
  return false;
}
