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

/** Oturum çerezinden kiracı — referer yolu ile eşleşen oturum tercih edilir. */
export function detectSiteFromCookies(cookieHeader: string, hintPath?: string): DetectedSite | null {
  const c = cookieHeader ?? "";
  if (!c.trim()) return null;

  const trySubdir = (subdir: string, prefix: string): DetectedSite | null => {
    const name = subdirToCookieName(subdir);
    if (new RegExp(`(?:^|;\\s*)${name}=`).test(c)) {
      return { prefix, subdir };
    }
    return null;
  };

  if (hintPath) {
    const fromHint = detectSiteFromPathname(hintPath);
    const matched = trySubdir(fromHint.subdir, fromHint.prefix);
    if (matched) return matched;
  }

  const molla = trySubdir("molla", MOLLA_SITE_PREFIX_SENTINEL);
  if (molla) return molla;

  for (const base of portfolioPrefixes()) {
    const subdir = dataSubdirForPrefix(base);
    const matched = trySubdir(subdir, base);
    if (matched) return matched;
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

  const fromCookie = detectSiteFromCookies(parts.cookie ?? "", ref ? (() => { try { return new URL(ref).pathname; } catch { return undefined; } })() : parts.pathname ?? undefined);
  if (fromCookie) return fromCookie;

  return { prefix: MOLLA_SITE_PREFIX_SENTINEL, subdir: "molla" };
}
