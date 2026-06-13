/** Fiyat hesaplama sayfası — panelden düzenlenen metinler */

export type FiyatHesapIcerik = {
  seoTitle?: string;
  seoDescription?: string;
  rozet: string;
  baslik: string;
  aciklama: string;
  sonucBaslik: string;
  waButon: string;
  randevuButon: string;
  sonucAgirlik?: string;
  sonucBirim?: string;
  sonucTeslim?: string;
  sonucBaski?: string;
  sonucKlise?: string;
  sonucEk?: string;
  form?: Partial<FiyatHesapFormEtiketleri>;
};

export type FiyatHesapFormEtiketleri = {
  urunTipi: string;
  malzeme: string;
  form: string;
  mikron: string;
  mikronIpucu: string;
  en: string;
  boy: string;
  adet: string;
  metraj: string;
  metrajIpucu: string;
  baski: string;
  baskiRenk: string;
  perfore: string;
  fermuar: string;
  pencere: string;
};

export const VARSAYILAN_FIYAT_FORM: FiyatHesapFormEtiketleri = {
  urunTipi: "Ürün tipi",
  malzeme: "Malzeme grubu",
  form: "Form / kullanım",
  mikron: "Kalınlık (mikron µm)",
  mikronIpucu: "Tipik: 20–80 µm gıda, 60–120 µm ağır duty",
  en: "En (mm)",
  boy: "Boy (mm)",
  adet: "Adet",
  metraj: "Metraj (metre)",
  metrajIpucu: "Bobin uzunluğu — otomatik dolum hatları için",
  baski: "Baskı istiyorum (flexo / rotogravür)",
  baskiRenk: "Baskı renk sayısı",
  perfore: "Perfore",
  fermuar: "Fermuar / kilit",
  pencere: "Pencere",
};

export const VARSAYILAN_FIYAT_HESAP: FiyatHesapIcerik = {
  rozet: "Online teklif",
  baslik: "Esnek ambalaj fiyat hesaplama",
  aciklama:
    "OPP, CPP, PET, LDPE torba ve rulo için tahmini teklif aralığı. Kesin fiyat numune ve baskı onayı sonrası 48 saat içinde yazılır.",
  sonucBaslik: "Tahmini teklif aralığı (KDV hariç)",
  waButon: "WhatsApp ile teklif iste",
  randevuButon: "Numune / keşif talebi",
  sonucAgirlik: "Tahmini ağırlık",
  sonucBirim: "Satış birim (kg)",
  sonucTeslim: "Tahmini teslim",
  sonucBaski: "Baskı işçilik",
  sonucKlise: "Klise / setup",
  sonucEk: "Ek özellikler",
};

export function mergeFiyatHesap(
  base: FiyatHesapIcerik,
  patch?: Partial<FiyatHesapIcerik>,
): FiyatHesapIcerik {
  if (!patch) return base;
  return {
    ...base,
    ...patch,
    form: { ...base.form, ...(patch.form ?? {}) },
  };
}

export function fiyatFormEtiketleri(f?: Partial<FiyatHesapFormEtiketleri>): FiyatHesapFormEtiketleri {
  return { ...VARSAYILAN_FIYAT_FORM, ...(f ?? {}) };
}
