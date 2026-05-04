/**
 * Yerelde isteğe bağlı URL öneki (`NEXT_PUBLIC_BASE_PATH`, örn. `/kuafor`):
 * önekli istekleri Next’e önek olmadan iletir (Next.js `basePath` yok).
 *
 * Önek doluysa: kök `/` = yapım HTML; `/{prefix}/*` → Next (3001).
 * Önek boşsa: tüm istekler doğrudan Next’e (localhost’ta vitrin = kök `/`).
 */
import http from "node:http";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const httpProxy = require("http-proxy");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const NEXT_PORT = Number(process.env.NEXT_DEV_PORT || 3001);
const GATEWAY_PORT = Number(process.env.PORT || 3000);

function normalizeBasePath(raw) {
  const v = String(raw ?? "").trim();
  if (!v || v === "/") return "";
  const withLeading = v.startsWith("/") ? v : `/${v}`;
  return withLeading.replace(/\/+$/, "") || "";
}

const BASE_PATH = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);
const SUBPATH_VITRIN = Boolean(BASE_PATH);
const NEXT_HEALTH_PATH = "/";

const YAPIM = `<!DOCTYPE html>
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

function isRootPath(url) {
  const p = new URL(url, "http://local").pathname;
  return p === "/" || p === "";
}

/** Next `basePath` olmadan üretilen mutlak `/_next/...` istekleri (HMR dahil). */
function isNextRootAsset(pathname) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/__nextjs") ||
    pathname === "/favicon.ico"
  );
}

/** @type {{ raw: string, nextPath: string } | null} */
function mapIncomingToNext(rawUrl) {
  if (!rawUrl) return null;
  const u = new URL(rawUrl, "http://local");
  let pathname = u.pathname;
  const search = u.search;
  if (!BASE_PATH) {
    return { raw: pathname + search, nextPath: pathname + search };
  }
  if (pathname === BASE_PATH || pathname === `${BASE_PATH}/`) {
    return { raw: pathname + search, nextPath: "/" + search };
  }
  if (pathname.startsWith(`${BASE_PATH}/`)) {
    const rest = pathname.slice(BASE_PATH.length) || "/";
    return { raw: pathname + search, nextPath: rest + search };
  }
  return null;
}

function waitForNextReady() {
  const deadline = Date.now() + 120_000;
  return new Promise((resolve, reject) => {
    function tryOnce() {
      const req = http.request(
        {
          hostname: "127.0.0.1",
          port: NEXT_PORT,
          path: NEXT_HEALTH_PATH,
          method: "GET",
          timeout: 3000,
        },
        (res) => {
          res.resume();
          resolve();
        }
      );
      req.on("timeout", () => {
        req.destroy();
        schedule();
      });
      req.on("error", () => {
        if (Date.now() > deadline) {
          reject(new Error(`Next :${NEXT_PORT} 120 sn içinde ayaklanmadı (npm run dev çıktısına bak).`));
        } else schedule();
      });
      function schedule() {
        setTimeout(tryOnce, 500);
      }
      req.end();
    }
    tryOnce();
  });
}

const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextBin, "dev", "--webpack", "-p", String(NEXT_PORT)], {
  cwd: root,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));

const target = `http://127.0.0.1:${NEXT_PORT}`;
const proxy = httpProxy.createProxyServer({
  target,
  ws: true,
  xfwd: true,
  changeOrigin: true,
});

proxy.on("error", (err, req, res) => {
  console.error("[dev-gateway] proxy:", err.message);
  if (res && !res.headersSent && typeof res.writeHead === "function") {
    res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`Proxy hatası: ${err.message}`);
  }
});

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end();
    return;
  }
  if (
    SUBPATH_VITRIN &&
    (req.method === "GET" || req.method === "HEAD") &&
    isRootPath(req.url)
  ) {
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
  const mapped = mapIncomingToNext(req.url);
  if (BASE_PATH && !mapped) {
    const pathname = new URL(req.url, "http://local").pathname;
    if (!isNextRootAsset(pathname)) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    proxy.web(req, res);
    return;
  }
  const nextPath = mapped ? mapped.nextPath : req.url;
  req.url = nextPath;
  proxy.web(req, res);
});

server.on("upgrade", (req, socket, head) => {
  if (!req.url) {
    socket.destroy();
    return;
  }
  const mapped = mapIncomingToNext(req.url);
  if (BASE_PATH && !mapped) {
    const pathname = new URL(req.url, "http://local").pathname;
    if (!isNextRootAsset(pathname)) {
      socket.destroy();
      return;
    }
    proxy.ws(req, socket, head);
    return;
  }
  if (mapped) {
    req.url = mapped.nextPath;
  }
  proxy.ws(req, socket, head);
});

async function main() {
  console.log(`[dev-gateway] Next başlatılıyor :${NEXT_PORT} …`);
  await waitForNextReady();
  server.listen(GATEWAY_PORT, () => {
    if (SUBPATH_VITRIN) {
      console.log(`[dev-gateway] http://localhost:${GATEWAY_PORT}/  → yapım`);
      console.log(
        `[dev-gateway] http://localhost:${GATEWAY_PORT}${BASE_PATH}  → next (HMR/WebSocket ile)`,
      );
    } else {
      console.log(
        `[dev-gateway] http://localhost:${GATEWAY_PORT}/  → next (NEXT_PUBLIC_BASE_PATH yok)`,
      );
    }
  });
}

main().catch((e) => {
  console.error(e);
  try {
    child.kill("SIGTERM");
  } catch {
    /* ignore */
  }
  process.exit(1);
});

function shutdown() {
  try {
    server.close();
  } catch {
    /* ignore */
  }
  if (typeof proxy.close === "function") proxy.close();
  try {
    child.kill("SIGTERM");
  } catch {
    /* ignore */
  }
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
