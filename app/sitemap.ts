import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { portfolioPrefixes, dataSubdirForPrefix } from "@/lib/site-config";
import { runWithSiteContext } from "@/lib/site-context";
import { yayinSayfalar } from "@/lib/pages-store";
import { qrMenuGetir } from "@/lib/qr-menu-store";

export const dynamic = "force-dynamic";

const STATIC_PATHS = ["/anasayfa", "/hizmetler", "/galeri", "/randevu", "/randevular", "/iletisim", "/qr-menu"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const out: MetadataRoute.Sitemap = [];
  for (const prefix of portfolioPrefixes()) {
    const subdir = dataSubdirForPrefix(prefix);
    await runWithSiteContext({ prefix, subdir }, async () => {
      const base = await siteUrl();
      for (const p of STATIC_PATHS) {
        if (p === "/qr-menu") {
          const q = await qrMenuGetir();
          if (!q.yayin) continue;
        }
        out.push({
          url: `${base}${p}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: p === "/anasayfa" ? 1 : 0.7,
        });
      }
      const cms = await yayinSayfalar();
      for (const s of cms.filter((x) => x.seoIndex !== false)) {
        out.push({
          url: `${base}/p/${s.slug}`,
          lastModified: new Date(s.guncellenme),
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    });
  }
  return out;
}
