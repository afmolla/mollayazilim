import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { dataSubdirForPrefix, isPortfolioPath } from "@/lib/site-config";
import { MOLLA_SITE_PREFIX_SENTINEL, VITRIN_URL_PATH_HEADER } from "@/lib/site-proxy-headers";

function requestHeadersWithSite(req: NextRequest, prefix: string, subdir: string): Headers {
  const h = new Headers(req.headers);
  h.set("x-site-prefix", prefix);
  h.set("x-data-subdir", subdir);
  h.set(VITRIN_URL_PATH_HEADER, req.nextUrl.pathname);
  return h;
}

/**
 * Vercel: Edge `middleware` → RSC arasında üst bilgi kaybı / 500 olabiliyor.
 * Next 16 `proxy` (Node) aynı mantık, sunucu render ile uyumlu.
 */
export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  /** Route Handler /api/* — üst bilgi enjekte etme; 404/edge-case riski sıfır */
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (
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

  const matched = isPortfolioPath(pathname);
  if (!matched) {
    const reqHeaders = requestHeadersWithSite(req, MOLLA_SITE_PREFIX_SENTINEL, "molla");
    return NextResponse.next({ request: { headers: reqHeaders } });
  }

  const subdir = dataSubdirForPrefix(matched);
  const u = req.nextUrl.clone();
  if (pathname === matched || pathname === `${matched}/`) {
    u.pathname = "/anasayfa";
  } else {
    u.pathname = pathname.slice(matched.length) || "/";
  }

  const reqHeaders = requestHeadersWithSite(req, matched, subdir);
  return NextResponse.rewrite(u, { request: { headers: reqHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|_next/webpack-hmr).*)"],
};
