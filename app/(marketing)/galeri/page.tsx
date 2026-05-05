import type { Metadata } from "next";
import { icerikGetir } from "@/lib/content-store";
import { GaleriInteractive } from "@/components/vf-inline/GaleriInteractive";

export const metadata: Metadata = {
  title: "Galeri",
  description: "Salon atmosferi ve çalışma örnekleri — demo görseller.",
};

export const revalidate = 60;

export default async function GaleriPage() {
  const c = await icerikGetir();
  return <GaleriInteractive initial={c.galeri} />;
}
