import type { Metadata } from "next";
import { ayarlarGetir } from "@/lib/settings-store";
import { icerikGetir } from "@/lib/content-store";
import { IletisimInteractive } from "@/components/vf-inline/IletisimInteractive";

export async function generateMetadata(): Promise<Metadata> {
  const [c, ayar] = await Promise.all([icerikGetir(), ayarlarGetir()]);
  return {
    title: c.iletisim.sayfaBaslik ?? "İletişim",
    description: c.iletisim.sayfaAciklama?.slice(0, 160) ?? ayar.seoDescription,
  };
}

export const revalidate = 60;

export default async function IletisimPage() {
  const [ayar, c] = await Promise.all([ayarlarGetir(), icerikGetir()]);
  return (
    <IletisimInteractive
      initial={c.iletisim}
      ayar={{
        whatsapp: ayar.whatsapp,
        adresDetay: ayar.adresDetay,
        calismaSaatleri: ayar.calismaSaatleri,
      }}
    />
  );
}
