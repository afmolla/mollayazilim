/**
 * Yerelde `npm run dev`: tüm istekler Next’e (proxy `/` yapım + `/kuafor` rewrite).
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

function waitForNextReady() {
  const deadline = Date.now() + 120_000;
  return new Promise((resolve, reject) => {
    function tryOnce() {
      const req = http.request(
        {
          hostname: "127.0.0.1",
          port: NEXT_PORT,
          path: "/",
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
  proxy.web(req, res);
});

server.on("upgrade", (req, socket, head) => {
  proxy.ws(req, socket, head);
});

async function main() {
  console.log(`[dev-gateway] Next başlatılıyor :${NEXT_PORT} …`);
  await waitForNextReady();
  server.listen(GATEWAY_PORT, () => {
    console.log(`[dev-gateway] http://localhost:${GATEWAY_PORT}/  → yapım (proxy)`);
    console.log(`[dev-gateway] http://localhost:${GATEWAY_PORT}/kuafor  → vitrin`);
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
