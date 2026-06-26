"use client";

import Link from "next/link";
import { usePrefixedNavHref } from "@/components/SitePrefixProvider";
import { formatTry } from "@/lib/urun-types";

type Props = {
  siparisId: string;
  toplam?: number;
  odemeMesaj?: string;
};

export function OrderConfirmClient({ siparisId, toplam, odemeMesaj }: Props) {
  const ph = usePrefixedNavHref();

  return (
    <div className="ambalaj-shop mx-auto max-w-2xl px-4 py-16 text-center text-emerald-50 md:px-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl">✓</div>
      <h1 className="mt-6 text-2xl font-extrabold text-white">Siparişiniz alındı</h1>
      <p className="mt-3 text-sm text-emerald-100/65">
        Sipariş numaranız: <strong className="text-emerald-300">{siparisId.slice(0, 8).toUpperCase()}</strong>
      </p>
      {typeof toplam === "number" ? (
        <p className="mt-2 text-lg font-bold text-emerald-300">{formatTry(toplam)}</p>
      ) : null}
      {odemeMesaj ? (
        <p className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100/90">
          {odemeMesaj}
        </p>
      ) : (
        <p className="mt-4 text-xs text-emerald-100/50">
          Ödeme entegrasyonu henüz aktif değil. Satış ekibimiz en kısa sürede sizinle iletişime geçecektir.
        </p>
      )}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href={ph("/urunler")}
          className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-emerald-950 hover:bg-emerald-400"
        >
          Mağazaya dön
        </Link>
        <Link
          href={ph("/iletisim")}
          className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5"
        >
          İletişim
        </Link>
      </div>
    </div>
  );
}
