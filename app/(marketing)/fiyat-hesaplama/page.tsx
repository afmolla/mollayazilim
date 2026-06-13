import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EsnekAmbalajFiyatHesapClient } from "@/components/ambalaj/EsnekAmbalajFiyatHesapClient";
import { ayarlarGetir } from "@/lib/settings-store";
import { getRequestSite } from "@/lib/site-request";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Fiyat Hesaplama",
  description: "OPP, CPP, PET, LDPE torba ve rulo için tahmini fiyat hesaplama — esnek ambalaj demo.",
};

export default async function FiyatHesaplamaPage() {
  const { subdir } = await getRequestSite();
  if (subdir !== "esnek-ambalaj") notFound();

  const ayar = await ayarlarGetir();
  return (
    <EsnekAmbalajFiyatHesapClient
      firmaAd={ayar.salonAd}
      whatsapp={ayar.iletisimWhatsapp ?? ayar.whatsapp}
    />
  );
}
