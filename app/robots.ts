import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { portfolioPrefixes, dataSubdirForPrefix } from "@/lib/site-config";
import { runWithSiteContext } from "@/lib/site-context";

function siteHost(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  if (raw) {
    try {
      return new URL(raw).host;
    } catch {
      /* ignore */
    }
  }
  return "localhost:3000";
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const rules: MetadataRoute.Robots["rules"] = [];
  const sitemaps: string[] = [];

  for (const prefix of portfolioPrefixes()) {
    const subdir = dataSubdirForPrefix(prefix);
    await runWithSiteContext({ prefix, subdir }, async () => {
      const base = await siteUrl();
      sitemaps.push(`${base}/sitemap.xml`);
      rules.push({
        userAgent: "*",
        allow: "/",
        disallow: [`${prefix}/panel`, `${prefix}/api/`],
      });
    });
  }

  return {
    rules,
    sitemap: sitemaps.length === 1 ? sitemaps[0] : sitemaps,
    host: siteHost(),
  };
}
