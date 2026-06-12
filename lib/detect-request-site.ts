import { dataSubdirForPrefix, isPortfolioPath, portfolioPrefixes } from "@/lib/site-config";
import { MOLLA_SITE_PREFIX_SENTINEL } from "@/lib/site-proxy-headers";

export type DetectedSite = { prefix: string; subdir: string };

/** URL yolundan vitrin kiracısı (proxy + API ortak). */
export function detectSiteFromPathname(pathname: string): DetectedSite {
  const p = (pathname ?? "").split("?")[0] || "/";
  const matched = isPortfolioPath(p);
  if (matched) {
    return { prefix: matched, subdir: dataSubdirForPrefix(matched) };
  }
  return { prefix: MOLLA_SITE_PREFIX_SENTINEL, subdir: "molla" };
}

function subdirToCookieName(subdir: string): string {
  const s = (subdir || "molla").trim().replace(/[^a-z0-9_-]/gi, "_") || "molla";
  return `panel_sess_${s}`;
}

/** Oturum çerezinden kiracı (Referer yoksa veya belirsizse). */
export function detectSiteFromCookies(cookieHeader: string): DetectedSite | null {
  const c = cookieHeader ?? "";
  if (!c.trim()) return null;

  for (const base of portfolioPrefixes()) {
    const subdir = dataSubdirForPrefix(base);
    const name = subdirToCookieName(subdir);
    if (new RegExp(`(?:^|;\\s*)${name}=`).test(c)) {
      return { prefix: base, subdir };
    }
  }

  const mollaName = subdirToCookieName("molla");
  if (new RegExp(`(?:^|;\\s*)${mollaName}=`).test(c) || /(?:^|;\s*)kuafor_panel=/.test(c)) {
    return { prefix: MOLLA_SITE_PREFIX_SENTINEL, subdir: "molla" };
  }

  return null;
}

/** Referer → yol → çerez sırasıyla kiracı tespiti. */
export function detectSiteFromRequestParts(parts: {
  referer?: string | null;
  cookie?: string | null;
  pathname?: string | null;
}): DetectedSite {
  const ref = parts.referer?.trim() ?? "";
  if (ref) {
    try {
      return detectSiteFromPathname(new URL(ref).pathname);
    } catch {
      /* ignore */
    }
  }

  const path = parts.pathname?.trim() ?? "";
  if (path.startsWith("/api")) {
    for (const base of portfolioPrefixes()) {
      if (path === `${base}/api` || path.startsWith(`${base}/api/`)) {
        return { prefix: base, subdir: dataSubdirForPrefix(base) };
      }
    }
  } else if (path) {
    const fromPath = detectSiteFromPathname(path);
    if (fromPath.subdir !== "molla" || path === "/" || path.startsWith("/panel")) {
      return fromPath;
    }
  }

  const fromCookie = detectSiteFromCookies(parts.cookie ?? "");
  if (fromCookie) return fromCookie;

  return { prefix: MOLLA_SITE_PREFIX_SENTINEL, subdir: "molla" };
}
