export type UrunBirim = "adet" | "kg";

export type UrunVaryant = {
  id: string;
  etiket: string;
  miktar: number;
  birim: UrunBirim;
  fiyat: number;
  indirimliFiyat?: number;
};

export type UrunKategoriId = "doypack" | "quadro" | "flat" | "torba" | "baski";

export type UrunKayit = {
  id: string;
  slug: string;
  baslik: string;
  ozet: string;
  aciklama?: string;
  kategoriId: UrunKategoriId;
  imageSrc: string;
  imageAlt?: string;
  etiket?: string;
  minSiparis?: string;
  varyantlar: UrunVaryant[];
  yayinda: boolean;
  stokta: boolean;
  sira: number;
  guncellenme: string;
};

export const URUN_KATEGORILER: { id: UrunKategoriId; baslik: string; aciklama: string }[] = [
  { id: "doypack", baslik: "Kilitli poşet & Doypack", aciklama: "Şeffaf, metalize, valfli formatlar" },
  { id: "quadro", baslik: "Quadro ambalaj", aciklama: "Yan körüklü raf duruşu" },
  { id: "flat", baslik: "Flat bottom", aciklama: "Alttan körüklü düz taban" },
  { id: "torba", baslik: "Torba & rulo", aciklama: "OPP · CPP · PET · LDPE" },
  { id: "baski", baslik: "Baskılı ambalaj", aciklama: "Flexo baskı · klise · prova" },
];

export function urunVaryantFiyat(v: UrunVaryant): number {
  return typeof v.indirimliFiyat === "number" && v.indirimliFiyat > 0 ? v.indirimliFiyat : v.fiyat;
}

export function formatTry(n: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(n);
}
