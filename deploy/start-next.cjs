/**
 * PM2 / IIS icin Windows guvenli baslatici (npm.cmd kullanmaz).
 */
const path = require("path");
const { spawn } = require("child_process");

const root = path.join(__dirname, "..");
const nextCli = path.join(root, "node_modules", "next", "dist", "bin", "next");

const port = process.env.PORT || process.env.HTTP_PLATFORM_PORT || "3000";
const child = spawn(process.execPath, [nextCli, "start", "-H", "0.0.0.0", "-p", String(port)], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "production", PORT: port },
});

child.on("exit", (code) => process.exit(code ?? 1));
