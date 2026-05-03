import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { yayinSayfalar } from "@/lib/pages-store";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const paths = ["/anasayfa", "/hizmetler", "/galeri", "/randevu", "/randevular", "/iletisim"];
  const cms = await yayinSayfalar();
  const cmsPaths = cms.filter((s) => s.seoIndex !== false).map((s) => `/p/${s.slug}`);
  return [...paths, ...cmsPaths].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: p === "/anasayfa" ? 1 : 0.7,
  }));
}
