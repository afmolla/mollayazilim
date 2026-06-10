const path = require("path");

/** IIS :80 -> Node 127.0.0.1:3000 (sadece ic ag, disariya acik degil) */
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
        BIND_HOST: "127.0.0.1",
      },
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      windowsHide: true,
    },
  ],
};
