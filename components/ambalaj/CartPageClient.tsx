"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/ambalaj/CartProvider";
import { cartLineTotal, cartKdv } from "@/lib/cart-types";
import { formatTry } from "@/lib/urun-types";
import { publicHref } from "@/lib/base-path";
import { normalizeAmbalajImageSrc, ESNEK_AMBALAJ_IMAGES } from "@/lib/esnek-ambalaj-images";
import { VitrinImage } from "@/components/vitrin/VitrinImage";

export function CartPageClient() {
  const pathname = usePathname() ?? "";
  const ph = (href: string) => publicHref(href, pathname);
  const cart = useCart();
  const kdv = cartKdv(cart.subtotal);

  if (cart.items.length === 0) {
    return (
      <div className="ambalaj-shop mx-auto max-w-3xl px-4 py-16 text-center text-emerald-50 md:px-8">
        <h1 className="text-2xl font-bold text-white">Sepetiniz boş</h1>
        <p className="mt-3 text-sm text-emerald-100/60">Esnek ambalaj ürünlerini keşfedin ve sepete ekleyin.</p>
        <Link
          href={ph("/urunler")}
          className="mt-8 inline-block rounded-xl bg-emerald-500 px-8 py-3 text-sm font-bold text-emerald-950 hover:bg-emerald-400"
        >
          Mağazaya git
        </Link>
      </div>
    );
  }

  return (
    <div className="ambalaj-shop mx-auto max-w-5xl px-4 py-8 text-emerald-50 md:px-8">
      <h1 className="text-2xl font-extrabold text-white md:text-3xl">Sepetim</h1>
      <p className="mt-2 text-sm text-emerald-100/60">{cart.items.length} kalem · Fiyatlar KDV hariç gösterilir</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-4">
          {cart.items.map((item) => (
            <li
              key={`${item.urunId}:${item.varyantId}`}
              className="flex gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/6">
                <VitrinImage
                  src={normalizeAmbalajImageSrc(item.imageSrc ?? "", ESNEK_AMBALAJ_IMAGES.doypack)}
                  alt={item.baslik}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={ph(`/urun/${item.slug}`)} className="font-semibold text-white hover:text-emerald-100">
                  {item.baslik}
                </Link>
                <p className="text-xs text-emerald-100/55">{item.varyantEtiket}</p>
                <p className="mt-2 text-sm font-bold text-emerald-300">{formatTry(cartLineTotal(item))} + KDV</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={() => cart.removeItem(item.urunId, item.varyantId)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Kaldır
                </button>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border border-emerald-500/15 bg-emerald-950/40 p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-400/80">Sipariş özeti</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-emerald-100/60">Ara toplam</dt>
              <dd className="font-medium text-white">{formatTry(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-emerald-100/60">KDV (%20)</dt>
              <dd className="font-medium text-white">{formatTry(kdv)}</dd>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3 text-base">
              <dt className="font-bold text-white">Toplam</dt>
              <dd className="font-bold text-emerald-300">{formatTry(cart.total)}</dd>
            </div>
          </dl>
          <Link
            href={ph("/odeme")}
            className="mt-6 block w-full rounded-xl bg-emerald-500 py-3 text-center text-sm font-bold text-emerald-950 hover:bg-emerald-400"
          >
            Ödemeye geç
          </Link>
          <Link href={ph("/urunler")} className="mt-3 block text-center text-xs text-emerald-400 hover:underline">
            Alışverişe devam et
          </Link>
        </aside>
      </div>
    </div>
  );
}
