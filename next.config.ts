import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import { BASE_PATH } from "./lib/base-path";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  basePath: BASE_PATH,
  /** Üst klasörde başka lockfile varken Turbopack kökünü sabitle */
  turbopack: {
    root: configDir,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
