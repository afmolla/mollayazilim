import type { Metadata } from "next";
import { icerikGetir } from "@/lib/content-store";
import { HizmetlerInteractive } from "@/components/vf-inline/HizmetlerInteractive";

export const metadata: Metadata = {
  title: "Hizmetler ve fiyatlar",
  description:
    "Saç kesimi, sakal, boya, bakım ve paketler — şeffaf liste. Demo vitrin fiyatları.",
};

export const revalidate = 60;

export default async function HizmetlerPage() {
  const c = await icerikGetir();
  return <HizmetlerInteractive initial={c.hizmetler} />;
}
