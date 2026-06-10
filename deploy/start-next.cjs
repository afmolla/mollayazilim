/**
 * PM2 / IIS icin Windows guvenli baslatici (npm.cmd kullanmaz).
 */
const path = require("path");
const { spawn } = require("child_process");

const root = path.join(__dirname, "..");
const nextCli = path.join(root, "node_modules", "next", "dist", "bin", "next");

const port = process.env.PORT || process.env.HTTP_PLATFORM_PORT || "80";
const host = process.env.BIND_HOST || "127.0.0.1";
const child = spawn(process.execPath, [nextCli, "start", "-H", host, "-p", String(port)], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "production", PORT: port },
});

child.on("exit", (code) => process.exit(code ?? 1));
