import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BASE_PATH } from "@/lib/base-path";

const YAPIM_HTML = `<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Yapım aşamasında</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;font-family:system-ui,sans-serif;background:#0b0b0e;color:#e4e4e7;display:flex;align-items:center;justify-content:center;padding:1.5rem}
.box{max-width:26rem;text-align:center;padding:2.5rem 1.75rem;border-radius:1rem;background:#18181b;border:1px solid rgba(255,255,255,.08)}
.tag{display:inline-block;font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#a78bfa;background:rgba(167,139,250,.12);padding:.4rem .75rem;border-radius:999px;margin-bottom:1.25rem}
h1{font-size:1.35rem;margin:0}h1 span{color:#a78bfa}
</style></head><body>
<main class="box">
<div class="tag">Yapım aşamasında</div>
<h1><span>Site</span> hazırlanıyor</h1>
</main></body></html>`;

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (!BASE_PATH) {
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

  if (pathname === "/" || pathname === "") {
    return new NextResponse(YAPIM_HTML, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const base = BASE_PATH;
  if (pathname === base || pathname === `${base}/`) {
    const u = req.nextUrl.clone();
    u.pathname = "/";
    return NextResponse.rewrite(u);
  }

  if (pathname.startsWith(`${base}/`)) {
    const u = req.nextUrl.clone();
    u.pathname = pathname.slice(base.length) || "/";
    return NextResponse.rewrite(u);
  }

  return new NextResponse("Not Found", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|_next/webpack-hmr).*)"],
};
