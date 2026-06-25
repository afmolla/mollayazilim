import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siparisById } from "@/lib/siparis-store";
import { OrderConfirmClient } from "@/components/ambalaj/OrderConfirmClient";

export const metadata: Metadata = {
  title: "Sipariş onayı",
  robots: { index: false },
};

type Params = { params: Promise<{ id: string }> };

export default async function SiparisOnayPage({ params }: Params) {
  const { id } = await params;
  const siparis = await siparisById(id);
  if (!siparis || siparis.kaynak !== "web") notFound();

  return (
    <OrderConfirmClient
      siparisId={siparis.id}
      toplam={siparis.toplam}
      odemeMesaj="Ödeme entegrasyonu henüz aktif değil. Siparişiniz kaydedildi; satış ekibimiz sizinle iletişime geçecektir."
    />
  );
}
