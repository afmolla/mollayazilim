import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EsnekAmbalajFiyatHesapClient } from "@/components/ambalaj/EsnekAmbalajFiyatHesapClient";
import { aracilikGetir } from "@/lib/esnek-ambalaj-aracilik-store";
import { ayarlarGetir } from "@/lib/settings-store";
import { getRequestSite } from "@/lib/site-request";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Fiyat Hesaplama",
  description: "OPP, CPP, PET, LDPE torba ve rulo için online teklif tahmini — esnek ambalaj tedarik.",
};

export default async function FiyatHesaplamaPage() {
  const { subdir } = await getRequestSite();
  if (subdir !== "esnek-ambalaj") notFound();

  const [ayar, aracilik] = await Promise.all([ayarlarGetir(), aracilikGetir()]);
  return (
    <EsnekAmbalajFiyatHesapClient
      firmaAd={ayar.salonAd}
      whatsapp={ayar.iletisimWhatsapp ?? ayar.whatsapp}
      aracilik={aracilik}
    />
  );
}
