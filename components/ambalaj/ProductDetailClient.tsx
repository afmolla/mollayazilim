"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import type { UrunKayit } from "@/lib/urun-types";
import { urunVaryantFiyat, formatTry, URUN_KATEGORILER } from "@/lib/urun-types";
import { normalizeAmbalajImageSrc, ESNEK_AMBALAJ_IMAGES } from "@/lib/esnek-ambalaj-images";
import { publicHref } from "@/lib/base-path";
import { VitrinImage } from "@/components/vitrin/VitrinImage";
import { useCart } from "@/components/ambalaj/CartProvider";

type Props = {
  urun: UrunKayit;
};

export function ProductDetailClient({ urun }: Props) {
  const pathname = usePathname() ?? "";
  const ph = (href: string) => publicHref(href, pathname);
  const cart = useCart();
  const [varyantId, setVaryantId] = useState(urun.varyantlar[0]?.id ?? "");
  const [added, setAdded] = useState(false);

  const varyant = urun.varyantlar.find((v) => v.id === varyantId) ?? urun.varyantlar[0];
  const fiyat = varyant ? urunVaryantFiyat(varyant) : 0;
  const indirim = varyant && varyant.indirimliFiyat && varyant.indirimliFiyat < varyant.fiyat;
  const kategori = URUN_KATEGORILER.find((k) => k.id === urun.kategoriId);

  function sepeteEkle() {
    if (!varyant) return;
    cart.addItem({
      urunId: urun.id,
      varyantId: varyant.id,
      slug: urun.slug,
      baslik: urun.baslik,
      varyantEtiket: varyant.etiket,
      birimFiyat: urunVaryantFiyat(varyant),
      miktar: varyant.miktar,
      birim: varyant.birim,
      imageSrc: urun.imageSrc,
    });
    setAdded(true);
  }

  return (
    <div className="ambalaj-shop mx-auto max-w-7xl px-4 py-8 text-emerald-50 md:px-8">
      <nav className="mb-6 text-xs text-emerald-100/50">
        <Link href={ph("/urunler")} className="hover:text-emerald-300">
          Mağaza
        </Link>
        {kategori ? (
          <>
            {" / "}
            <Link href={ph(`/urunler?kategori=${kategori.id}`)} className="hover:text-emerald-300">
              {kategori.baslik}
            </Link>
          </>
        ) : null}
        <span className="text-emerald-100/70"> / {urun.baslik}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-emerald-500/15 bg-emerald-950/30">
          <VitrinImage
            src={normalizeAmbalajImageSrc(urun.imageSrc, ESNEK_AMBALAJ_IMAGES.doypack)}
            alt={urun.imageAlt ?? urun.baslik}
            fill
            className="object-cover"
            sizes="600px"
            priority
          />
        </div>

        <div>
          {urun.etiket ? (
            <span className="inline-block rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-300">
              {urun.etiket}
            </span>
          ) : null}
          <h1 className="mt-2 text-2xl font-extrabold text-white md:text-3xl">{urun.baslik}</h1>
          <p className="mt-3 text-sm leading-relaxed text-emerald-100/70">{urun.ozet}</p>
          {urun.aciklama ? (
            <p className="mt-4 text-sm leading-relaxed text-emerald-100/55">{urun.aciklama}</p>
          ) : null}
          {urun.minSiparis ? (
            <p className="mt-4 text-xs font-medium text-emerald-400">{urun.minSiparis}</p>
          ) : null}

          <div className="mt-8 space-y-4 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
            <label className="block text-xs font-semibold uppercase tracking-wide text-emerald-400/80">
              Paket / miktar seçin
            </label>
            <div className="flex flex-wrap gap-2">
              {urun.varyantlar.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVaryantId(v.id)}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                    v.id === varyantId
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-100"
                      : "border-white/10 text-emerald-100/70 hover:border-emerald-400/30"
                  }`}
                >
                  {v.etiket}
                </button>
              ))}
            </div>

            {varyant ? (
              <div className="pt-2">
                {indirim ? (
                  <p className="text-sm text-emerald-100/40 line-through">
                    {formatTry(varyant.fiyat * varyant.miktar)}
                  </p>
                ) : null}
                <p className="text-2xl font-bold text-emerald-300">
                  {formatTry(fiyat * varyant.miktar)}
                  <span className="ml-2 text-sm font-normal text-emerald-100/50">+ KDV</span>
                </p>
                <p className="mt-1 text-xs text-emerald-100/45">
                  Birim: {formatTry(fiyat)} / {varyant.birim === "kg" ? "kg" : "adet"}
                </p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={sepeteEkle}
                className="rounded-xl bg-emerald-500 px-8 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400"
              >
                {added ? "Sepete eklendi ✓" : "Sepete ekle"}
              </button>
              {added ? (
                <Link
                  href={ph("/sepet")}
                  className="rounded-xl border border-emerald-400/30 px-6 py-3 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/10"
                >
                  Sepete git →
                </Link>
              ) : null}
            </div>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-emerald-100/40">
            Kesin fiyat numune ve baskı onayı sonrası netleşir. Özel ölçü için{" "}
            <Link href={ph("/randevu")} className="text-emerald-400 underline">
              teklif formu
            </Link>{" "}
            veya{" "}
            <Link href={ph("/fiyat-hesaplama")} className="text-emerald-400 underline">
              fiyat hesaplayıcı
            </Link>{" "}
            kullanın.
          </p>
        </div>
      </div>
    </div>
  );
}
