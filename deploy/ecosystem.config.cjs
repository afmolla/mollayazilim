const path = require("path");

/** PM2: Windows VPS — npm.cmd KULLANMA (pm2 start npm hata verir) */
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
        PORT: "3000",
      },
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      windowsHide: true,
    },
  ],
};
