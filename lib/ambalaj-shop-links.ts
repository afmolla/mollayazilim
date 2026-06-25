import type { UrunKategoriId } from "@/lib/urun-types";

/** Ambalaj kategori kartı → mağaza filtresi */
export function ambalajKategoriMagazaHref(kategoriId: string): string {
  const id = kategoriId.trim();
  if (id === "doypack" || id === "quadro" || id === "flat" || id === "torba" || id === "baski") {
    return `/urunler?kategori=${id}`;
  }
  return "/urunler";
}

/** Öne çıkan ürün id → ürün detay slug */
export const AMBALAJ_ONE_CIKAN_URUN: Record<string, string> = {
  "1": "/urun/metalize-kilitli-torba-12x18",
  "2": "/urun/icecek-doypack-250ml-valfli",
  "3": "/urun/quadro-500g-metalize",
  "4": "/urun/flat-bottom-250g-mat",
  "5": "/urun/opp-cpp-laminasyon-rulo",
  "6": "/urun/flexo-baskili-ldpe-torba",
};

export function ambalajOneCikanHref(itemId: string, fallback: string): string {
  return AMBALAJ_ONE_CIKAN_URUN[itemId] ?? fallback;
}

export function isAmbalajKategoriId(id: string): id is UrunKategoriId {
  return id === "doypack" || id === "quadro" || id === "flat" || id === "torba" || id === "baski";
}
