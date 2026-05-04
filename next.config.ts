import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /** Rewrite + proxy birlikte bazı barındırıcılarda URL normalize yüzünden rota kayması */
  skipProxyUrlNormalize: true,
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
