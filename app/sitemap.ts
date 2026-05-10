import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { portfolioPrefixes, dataSubdirForPrefix } from "@/lib/site-config";
import { runWithSiteContext } from "@/lib/site-context";
import { yayinSayfalar } from "@/lib/pages-store";
import { qrMenuGetir } from "@/lib/qr-menu-store";
import { ilanlarGetir, ilanYayinda } from "@/lib/ilan-store";

export const revalidate = 3600;

const STATIC_PATHS = [
  "/anasayfa",
  "/hizmetler",
  "/galeri",
  "/randevu",
  "/randevular",
  "/iletisim",
  "/qr-menu",
];

/** Ana ajans kökü (`/`) ve vitrin girişleri — portfolioPrefixes boş önek içermediği için ayrı eklenir */
async function pushMollaLandingAndDemos(out: MetadataRoute.Sitemap) {
  await runWithSiteContext({ prefix: "", subdir: "molla" }, async () => {
    const base = await siteUrl();
    const root = base.replace(/\/$/, "");
    out.push({
      url: `${root}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    });
    for (const path of ["/kuafor", "/kuafor-kadin", "/restaurant", "/emlak", "/avukat"]) {
      out.push({
        url: `${root}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.95,
      });
    }
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const out: MetadataRoute.Sitemap = [];
  await pushMollaLandingAndDemos(out);

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
          priority: p === "/anasayfa" ? 0.9 : 0.7,
        });
      }
      if (subdir === "emlak") {
        out.push({
          url: `${base}/ilanlar`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.85,
        });
        const ilanlar = ilanYayinda(await ilanlarGetir());
        for (const ilan of ilanlar) {
          out.push({
            url: `${base}/ilan/${ilan.id}`,
            lastModified: new Date(ilan.guncellenme),
            changeFrequency: "weekly",
            priority: 0.65,
          });
        }
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
