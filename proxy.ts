import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { dataSubdirForPrefix, isPortfolioInternalRoute, isPortfolioPath } from "@/lib/site-config";
import { detectSiteFromRequestParts } from "@/lib/detect-request-site";
import { MOLLA_SITE_PREFIX_SENTINEL, VITRIN_URL_PATH_HEADER } from "@/lib/site-proxy-headers";

function internalRewriteUrl(req: NextRequest, pathname: string): URL {
  const u = req.nextUrl.clone();
  u.protocol = "http:";
  u.hostname = process.env.BIND_HOST?.trim() || "127.0.0.1";
  u.port = process.env.PORT?.trim() || "3000";
  u.pathname = pathname;
  u.search = "";
  return u;
}

function requestHeadersWithSite(req: NextRequest, prefix: string, subdir: string): Headers {
  const h = new Headers(req.headers);
  h.set("x-site-prefix", prefix);
  h.set("x-data-subdir", subdir);
  h.set(VITRIN_URL_PATH_HEADER, req.nextUrl.pathname);
  return h;
}

/** `/kuafor` → `/anasayfa` rewrite sonrası proxy tekrar çalışır; kiracı üst bilgisi varsa yönlendirme yapma. */
function isActivePortfolioRewrite(req: NextRequest): boolean {
  const prefix = req.headers.get("x-site-prefix")?.trim() ?? "";
  if (prefix && prefix !== MOLLA_SITE_PREFIX_SENTINEL) return true;
  const vitrinPath = req.headers.get(VITRIN_URL_PATH_HEADER)?.trim();
  return vitrinPath ? isPortfolioPath(vitrinPath) !== null : false;
}

/**
 * Vercel: Edge `middleware` → RSC arasında üst bilgi kaybı / 500 olabiliyor.
 * Next 16 `proxy` (Node) aynı mantık, sunucu render ile uyumlu.
 */
export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  /** Kök `/api/*` — portföy `/kuafor/api/*` rewrite ile gelir; burada Referer/çerez ile kiracı bağlamı eklenir. */
  if (pathname.startsWith("/api")) {
    const site = detectSiteFromRequestParts({
      referer: req.headers.get("referer"),
      cookie: req.headers.get("cookie"),
      pathname,
    });
    const reqHeaders = requestHeadersWithSite(req, site.prefix, site.subdir);
    return NextResponse.next({ request: { headers: reqHeaders } });
  }

  if (
    pathname.startsWith("/.well-known/acme-challenge/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/__nextjs") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  if (pathname === "/restaturant" || pathname === "/restaturant/") {
    const u = req.nextUrl.clone();
    u.pathname = "/restaurant";
    return NextResponse.redirect(u, 308);
  }
  if (pathname.startsWith("/restaturant/")) {
    const u = req.nextUrl.clone();
    u.pathname = "/restaurant" + pathname.slice("/restaturant".length);
    return NextResponse.redirect(u, 308);
  }
  if (pathname === "/esnek-ambalaj" || pathname === "/esnek-ambalaj/") {
    const u = req.nextUrl.clone();
    u.pathname = "/ambalaj";
    return NextResponse.redirect(u, 308);
  }
  if (pathname.startsWith("/esnek-ambalaj/")) {
    const u = req.nextUrl.clone();
    u.pathname = "/ambalaj" + pathname.slice("/esnek-ambalaj".length);
    return NextResponse.redirect(u, 308);
  }

  const matched = isPortfolioPath(pathname);
  if (!matched) {
    if (isPortfolioInternalRoute(pathname)) {
      if (!isActivePortfolioRewrite(req)) {
        const u = req.nextUrl.clone();
        u.pathname = "/";
        return NextResponse.redirect(u, 308);
      }
      return NextResponse.next();
    }
    const reqHeaders = requestHeadersWithSite(req, MOLLA_SITE_PREFIX_SENTINEL, "molla");
    return NextResponse.next({ request: { headers: reqHeaders } });
  }

  const subdir = dataSubdirForPrefix(matched);
  const rewrittenPath =
    pathname === matched || pathname === `${matched}/`
      ? "/anasayfa"
      : pathname.slice(matched.length) || "/";

  const reqHeaders = requestHeadersWithSite(req, matched, subdir);
  return NextResponse.rewrite(internalRewriteUrl(req, rewrittenPath), {
    request: { headers: reqHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|_next/webpack-hmr).*)"],
};
