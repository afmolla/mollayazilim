"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import type { UrunKayit } from "@/lib/urun-types";
import { URUN_KATEGORILER } from "@/lib/urun-types";
import { publicHref } from "@/lib/base-path";
import { ProductCard } from "@/components/ambalaj/ProductCard";

type Props = {
  urunler: UrunKayit[];
};

export function UrunlerPageClient({ urunler }: Props) {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const ph = (href: string) => publicHref(href, pathname);
  const kategori = searchParams.get("kategori")?.trim() ?? "";

  useEffect(() => {
    if (kategori) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [kategori]);

  const filtered = kategori ? urunler.filter((u) => u.kategoriId === kategori) : urunler;

  return (
    <div className="ambalaj-shop bg-[#041008] text-emerald-50">
      <div className="border-b border-emerald-500/15 bg-gradient-to-r from-emerald-950/80 to-cyan-950/40 px-4 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-400/80">Mağaza</p>
          <h1 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">Esnek ambalaj ürünleri</h1>
          <p className="mt-3 max-w-2xl text-sm text-emerald-100/65">
            Doypack, quadro, flat bottom, torba ve rulo — kendi içeriklerimizle B2B sipariş. Sepete ekleyin, ödeme
            altyapısı hazır.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-wrap gap-2 border-b border-white/8 pb-6">
          <Link
            href={ph("/urunler")}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              !kategori
                ? "bg-emerald-500 text-emerald-950"
                : "border border-white/10 text-emerald-100/70 hover:border-emerald-400/30"
            }`}
          >
            Tümü
          </Link>
          {URUN_KATEGORILER.map((k) => (
            <Link
              key={k.id}
              href={ph(`/urunler?kategori=${k.id}`)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                kategori === k.id
                  ? "bg-emerald-500 text-emerald-950"
                  : "border border-white/10 text-emerald-100/70 hover:border-emerald-400/30"
              }`}
            >
              {k.baslik}
            </Link>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-emerald-100/50">Bu kategoride ürün bulunamadı.</p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((u) => (
              <ProductCard key={u.id} urun={u} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
