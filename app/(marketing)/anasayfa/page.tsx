import type { Metadata } from "next";
import { icerikGetir } from "@/lib/content-store";
import { ayarlarGetir } from "@/lib/settings-store";
import { AnasayfaInteractive } from "@/components/vf-inline/AnasayfaInteractive";

export const metadata: Metadata = {
  title: "Ana Sayfa",
  description:
    "Atlas Kuaför Studio — kesim, sakal, boya ve bakım. Hızlı online randevu, profesyonel ekip.",
  openGraph: {
    title: "Atlas Kuaför Studio | İstanbul",
    description: "Modern kuaför ve berber deneyimi. Randevu alın, tarzınızı yenileyin.",
  },
};

export const revalidate = 60;

export default async function AnasayfaPage() {
  const [c, ayar] = await Promise.all([icerikGetir(), ayarlarGetir()]);
  return <AnasayfaInteractive initialHome={c.home} salonAd={ayar.salonAd} />;
}
