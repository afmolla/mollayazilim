import { stripSitePrefix } from "@/lib/base-path";
import type { MenuItem } from "@/lib/menu-store";

function pathAndQuery(pathname: string): { path: string; query: string } {
  const stripped = stripSitePrefix(pathname);
  const qIdx = stripped.indexOf("?");
  if (qIdx < 0) {
    const p = stripped.replace(/\/+$/, "") || "/";
    return { path: p, query: "" };
  }
  return {
    path: (stripped.slice(0, qIdx).replace(/\/+$/, "") || "/"),
    query: stripped.slice(qIdx + 1),
  };
}

/** Geçerli sayfa ile menü href eşleşmesi (hariç: newTab / harici URL) */
export function isNavActive(pathname: string, href: string, newTab?: boolean): boolean {
  if (newTab || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//")) {
    return false;
  }
  if (href === "#") return false;

  const cur = pathAndQuery(pathname);
  const target = pathAndQuery(href.startsWith("/") ? href : `/${href}`);

  if (target.path === "/") {
    return cur.path === "/" || cur.path === "/anasayfa";
  }
  if (target.path === "/anasayfa") {
    return cur.path === "/anasayfa" || cur.path === "/";
  }

  const pathMatch = cur.path === target.path || cur.path.startsWith(`${target.path}/`);
  if (!pathMatch) return false;
  if (target.query) {
    return cur.query === target.query;
  }
  return true;
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
