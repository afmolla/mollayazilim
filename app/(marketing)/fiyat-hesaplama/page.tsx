import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EsnekAmbalajFiyatHesapClient } from "@/components/ambalaj/EsnekAmbalajFiyatHesapClient";
import { aracilikGetir } from "@/lib/esnek-ambalaj-aracilik-store";
import { icerikGetir } from "@/lib/content-store";
import { mergeFiyatHesap, VARSAYILAN_FIYAT_HESAP } from "@/lib/fiyat-hesap-defaults";
import { ayarlarGetir } from "@/lib/settings-store";
import { getRequestSite } from "@/lib/site-request";
import { isAmbalajSubdir } from "@/lib/site-config";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { subdir } = await getRequestSite();
  if (!isAmbalajSubdir(subdir)) return {};
  const [ayar, c] = await Promise.all([ayarlarGetir(), icerikGetir()]);
  const fh = mergeFiyatHesap(VARSAYILAN_FIYAT_HESAP, c.fiyatHesap);
  return {
    title: fh.seoTitle ?? "Fiyat Hesaplama",
    description: fh.seoDescription ?? ayar.seoDescription,
  };
}

export default async function FiyatHesaplamaPage() {
  const { subdir } = await getRequestSite();
  if (!isAmbalajSubdir(subdir)) notFound();

  const [ayar, aracilik, c] = await Promise.all([ayarlarGetir(), aracilikGetir(), icerikGetir()]);
  return (
    <EsnekAmbalajFiyatHesapClient
      firmaAd={ayar.salonAd}
      whatsapp={ayar.iletisimWhatsapp ?? ayar.whatsapp}
      aracilik={aracilik}
      fiyatHesap={c.fiyatHesap}
    />
  );
}
