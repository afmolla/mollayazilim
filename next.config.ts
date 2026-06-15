import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  poweredByHeader: false,
  /** Rewrite + proxy birlikte bazı barındırıcılarda URL normalize yüzünden rota kayması */
  skipProxyUrlNormalize: true,
  /** @/ alias — proxy.ts ve webpack icin tsconfig paths yedegi */
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string> | undefined),
      "@": configDir,
    };
    return config;
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
