export type AmbalajKategori = {
  id: string;
  baslik: string;
  altBaslik: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  vurgu?: string;
};

export type AmbalajOneCikan = {
  id: string;
  baslik: string;
  ozellik: string;
  minSiparis: string;
  etiket?: string;
  href: string;
  imageSrc?: string;
  imageAlt?: string;
};

export type AmbalajGuven = {
  baslik: string;
  aciklama: string;
};

export type AmbalajSektor = {
  baslik: string;
  aciklama: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

export type AmbalajCtaBand = {
  baslik: string;
  aciklama: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export type AmbalajHome = {
  promoBar: string;
  kategoriBaslik: string;
  kategoriAciklama: string;
  kategoriler: AmbalajKategori[];
  oneCikanBaslik: string;
  oneCikanAciklama: string;
  oneCikan: AmbalajOneCikan[];
  guvenBaslik: string;
  guven: AmbalajGuven[];
  sektorBaslik: string;
  sektorAciklama: string;
  sektorler: AmbalajSektor[];
  ctaBand: AmbalajCtaBand;
};

import { ESNEK_AMBALAJ_IMAGES } from "@/lib/esnek-ambalaj-images";

const IMG = ESNEK_AMBALAJ_IMAGES;

export const VARSAYILAN_AMBALAJ_HOME: AmbalajHome = {
  promoBar: "500 kg ve üzeri siparişlerde Marmara bölgesi sevkiyat avantajı · Numune desteği",
  kategoriBaslik: "Ürün grupları",
  kategoriAciklama:
    "Doypack, quadro, flat bottom, torba ve rulo — gıda temasına uygun esnek ambalaj çözümleri. Karton bardak ve kraft çanta grubu bu vitrinde yoktur.",
  kategoriler: [
    {
      id: "doypack",
      baslik: "Kilitli poşet & Doypack",
      altBaslik: "Şeffaf, metalize, renkli, içecek valfli",
      href: "/urunler?kategori=doypack",
      imageSrc: IMG.doypack,
      imageAlt: "Valfli kilitli doypack ambalaj örneği",
      vurgu: "Popüler",
    },
    {
      id: "quadro",
      baslik: "Quadro ambalaj",
      altBaslik: "Yan körüklü, raf duruşu güçlü",
      href: "/urunler?kategori=quadro",
      imageSrc: IMG.quadro,
      imageAlt: "Yan körüklü quadro ambalaj mockup",
    },
    {
      id: "flat",
      baslik: "Flat bottom",
      altBaslik: "Alttan körüklü, valfli seçenekler",
      href: "/urunler?kategori=flat",
      imageSrc: IMG.flatBottom,
      imageAlt: "Stand-up flat bottom ambalaj formatları",
    },
    {
      id: "torba",
      baslik: "Torba & rulo",
      altBaslik: "OPP · CPP · PET · LDPE",
      href: "/urunler?kategori=torba",
      imageSrc: IMG.torbaRulo,
      imageAlt: "Esnek ambalaj üretim hattı",
    },
    {
      id: "baski",
      baslik: "Baskılı ambalaj",
      altBaslik: "Flexo baskı · klise · renk provası",
      href: "/urunler?kategori=baski",
      imageSrc: IMG.baski,
      imageAlt: "Endüstriyel baskı makinesi",
    },
  ],
  oneCikanBaslik: "Sık talep edilen formatlar",
  oneCikanAciklama:
    "Aşağıdaki ölçüler örnek referanslardır; kesin fiyat mikron, baskı ve adede göre hesaplanır. Online hesaplayıcı ile ön tahmin alın.",
  oneCikan: [
    {
      id: "1",
      baslik: "Metalize kilitli torba 12×18 cm",
      ozellik: "Gıda bariyer · önden zip",
      minSiparis: "Min. 5.000 ad",
      etiket: "Doypack",
      href: "/urun/metalize-kilitli-torba-12x18",
      imageSrc: IMG.doypack,
      imageAlt: "Metalize kilitli torba",
    },
    {
      id: "2",
      baslik: "İçecek doypack 250 ml valfli",
      ozellik: "13×22 cm · sıvı dolum uyumlu",
      minSiparis: "Min. 3.000 ad",
      etiket: "Valfli",
      href: "/urun/icecek-doypack-250ml-valfli",
      imageSrc: IMG.icecek,
      imageAlt: "Valfli içecek doypack",
    },
    {
      id: "3",
      baslik: "Quadro 500 g metalize",
      ozellik: "12,5×27 cm · yan körük",
      minSiparis: "Min. 2.000 ad",
      etiket: "Quadro",
      href: "/urun/quadro-500g-metalize",
      imageSrc: IMG.quadro,
      imageAlt: "Quadro metalize ambalaj",
    },
    {
      id: "4",
      baslik: "Flat bottom 250 g mat",
      ozellik: "11,5×21 cm · düz taban",
      minSiparis: "Min. 2.500 ad",
      etiket: "Flat",
      href: "/urun/flat-bottom-250g-mat",
      imageSrc: IMG.flatBottom,
      imageAlt: "Flat bottom mat ambalaj",
    },
    {
      id: "5",
      baslik: "OPP+CPP laminasyon rulo",
      ozellik: "Bobin · otomatik hat",
      minSiparis: "Min. 300 kg",
      etiket: "Rulo",
      href: "/urun/opp-cpp-laminasyon-rulo",
      imageSrc: IMG.torbaRulo,
      imageAlt: "Laminasyon rulo üretim hattı",
    },
    {
      id: "6",
      baslik: "Flexo baskılı LDPE torba",
      ozellik: "6 renk · klise dahil teklif",
      minSiparis: "Min. 500 kg",
      etiket: "Baskı",
      href: "/urun/flexo-baskili-ldpe-torba",
      imageSrc: IMG.baski,
      imageAlt: "Flexo baskı makinesi",
    },
  ],
  guvenBaslik: "Neden ProPack?",
  guven: [
    { baslik: "48 saat teklif", aciklama: "Ölçü tablosu sonrası yazılı fiyat aralığı" },
    { baslik: "Numune & prova", aciklama: "Baskı öncesi renk ve malzeme onayı" },
    { baslik: "Online hesap", aciklama: "Kg/adet bazlı anlık tahmin motoru" },
    { baslik: "Esnek MOQ", aciklama: "Stoklu rulo ve projeye özel üretim" },
  ],
  sektorBaslik: "Sektöre göre çözümler",
  sektorAciklama: "Kahve, atıştırmalık, sos ve endüstriyel dolum hatları için format önerisi sunuyoruz.",
  sektorler: [
    {
      baslik: "Gıda & atıştırmalık",
      aciklama: "Barrier doypack ve quadro — kuruyemiş, çikolata, granül.",
      href: "/urunler?kategori=doypack",
      imageSrc: IMG.gida,
      imageAlt: "Gıda ambalaj formatları",
    },
    {
      baslik: "Kahve & içecek",
      aciklama: "Valfli doypack, aroma koruma, sıvı dolum uyumu.",
      href: "/urunler?kategori=doypack",
      imageSrc: IMG.icecek,
      imageAlt: "İçecek doypack ambalajı",
    },
    {
      baslik: "Endüstriyel & otomatik hat",
      aciklama: "OPP/CPP rulo, LDPE torba, yüksek hacim siparişler.",
      href: "/urunler?kategori=torba",
      imageSrc: IMG.endustri,
      imageAlt: "Endüstriyel ambalaj üretimi",
    },
  ],
  ctaBand: {
    baslik: "Ölçünüz hazır mı?",
    aciklama: "Online mağazadan sipariş verin veya fiyat hesaplayıcı ile ön tahmin alın.",
    primaryLabel: "Mağazaya git",
    primaryHref: "/urunler",
    secondaryLabel: "Fiyat hesapla",
    secondaryHref: "/fiyat-hesaplama",
  },
};

export function mergeAmbalajHome(base: AmbalajHome, patch?: Partial<AmbalajHome>): AmbalajHome {
  if (!patch) return base;
  return {
    promoBar: patch.promoBar ?? base.promoBar,
    kategoriBaslik: patch.kategoriBaslik ?? base.kategoriBaslik,
    kategoriAciklama: patch.kategoriAciklama ?? base.kategoriAciklama,
    kategoriler: Array.isArray(patch.kategoriler) ? patch.kategoriler : base.kategoriler,
    oneCikanBaslik: patch.oneCikanBaslik ?? base.oneCikanBaslik,
    oneCikanAciklama: patch.oneCikanAciklama ?? base.oneCikanAciklama,
    oneCikan: Array.isArray(patch.oneCikan) ? patch.oneCikan : base.oneCikan,
    guvenBaslik: patch.guvenBaslik ?? base.guvenBaslik,
    guven: Array.isArray(patch.guven) ? patch.guven : base.guven,
    sektorBaslik: patch.sektorBaslik ?? base.sektorBaslik,
    sektorAciklama: patch.sektorAciklama ?? base.sektorAciklama,
    sektorler: Array.isArray(patch.sektorler) ? patch.sektorler : base.sektorler,
    ctaBand: patch.ctaBand ? { ...base.ctaBand, ...patch.ctaBand } : base.ctaBand,
  };
}
