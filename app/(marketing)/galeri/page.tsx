import type { Metadata } from "next";
import { icerikGetir } from "@/lib/content-store";
import { ayarlarGetir } from "@/lib/settings-store";
import { GaleriInteractive } from "@/components/vf-inline/GaleriInteractive";

export async function generateMetadata(): Promise<Metadata> {
  const [c, ayar] = await Promise.all([icerikGetir(), ayarlarGetir()]);
  return {
    title: c.galeri.sayfaBaslik ?? "Galeri",
    description: c.galeri.sayfaAciklama?.slice(0, 160) ?? ayar.seoDescription,
  };
}

export const revalidate = 60;

export default async function GaleriPage() {
  const c = await icerikGetir();
  return <GaleriInteractive initial={c.galeri} />;
}
