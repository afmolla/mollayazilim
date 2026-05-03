import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Sadece site kökü — vitrin `/kuafor`, panel `/kuafor/panel` (basePath) */
const YAPIM_HTML = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex,nofollow"/>
<title>Yapım aşamasında</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;font-family:system-ui,"Segoe UI",Roboto,sans-serif;background:#0b0b0e;color:#e4e4e7;display:flex;align-items:center;justify-content:center;padding:1.5rem}
.box{max-width:26rem;text-align:center;padding:2.5rem 1.75rem;border-radius:1rem;background:#18181b;border:1px solid rgba(255,255,255,.08);box-shadow:0 20px 50px rgba(0,0,0,.45)}
.tag{display:inline-block;font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#a78bfa;background:rgba(167,139,250,.12);padding:.4rem .75rem;border-radius:999px;margin-bottom:1.25rem}
h1{font-size:1.35rem;font-weight:700;margin:0 0 .5rem;letter-spacing:-.02em}h1 span{color:#a78bfa}
p{margin:0;font-size:.95rem;color:#a1a1aa;line-height:1.55}
.nav{margin-top:1.75rem;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,.06);font-size:.85rem}
a{color:#a78bfa;text-decoration:none;font-weight:600}a:hover{text-decoration:underline}
.small{margin-top:.75rem;font-size:.75rem;color:#71717a}
</style>
</head>
<body>
<main class="box">
<div class="tag">Yapım aşamasında</div>
<h1><span>Site</span> hazırlanıyor</h1>
<p>Bu adres kök vitrin için ayrıldı. Kuaför uygulaması aşağıdaki yolda çalışır.</p>
<nav class="nav" aria-label="Uygulama">
<p><a href="/kuafor">Vitrine git → <code>/kuafor</code></a></p>
<p style="margin-top:.65rem"><a href="/kuafor/panel">Panele git → <code>/kuafor/panel</code></a></p>
</nav>
<p class="small">Next.js · yerel geliştirme</p>
</main>
</body>
</html>`;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname !== "/" && pathname !== "") {
    return NextResponse.next();
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }
  return new NextResponse(YAPIM_HTML, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export const config = {
  matcher: "/",
};
