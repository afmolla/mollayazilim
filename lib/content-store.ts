import { promises as fs } from "fs";
import path from "path";
import { getDataDir } from "@/lib/data-dir";
import type { VfHiza } from "@/lib/vf-hiza";

export type { VfHiza } from "@/lib/vf-hiza";

export type HomeFeature = {
  /** Kararlı anahtar (yeni kartlarda otomatik) */
  id?: string;
  baslik: string;
  aciklama: string;
  /** Izgara hücresinde yatay hizalama */
  hiza?: VfHiza;
  /** md:grid-cols-3 içinde kapladığı sütun (1–3) */
  kolon?: 1 | 2 | 3;
};
export type HizmetSatir = { ad: string; sure: string; fiyat: string };
export type GaleriGorsel = { src: string; alt: string; hiza?: VfHiza; kolon?: 1 | 2 };

/** Hero görselinin altında gösterilen serbest bloklar (vitrin düzenleme) */
export type HomeHeroAltBlok =
  | { id: string; tur: "metin"; metin: string; hiza?: VfHiza }
  | { id: string; tur: "gorsel"; src: string; alt: string; hiza?: VfHiza };

export type SiteIcerik = {
  home: {
    badge: string;
    baslik: string;
    aciklama: string;
    ctaPrimaryLabel: string;
    ctaPrimaryHref: string;
    ctaSecondaryLabel: string;
    ctaSecondaryHref: string;
    heroImageSrc: string;
    heroImageAlt: string;
    /** Görselin altına eklenen metin / küçük görsel blokları */
    heroAltBloklar?: HomeHeroAltBlok[];
    bolumBaslik: string;
    bolumAciklama: string;
    features: HomeFeature[];
  };
  hizmetler: {
    sayfaAciklama: string;
    rows: HizmetSatir[];
  };
  galeri: {
    sayfaAciklama: string;
    images: GaleriGorsel[];
  };
  iletisim: {
    sayfaAciklama: string;
    whatsappMesaj: string;
  };
  /** Randevu / masa ayırt formu — vitrine göre seçenekler (kuaför ≠ restoran). */
  randevuForm?: {
    selectLabel: string;
    options: string[];
    pageTitle?: string;
    pageDescription?: string;
    submitButtonLabel?: string;
    intro?: string;
    /** Vitrin `/randevular` başlığı (örn. restoran: Onaylı rezervasyonlar) */
    approvedListTitle?: string;
    approvedListIntro?: string;
    successMessage?: string;
  };
};

type Db = { icerik: SiteIcerik };

async function contentFile(): Promise<string> {
  return path.join(await getDataDir(), "content.json");
}

function varsayilan(): SiteIcerik {
  return {
    home: {
      badge: "Kapaklı · Tekirdağ · Demo vitrin",
      baslik: "Tarzınızı yenileyin",
      aciklama:
        "Kesim, sakal ve bakım hizmetlerinde modern teknikler, hızlı randevu ve şeffaf panel yönetimi — müşteriye sunulabilir demo.",
      ctaPrimaryLabel: "Randevu al",
      ctaPrimaryHref: "/randevu",
      ctaSecondaryLabel: "Hizmetler",
      ctaSecondaryHref: "/hizmetler",
      heroImageSrc: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=900&q=80",
      heroImageAlt: "Berber salonu iç mekan — profesyonel çalışma alanı",
      heroAltBloklar: [],
      bolumBaslik: "Neden bu demo?",
      bolumAciklama:
        "SEO uyumlu sayfalar, mobil uyum ve tek tık WhatsApp — gerçek işletme vitrinine yakın deneyim.",
      features: [
        { baslik: "Performans", aciklama: "Next.js ile sunucu tarafı render ve hızlı geçişler." },
        { baslik: "Panel entegrasyonu", aciklama: "Randevuları onaylayın; müşteriye anında mesaj gönderin." },
        { baslik: "4 tema", aciklama: "Klasik berberden minimal tasarıma tek tıkla geçiş." },
      ],
    },
    hizmetler: {
      sayfaAciklama: "Demo vitrin — gerçek işletmede fiyatlar panele bağlı güncellenebilir.",
      rows: [
        { ad: "Saç kesimi", sure: "30 dk", fiyat: "850 ₺" },
        { ad: "Sakal şekillendirme", sure: "20 dk", fiyat: "450 ₺" },
        { ad: "Saç + sakal paket", sure: "45 dk", fiyat: "1.100 ₺" },
        { ad: "Fön / şekillendirme", sure: "25 dk", fiyat: "600 ₺" },
        { ad: "Boyama / röfle", sure: "90+ dk", fiyat: "2.400 ₺+" },
        { ad: "Keratin / bakım", sure: "120 dk", fiyat: "3.200 ₺" },
      ],
    },
    galeri: {
      sayfaAciklama:
        "Unsplash üzerinden telif dostu demo görseller. Gerçek müşteri için kendi çekimlerinizi kullanın.",
      images: [
        {
          src: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80",
          alt: "Berber koltuğu ve ayna — modern salon",
        },
        {
          src: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80",
          alt: "Profesyonel saç kesimi anı",
        },
        {
          src: "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=800&q=80",
          alt: "Berber aletleri ve detay",
        },
        {
          src: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80",
          alt: "Salon iç mekan geniş açı",
        },
      ],
    },
    iletisim: {
      sayfaAciklama: "Adres, çalışma saatleri ve WhatsApp — iletişim bilgileri.",
      whatsappMesaj: "Merhaba, randevu ve fiyat bilgisi almak istiyorum.",
    },
    randevuForm: {
      selectLabel: "Hizmet",
      options: [
        "Saç kesimi",
        "Sakal şekillendirme",
        "Saç + sakal paket",
        "Fön / şekillendirme",
        "Boyama / röfle",
        "Keratin / bakım",
      ],
      pageTitle: "Online randevu",
      pageDescription:
        "Randevu talebiniz panele düşer; onayladığınızda müşteri listesinde görünür.",
      submitButtonLabel: "Randevu talebi gönder",
      intro:
        "Form gönderildiğinde talep beklemede olarak kaydedilir; panelden onayladığınızda randevu listesinde görünebilir.",
    },
  };
}

