import { promises as fs } from "fs";
import path from "path";
import { getDataDir } from "@/lib/data-dir";
import type { VfHiza } from "@/lib/vf-hiza";

import type { FiyatHesapIcerik } from "@/lib/fiyat-hesap-defaults";
import { mergeFiyatHesap, VARSAYILAN_FIYAT_HESAP } from "@/lib/fiyat-hesap-defaults";
import type { AmbalajHome } from "@/lib/ambalaj-home-defaults";
import { mergeAmbalajHome, VARSAYILAN_AMBALAJ_HOME } from "@/lib/ambalaj-home-defaults";

export type { VfHiza } from "@/lib/vf-hiza";
export type { FiyatHesapIcerik } from "@/lib/fiyat-hesap-defaults";
export type { AmbalajHome } from "@/lib/ambalaj-home-defaults";

/** Hero sağ / alt kart (esnek ambalaj vb.) */
export type HomeHeroKart = {
  imageSrc: string;
  imageAlt: string;
  baslik: string;
  aciklama: string;
};

export type HomeFeature = {
  /** Kararlı anahtar (yeni kartlarda otomatik) */
  id?: string;
  baslik: string;
  aciklama: string;
  /** Kart üstü görsel (oto yıkama vb.) */
  imageSrc?: string;
  /** Izgara hücresinde yatay hizalama */
  hiza?: VfHiza;
  /** md:grid-cols-3 içinde kapladığı sütun (1–3) */
  kolon?: 1 | 2 | 3;
};
export type HizmetSatir = {
  ad: string;
  sure: string;
  fiyat: string;
  /** Ürün sayfası bölüm başlığı için anchor (ör. doypack → #doypack) */
  anchorId?: string;
};
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
    /** Hero altı etiket pill’leri (satır satır panelden) */
    etiketler?: string[];
    /** Hero sağ kart */
    heroKart?: HomeHeroKart;
    bolumBaslik: string;
    bolumAciklama: string;
    features: HomeFeature[];
  };
  hizmetler: {
    sayfaBaslik?: string;
    kolonAd?: string;
    kolonSure?: string;
    kolonFiyat?: string;
    sayfaAciklama: string;
    rows: HizmetSatir[];
  };
  galeri: {
    sayfaBaslik?: string;
    sayfaAciklama: string;
    images: GaleriGorsel[];
  };
  iletisim: {
    sayfaBaslik?: string;
    sayfaAciklama: string;
    whatsappMesaj: string;
  };
  /** Footer ek metni vb. */
  site?: {
    footerEkMetin?: string;
  };
  /** Esnek ambalaj fiyat hesaplama sayfası */
  fiyatHesap?: FiyatHesapIcerik;
  /** Ambalaj vitrin anasayfa bölümleri (kategori vitrin, öne çıkanlar, güven) */
  ambalajHome?: AmbalajHome;
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
    etiketler: Array.isArray(patch.etiketler) ? patch.etiketler : (base.etiketler ?? []),
    heroKart: patch.heroKart ? { ...(base.heroKart ?? { imageSrc: "", imageAlt: "", baslik: "", aciklama: "" }), ...patch.heroKart } : base.heroKart,
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
    sayfaBaslik: patch.sayfaBaslik ?? base.sayfaBaslik,
    kolonAd: patch.kolonAd ?? base.kolonAd,
    kolonSure: patch.kolonSure ?? base.kolonSure,
    kolonFiyat: patch.kolonFiyat ?? base.kolonFiyat,
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
    sayfaBaslik: patch.sayfaBaslik ?? base.sayfaBaslik,
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
    sayfaBaslik: patch.sayfaBaslik ?? base.sayfaBaslik,
    sayfaAciklama: patch.sayfaAciklama ?? base.sayfaAciklama,
    whatsappMesaj: patch.whatsappMesaj ?? base.whatsappMesaj,
  };
}

function mergeSite(
  base: SiteIcerik["site"],
  patch?: SiteIcerik["site"],
): SiteIcerik["site"] {
  if (!patch) return base;
  return {
    footerEkMetin: patch.footerEkMetin ?? base?.footerEkMetin,
  };
}

/** Dosyadan okunan kısmi JSON ile varsayılanları güvenli birleştirir (shallow merge home.features’ı silmez). */
export async function icerikGetir(): Promise<SiteIcerik> {
  const v = varsayilan();
  const FILE = await contentFile();
  const subdir = path.basename(path.dirname(FILE));
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
      ...(stored.site ? { site: mergeSite(undefined, stored.site) } : {}),
      ...(stored.fiyatHesap
        ? { fiyatHesap: mergeFiyatHesap(VARSAYILAN_FIYAT_HESAP, stored.fiyatHesap) }
        : {}),
      ...(subdir === "ambalaj" || stored.ambalajHome
        ? {
            ambalajHome: mergeAmbalajHome(VARSAYILAN_AMBALAJ_HOME, stored.ambalajHome),
          }
        : {}),
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
    ...(patch.site !== undefined || cur.site
      ? { site: mergeSite(cur.site, patch.site ?? cur.site) }
      : {}),
    ...(patch.fiyatHesap !== undefined || cur.fiyatHesap
      ? {
          fiyatHesap: mergeFiyatHesap(
            cur.fiyatHesap ?? VARSAYILAN_FIYAT_HESAP,
            patch.fiyatHesap ?? cur.fiyatHesap,
          ),
        }
      : {}),
    ...(patch.ambalajHome !== undefined || cur.ambalajHome
      ? {
          ambalajHome: mergeAmbalajHome(
            cur.ambalajHome ?? VARSAYILAN_AMBALAJ_HOME,
            patch.ambalajHome ?? cur.ambalajHome,
          ),
        }
      : {}),
  };
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify({ icerik: next } satisfies Db, null, 2), "utf8");
  return next;
}

