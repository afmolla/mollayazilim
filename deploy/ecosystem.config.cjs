const path = require("path");

/** PM2: proje kokunden Next production (port 3000) */
const root = path.join(__dirname, "..");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

module.exports = {
  apps: [
    {
      name: "mollayazilim",
      cwd: root,
      script: nextBin,
      args: "start -p 3000",
      interpreter: "node",
      node_args: "--max-old-space-size=8192",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
