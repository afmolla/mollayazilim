import type { Metadata } from "next";
import { icerikGetir } from "@/lib/content-store";
import { ayarlarGetir } from "@/lib/settings-store";
import {
  AnasayfaInteractive,
  type EmlakPreviewIlan,
} from "@/components/vf-inline/AnasayfaInteractive";
import { getRequestSite } from "@/lib/site-request";
import { isAmbalajSubdir } from "@/lib/site-config";
import { ilanlarGetir, ilanYayinda } from "@/lib/ilan-store";

export const revalidate = 60;

const kuaförMeta: Metadata = {
  title: "Ana Sayfa",
  description:
    "Atlas Kuaför Studio — kesim, sakal, boya ve bakım. Hızlı online randevu, profesyonel ekip.",
  openGraph: {
    title: "Atlas Kuaför Studio | Tekirdağ Kapaklı",
    description: "Modern kuaför ve berber deneyimi. Randevu alın, tarzınızı yenileyin.",
  },
};

const emlakMeta: Metadata = {
  title: "Ana Sayfa",
  description:
    "Satılık ve kiralık konut ilanları — kelime ve konuma göre arayın, vitrin üzerinden paylaşın.",
  openGraph: {
    title: "Emlak vitrin | İlanlar",
    description: "Filtrelenmiş ilan listesi, detay sayfaları ve hızlı iletişim.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const site = await getRequestSite();
  if (site.subdir === "emlak") return emlakMeta;
  if (isAmbalajSubdir(site.subdir)) {
    const [c, ayar] = await Promise.all([icerikGetir(), ayarlarGetir()]);
    return {
      title: c.home.baslik || ayar.seoTitle || "Ana Sayfa",
      description: c.home.aciklama?.slice(0, 160) ?? ayar.seoDescription,
    };
  }
  return kuaförMeta;
}

export default async function AnasayfaPage() {
  const [c, ayar] = await Promise.all([icerikGetir(), ayarlarGetir()]);
  const site = await getRequestSite();
  let emlakPreview: EmlakPreviewIlan[] | undefined;
  if (site.subdir === "emlak") {
    const all = await ilanlarGetir();
    emlakPreview = ilanYayinda(all)
      .sort((a, b) => new Date(b.guncellenme).getTime() - new Date(a.guncellenme).getTime())
      .slice(0, 4)
      .map((x) => ({
        id: x.id,
        baslik: x.baslik,
        il: x.il,
        ilce: x.ilce,
        tip: x.tip,
        fiyat: x.fiyat,
        kapakSrc: x.kapakSrc,
        oda: x.oda,
        metrekare: x.metrekare,
      }));
  }
  return (
    <AnasayfaInteractive initialHome={c.home} salonAd={ayar.salonAd} emlakPreview={emlakPreview} />
  );
}
