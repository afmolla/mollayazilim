import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import { BASE_PATH } from "./lib/base-path";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  ...(BASE_PATH ? { basePath: BASE_PATH } : {}),
  /** Alt dizin deploy: kök `/` → vitrin köküne yönlendir (kök deploy’da gerekmez). */
  async redirects() {
    if (!BASE_PATH) return [];
    return [
      {
        source: "/",
        destination: BASE_PATH,
        permanent: false,
        basePath: false,
      },
    ];
  },
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
