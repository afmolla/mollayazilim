"use client";

import Link from "next/link";
import type { UrunKayit } from "@/lib/urun-types";
import { urunVaryantFiyat, formatTry, URUN_KATEGORILER } from "@/lib/urun-types";
import { normalizeAmbalajImageSrc, ESNEK_AMBALAJ_IMAGES } from "@/lib/esnek-ambalaj-images";
import { publicHref } from "@/lib/base-path";
import { VitrinImage } from "@/components/vitrin/VitrinImage";
import { useCart } from "@/components/ambalaj/CartProvider";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Props = {
  urun: UrunKayit;
};

export function ProductCard({ urun }: Props) {
  const pathname = usePathname() ?? "";
  const ph = (href: string) => publicHref(href, pathname);
  const cart = useCart();
  const [varyantId, setVaryantId] = useState(urun.varyantlar[0]?.id ?? "");
  const [added, setAdded] = useState(false);

  const varyant = urun.varyantlar.find((v) => v.id === varyantId) ?? urun.varyantlar[0];
  const fiyat = varyant ? urunVaryantFiyat(varyant) : 0;
  const indirim = varyant && varyant.indirimliFiyat && varyant.indirimliFiyat < varyant.fiyat;
  const kategori = URUN_KATEGORILER.find((k) => k.id === urun.kategoriId);

  function sepeteEkle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
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
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] transition hover:border-emerald-400/30 hover:bg-emerald-500/[0.04]">
      <Link href={ph(`/urun/${urun.slug}`)} className="relative block h-44 overflow-hidden">
        <VitrinImage
          src={normalizeAmbalajImageSrc(urun.imageSrc, ESNEK_AMBALAJ_IMAGES.doypack)}
          alt={urun.imageAlt ?? urun.baslik}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="320px"
        />
        {indirim ? (
          <span className="absolute left-3 top-3 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-amber-950">
            İndirim
          </span>
        ) : null}
        {urun.etiket ? (
          <span className="absolute right-3 top-3 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-200">
            {urun.etiket}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        {kategori ? (
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/70">{kategori.baslik}</p>
        ) : null}
        <Link href={ph(`/urun/${urun.slug}`)}>
          <h3 className="mt-1 text-sm font-bold leading-snug text-white hover:text-emerald-100">{urun.baslik}</h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-xs text-emerald-100/55">{urun.ozet}</p>
        {urun.minSiparis ? (
          <p className="mt-2 text-[11px] text-emerald-400/80">{urun.minSiparis}</p>
        ) : null}
        {urun.varyantlar.length > 1 ? (
          <select
            value={varyantId}
            onChange={(e) => setVaryantId(e.target.value)}
            className="mt-3 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-emerald-50"
            onClick={(e) => e.stopPropagation()}
          >
            {urun.varyantlar.map((v) => (
              <option key={v.id} value={v.id}>
                {v.etiket}
              </option>
            ))}
          </select>
        ) : varyant ? (
          <p className="mt-3 text-xs text-emerald-100/60">{varyant.etiket}</p>
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            {indirim && varyant ? (
              <p className="text-xs text-emerald-100/40 line-through">{formatTry(varyant.fiyat * varyant.miktar)}</p>
            ) : null}
            <p className="text-base font-bold text-emerald-300">
              {formatTry(fiyat * (varyant?.miktar ?? 1))}
              <span className="ml-1 text-[10px] font-normal text-emerald-100/50">+ KDV</span>
            </p>
          </div>
          <button
            type="button"
            onClick={sepeteEkle}
            className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-emerald-950 transition hover:bg-emerald-400"
          >
            {added ? "Eklendi ✓" : "Sepete ekle"}
          </button>
        </div>
      </div>
    </article>
  );
}
