import type { MetadataRoute } from "next";
import { BASE_PATH } from "@/lib/base-path";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [`${BASE_PATH}/panel`, `${BASE_PATH}/api/`],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: new URL(base).host,
  };
}
