const path = require("path");

/** UYARI: IIS kullaniyorsan ecosystem-iis.config.cjs (port 3000) kullan.
 *  Bu dosya port 80 — IIS ile CAKISIR, VPS'te localhost bozulur. */
const root = path.join(__dirname, "..");
const launcher = path.join(__dirname, "start-next.cjs");

module.exports = {
  apps: [
    {
      name: "mollayazilim",
      cwd: root,
      script: launcher,
      interpreter: "node",
      node_args: "--max-old-space-size=8192",
      env: {
        NODE_ENV: "production",
        PORT: "80",
        HOSTNAME: "0.0.0.0",
      },
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      windowsHide: true,
    },
  ],
};
