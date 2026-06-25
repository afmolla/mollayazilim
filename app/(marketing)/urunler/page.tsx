import type { Metadata } from "next";
import { Suspense } from "react";
import { urunlerGetir, urunYayinda } from "@/lib/urun-store";
import { ayarlarGetir } from "@/lib/settings-store";
import { UrunlerPageClient } from "@/components/ambalaj/UrunlerPageClient";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const ayar = await ayarlarGetir();
  return {
    title: "Mağaza",
    description: `${ayar.salonAd} — esnek ambalaj ürün kataloğu. Doypack, quadro, flat bottom, torba ve rulo.`,
  };
}

export default async function UrunlerPage() {
  const list = urunYayinda(await urunlerGetir()).sort((a, b) => a.sira - b.sira);
  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-emerald-100/50">Yükleniyor…</div>}>
      <UrunlerPageClient urunler={list} />
    </Suspense>
  );
}
