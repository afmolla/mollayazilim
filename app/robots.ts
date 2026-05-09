import type { MetadataRoute } from "next";
import { normalizePublicSiteUrl, siteUrl } from "@/lib/site";
import { portfolioPrefixes, dataSubdirForPrefix } from "@/lib/site-config";
import { runWithSiteContext } from "@/lib/site-context";

function siteHost(): string {
  const raw = normalizePublicSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (raw) {
    try {
      return new URL(raw).host;
    } catch {
      /* ignore */
    }
  }
  return "localhost:3000";
}

async function resolveRootSitemapUrl(): Promise<string> {
  const env = normalizePublicSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (env) {
    return `${env.replace(/\/$/, "")}/sitemap.xml`;
  }
  let url = "";
  await runWithSiteContext({ prefix: "", subdir: "molla" }, async () => {
    const b = await siteUrl();
    url = `${b.replace(/\/$/, "")}/sitemap.xml`;
  });
  return url;
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const rules: MetadataRoute.Robots["rules"] = [];

  await runWithSiteContext({ prefix: "", subdir: "molla" }, async () => {
    rules.push({
      userAgent: "*",
      allow: "/",
      disallow: ["/panel", "/panel/", "/api/", "/_next/"],
    });
  });

  for (const prefix of portfolioPrefixes()) {
    const subdir = dataSubdirForPrefix(prefix);
    await runWithSiteContext({ prefix, subdir }, async () => {
      rules.push({
        userAgent: "*",
        allow: "/",
        disallow: [`${prefix}/panel`, `${prefix}/panel/`, "/api/", "/_next/"],
      });
    });
  }

  const sitemap = await resolveRootSitemapUrl();

  return {
    rules,
    ...(sitemap ? { sitemap } : {}),
    host: siteHost(),
  };
}
