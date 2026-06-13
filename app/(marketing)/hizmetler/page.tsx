import type { Metadata } from "next";
import { icerikGetir } from "@/lib/content-store";
import { ayarlarGetir } from "@/lib/settings-store";
import { HizmetlerInteractive } from "@/components/vf-inline/HizmetlerInteractive";

export async function generateMetadata(): Promise<Metadata> {
  const [c, ayar] = await Promise.all([icerikGetir(), ayarlarGetir()]);
  return {
    title: c.hizmetler.sayfaBaslik ?? "Hizmetler",
    description: c.hizmetler.sayfaAciklama?.slice(0, 160) ?? ayar.seoDescription,
  };
}

export const revalidate = 60;

export default async function HizmetlerPage() {
  const c = await icerikGetir();
  return <HizmetlerInteractive initial={c.hizmetler} />;
}
