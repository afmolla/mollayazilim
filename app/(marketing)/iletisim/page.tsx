import type { Metadata } from "next";
import { ayarlarGetir } from "@/lib/settings-store";
import { icerikGetir } from "@/lib/content-store";
import { IletisimInteractive } from "@/components/vf-inline/IletisimInteractive";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Adres, çalışma saatleri ve WhatsApp — demo iletişim bilgileri.",
};

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