function mergeRandevuForm(
  base: NonNullable<SiteIcerik["randevuForm"]>,
  patch?: SiteIcerik["randevuForm"],
): NonNullable<SiteIcerik["randevuForm"]> {
  if (!patch) return base;
  return {
    selectLabel: patch.selectLabel ?? base.selectLabel,
    /** `options` dizisi dosyada varsa (boş bile olsa) patch kullanılır; yoksa kuaför varsayılanına düşülmez */
    options: Array.isArray(patch.options) ? patch.options : base.options,
    pageTitle: patch.pageTitle ?? base.pageTitle,
    pageDescription: patch.pageDescription ?? base.pageDescription,
    submitButtonLabel: patch.submitButtonLabel ?? base.submitButtonLabel,
    intro: patch.intro ?? base.intro,
    approvedListTitle: patch.approvedListTitle ?? base.approvedListTitle,
    approvedListIntro: patch.approvedListIntro ?? base.approvedListIntro,
    successMessage: patch.successMessage ?? base.successMessage,
  };
}

function mergeHome(
  base: SiteIcerik["home"],
  patch?: Partial<SiteIcerik["home"]>
): SiteIcerik["home"] {
  if (!patch) return base;
  return {
    badge: patch.badge ?? base.badge,
    baslik: patch.baslik ?? base.baslik,
    aciklama: patch.aciklama ?? base.aciklama,
    ctaPrimaryLabel: patch.ctaPrimaryLabel ?? base.ctaPrimaryLabel,
    ctaPrimaryHref: patch.ctaPrimaryHref ?? base.ctaPrimaryHref,
    ctaSecondaryLabel: patch.ctaSecondaryLabel ?? base.ctaSecondaryLabel,
    ctaSecondaryHref: patch.ctaSecondaryHref ?? base.ctaSecondaryHref,
    heroImageSrc: patch.heroImageSrc ?? base.heroImageSrc,
    heroImageAlt: patch.heroImageAlt ?? base.heroImageAlt,
    heroAltBloklar: Array.isArray(patch.heroAltBloklar)
      ? patch.heroAltBloklar
      : (base.heroAltBloklar ?? []),
    bolumBaslik: patch.bolumBaslik ?? base.bolumBaslik,
    bolumAciklama: patch.bolumAciklama ?? base.bolumAciklama,
    features: Array.isArray(patch.features) ? patch.features : base.features,
  };
}

function mergeHizmetler(
  base: SiteIcerik["hizmetler"],
  patch?: Partial<SiteIcerik["hizmetler"]>
): SiteIcerik["hizmetler"] {
  if (!patch) return base;
  return {
    sayfaAciklama: patch.sayfaAciklama ?? base.sayfaAciklama,
    rows: Array.isArray(patch.rows) ? patch.rows : base.rows,
  };
}

function mergeGaleri(
  base: SiteIcerik["galeri"],
  patch?: Partial<SiteIcerik["galeri"]>
): SiteIcerik["galeri"] {
  if (!patch) return base;
  return {
    sayfaAciklama: patch.sayfaAciklama ?? base.sayfaAciklama,
    images: Array.isArray(patch.images) ? patch.images : base.images,
  };
}

function mergeIletisim(
  base: SiteIcerik["iletisim"],
  patch?: Partial<SiteIcerik["iletisim"]>
): SiteIcerik["iletisim"] {
  if (!patch) return base;
  return {
    sayfaAciklama: patch.sayfaAciklama ?? base.sayfaAciklama,
    whatsappMesaj: patch.whatsappMesaj ?? base.whatsappMesaj,
  };
}

/** Dosyadan okunan kısmi JSON ile varsayılanları güvenli birleştirir (shallow merge home.features’ı silmez). */
export async function icerikGetir(): Promise<SiteIcerik> {
  const v = varsayilan();
  const FILE = await contentFile();
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const db = JSON.parse(raw) as Partial<Db>;
    const stored = db.icerik;
    if (!stored) return v;
    const rf = v.randevuForm
      ? mergeRandevuForm(v.randevuForm, stored.randevuForm)
      : stored.randevuForm;
    return {
      home: mergeHome(v.home, stored.home),
      hizmetler: mergeHizmetler(v.hizmetler, stored.hizmetler),
      galeri: mergeGaleri(v.galeri, stored.galeri),
      iletisim: mergeIletisim(v.iletisim, stored.iletisim),
      ...(rf ? { randevuForm: rf } : {}),
    };
  } catch {
    return v;
  }
}

export async function icerikKaydet(patch: Partial<SiteIcerik>): Promise<SiteIcerik> {
  const FILE = await contentFile();
  const cur = await icerikGetir();
  const next: SiteIcerik = {
    home: mergeHome(cur.home, patch.home),
    hizmetler: mergeHizmetler(cur.hizmetler, patch.hizmetler),
    galeri: mergeGaleri(cur.galeri, patch.galeri),
    iletisim: mergeIletisim(cur.iletisim, patch.iletisim),
    randevuForm: mergeRandevuForm(cur.randevuForm ?? varsayilan().randevuForm!, patch.randevuForm),
  };
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify({ icerik: next } satisfies Db, null, 2), "utf8");
  return next;
}

