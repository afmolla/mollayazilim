/**
 * basePath=/kuafor varken Next kök "/" için route üretmez (middleware de çalışmaz).
 * Bu betik: 3000 = kök yapım + tüm trafiği 3001'deki `next dev`'e iletir.
 * Üretimde kök genelde IIS/static ile ayrılır; doğrudan `next start` ise yalnızca /kuafor kullanın.
 */
import http from "node:http";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const NEXT_PORT = Number(process.env.NEXT_DEV_PORT || 3001);
const GATEWAY_PORT = Number(process.env.PORT || 3000);

const YAPIM = `<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Yapım aşamasında</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;font-family:system-ui,sans-serif;background:#0b0b0e;color:#e4e4e7;display:flex;align-items:center;justify-content:center;padding:1.5rem}
.box{max-width:26rem;text-align:center;padding:2.5rem 1.75rem;border-radius:1rem;background:#18181b;border:1px solid rgba(255,255,255,.08)}
.tag{display:inline-block;font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#a78bfa;background:rgba(167,139,250,.12);padding:.4rem .75rem;border-radius:999px;margin-bottom:1.25rem}
h1{font-size:1.35rem;margin:0 0 .5rem}h1 span{color:#a78bfa}
p{margin:0;font-size:.95rem;color:#a1a1aa;line-height:1.55}
.nav{margin-top:1.75rem;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,.06);font-size:.85rem}
a{color:#a78bfa;text-decoration:none;font-weight:600}
.small{margin-top:.75rem;font-size:.75rem;color:#71717a}
</style></head><body>
<main class="box">
<div class="tag">Yapım aşamasında</div>
<h1><span>Site</span> hazırlanıyor</h1>
<p>Next <code>:${NEXT_PORT}</code> üzerinde çalışıyor. Vitrin ve panel:</p>
<nav class="nav">
<p><a href="/kuafor">/kuafor</a> — vitrin</p>
<p style="margin-top:.65rem"><a href="/kuafor/panel">/kuafor/panel</a> — panel</p>
</nav>
<p class="small">dev-gateway · port ${GATEWAY_PORT}</p>
</main></body></html>`;

function isRootPath(url) {
  const p = new URL(url, "http://local").pathname;
  return p === "/" || p === "";
}

const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextBin, "dev", "--webpack", "-p", String(NEXT_PORT)], {
  cwd: root,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end();
    return;
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    proxy(req, res);
    return;
  }
  if (isRootPath(req.url)) {
    if (req.method === "HEAD") {
      res.writeHead(200, { "Cache-Control": "no-store" });
      res.end();
      return;
    }
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(YAPIM);
    return;
  }
  proxy(req, res);
});

function proxy(req, res) {
  const u = new URL(req.url, `http://127.0.0.1:${GATEWAY_PORT}`);
  const opts = {
    hostname: "127.0.0.1",
    port: NEXT_PORT,
    path: u.pathname + u.search,
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${NEXT_PORT}` },
  };
  const p = http.request(opts, (upstream) => {
    res.writeHead(upstream.statusCode || 502, upstream.headers);
    upstream.pipe(res);
  });
  p.on("error", (err) => {
    res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`Next (${NEXT_PORT}) henüz ayakta değil veya hata: ${err.message}`);
  });
  req.pipe(p);
}

server.listen(GATEWAY_PORT, () => {
  console.log(`[dev-gateway] http://localhost:${GATEWAY_PORT}/  → yapım HTML`);
  console.log(`[dev-gateway] diğer istekler → next dev http://127.0.0.1:${NEXT_PORT}`);
});

function shutdown() {
  try {
    server.close();
  } catch {
    /* ignore */
  }
  child.kill("SIGTERM");
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
