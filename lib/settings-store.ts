import { promises as fs } from "fs";
import path from "path";
import { getDataDir } from "@/lib/data-dir";

export type SiteAyarlar = {
  salonAd: string;
  whatsapp: string;
  /** Vitrinde/kurumsal iletişim için (panelden düzenlenir) */
  iletisimWhatsapp?: string;
  iletisimTelefon?: string;
  iletisimEposta?: string;
  /** SEO (site geneli) */
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoOgImage?: string;
  /** Site geneli index açık mı? */
  seoIndex?: boolean;
  adresKisa: string;
  adresDetay: string;
  calismaSaatleri: string;
  sehir: string;
  menuDavranis?: "hover" | "sabit";
  /** Yönetim paneli: sol menü kaydırırken görünür kalsın */
  panelSolMenuSabitle?: boolean;
  /** Yönetim paneli: ilk açılışta menü dar mı (tarayıcıda yerel tercih yoksa) */
  panelSolMenuBaslangic?: "acik" | "dar";
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
  googleMaps?: string;
  /** Footer'da sosyal medya bloklarını göster */
  footerSosyalGoster?: boolean;
  /** Restoran mobil uygulama / API üzerinden sipariş kabulü */
  mobilSiparisAcik?: boolean;
  /**
   * Mobil uygulama zorunlu minimum sürüm (ör. 1.2.0). Doluysa düşük sürüm menü/sipariş alamaz.
   * Uygulama `x-app-version` başlığı gönderir.
   */
  mobilMinVersiyon?: string;
  /** Mobil uygulama mağaza linkleri (footer’da gösterilir) */
  mobilIosIndirUrl?: string;
  mobilAndroidIndirUrl?: string;
  /** Android APK doğrudan indirme (ör. `/apk/molla-restaurant.apk` veya tam URL) */
  mobilAndroidApkUrl?: string;
  /**
   * Yalnız kök vitrin (/) — “Demo / Projeler” kartlarının görünürlüğü.
   * Belirtilmezse true kabul edilir.
   */
  demoKuaforGoster?: boolean;
  /** Ana vitrinde kadın kuaförü (`/kuafor-kadin`) demo kartı */
  demoKuaforKadinGoster?: boolean;
  demoRestaurantGoster?: boolean;
  demoEmlakGoster?: boolean;
  demoAvukatGoster?: boolean;
  demoOtoyikamaGoster?: boolean;
};

type Db = { ayarlar: SiteAyarlar };

async function settingsFile(): Promise<string> {
  return path.join(await getDataDir(), "settings.json");
}

function varsayilan(): SiteAyarlar {
  return {
    salonAd: process.env.NEXT_PUBLIC_SALON_AD ?? "Atlas Kuaför Studio",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_SALON ?? "905551234567",
    iletisimWhatsapp: process.env.NEXT_PUBLIC_MOLLA_WHATSAPP ?? undefined,
    iletisimTelefon: process.env.NEXT_PUBLIC_MOLLA_PHONE ?? undefined,
    iletisimEposta: process.env.NEXT_PUBLIC_MOLLA_EMAIL ?? undefined,
    seoTitle: undefined,
    seoDescription: undefined,
    seoKeywords: undefined,
    seoOgImage: process.env.NEXT_PUBLIC_OG_IMAGE ?? undefined,
    seoIndex: true,
    adresKisa: "Kapaklı · Tekirdağ",
    adresDetay: "Kapaklı, Tekirdağ, Türkiye",
    calismaSaatleri: "Her gün 09:00 — 21:00",
    sehir: "Tekirdağ",
    menuDavranis: "hover",
    panelSolMenuSabitle: true,
    panelSolMenuBaslangic: "acik",
    footerSosyalGoster: true,
    demoKuaforGoster: true,
    demoKuaforKadinGoster: true,
    demoRestaurantGoster: true,
    demoEmlakGoster: true,
    demoAvukatGoster: true,
  };
}

export async function ayarlarGetir(): Promise<SiteAyarlar> {
  const FILE = await settingsFile();
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const db = JSON.parse(raw) as Partial<Db>;
    return { ...varsayilan(), ...(db.ayarlar ?? {}) };
  } catch {
    return varsayilan();
  }
}

export async function ayarlarKaydet(patch: Partial<SiteAyarlar>): Promise<SiteAyarlar> {
  const FILE = await settingsFile();
  const cur = await ayarlarGetir();
  const menuDavranis: "hover" | "sabit" =
    patch.menuDavranis === "sabit" || patch.menuDavranis === "hover"
      ? patch.menuDavranis
      : (cur.menuDavranis ?? "hover");
  const panelSolMenuSabitle =
    typeof patch.panelSolMenuSabitle === "boolean"
      ? patch.panelSolMenuSabitle
      : (cur.panelSolMenuSabitle ?? true);
  const panelSolMenuBaslangic: "acik" | "dar" =
    patch.panelSolMenuBaslangic === "dar" || patch.panelSolMenuBaslangic === "acik"
      ? patch.panelSolMenuBaslangic
      : (cur.panelSolMenuBaslangic ?? "acik");
  const footerSosyalGoster =
    typeof patch.footerSosyalGoster === "boolean"
      ? patch.footerSosyalGoster
      : (cur.footerSosyalGoster ?? true);
  const mobilSiparisAcik =
    typeof patch.mobilSiparisAcik === "boolean"
      ? patch.mobilSiparisAcik
      : (cur.mobilSiparisAcik ?? false);
  const demoKuaforGoster =
    typeof patch.demoKuaforGoster === "boolean"
      ? patch.demoKuaforGoster
      : (cur.demoKuaforGoster ?? true);
  const demoKuaforKadinGoster =
    typeof patch.demoKuaforKadinGoster === "boolean"
      ? patch.demoKuaforKadinGoster
      : (cur.demoKuaforKadinGoster ?? true);
  const demoRestaurantGoster =
    typeof patch.demoRestaurantGoster === "boolean"
      ? patch.demoRestaurantGoster
      : (cur.demoRestaurantGoster ?? true);
  const demoEmlakGoster =
    typeof patch.demoEmlakGoster === "boolean"
      ? patch.demoEmlakGoster
      : (cur.demoEmlakGoster ?? true);
  const demoAvukatGoster =
    typeof patch.demoAvukatGoster === "boolean"
      ? patch.demoAvukatGoster
      : (cur.demoAvukatGoster ?? true);
  const demoOtoyikamaGoster =
    typeof patch.demoOtoyikamaGoster === "boolean"
      ? patch.demoOtoyikamaGoster
      : (cur.demoOtoyikamaGoster ?? true);
  const seoIndex = typeof patch.seoIndex === "boolean" ? patch.seoIndex : (cur.seoIndex ?? true);
  const next: SiteAyarlar = {
    ...cur,
    ...patch,
    salonAd: (patch.salonAd ?? cur.salonAd).trim(),
    whatsapp: (patch.whatsapp ?? cur.whatsapp).trim(),
    iletisimWhatsapp: (patch.iletisimWhatsapp ?? cur.iletisimWhatsapp ?? "").trim() || undefined,
    iletisimTelefon: (patch.iletisimTelefon ?? cur.iletisimTelefon ?? "").trim() || undefined,
    iletisimEposta: (patch.iletisimEposta ?? cur.iletisimEposta ?? "").trim() || undefined,
    seoTitle: (patch.seoTitle ?? cur.seoTitle ?? "").trim() || undefined,
    seoDescription: (patch.seoDescription ?? cur.seoDescription ?? "").trim() || undefined,
    seoKeywords: (patch.seoKeywords ?? cur.seoKeywords ?? "").trim() || undefined,
    seoOgImage: (patch.seoOgImage ?? cur.seoOgImage ?? "").trim() || undefined,
    seoIndex,
    adresKisa: (patch.adresKisa ?? cur.adresKisa).trim(),
    adresDetay: (patch.adresDetay ?? cur.adresDetay).trim(),
    calismaSaatleri: (patch.calismaSaatleri ?? cur.calismaSaatleri).trim(),
    sehir: (patch.sehir ?? cur.sehir).trim(),
    menuDavranis,
    panelSolMenuSabitle,
    panelSolMenuBaslangic,
    instagram: (patch.instagram ?? cur.instagram ?? "").trim() || undefined,
    facebook: (patch.facebook ?? cur.facebook ?? "").trim() || undefined,
    twitter: (patch.twitter ?? cur.twitter ?? "").trim() || undefined,
    youtube: (patch.youtube ?? cur.youtube ?? "").trim() || undefined,
    tiktok: (patch.tiktok ?? cur.tiktok ?? "").trim() || undefined,
    linkedin: (patch.linkedin ?? cur.linkedin ?? "").trim() || undefined,
    googleMaps: (patch.googleMaps ?? cur.googleMaps ?? "").trim() || undefined,
    footerSosyalGoster,
    mobilSiparisAcik,
    mobilMinVersiyon: (patch.mobilMinVersiyon ?? cur.mobilMinVersiyon ?? "").trim() || undefined,
    mobilIosIndirUrl: (patch.mobilIosIndirUrl ?? cur.mobilIosIndirUrl ?? "").trim() || undefined,
    mobilAndroidIndirUrl: (patch.mobilAndroidIndirUrl ?? cur.mobilAndroidIndirUrl ?? "").trim() || undefined,
    mobilAndroidApkUrl: (patch.mobilAndroidApkUrl ?? cur.mobilAndroidApkUrl ?? "").trim() || undefined,
    demoKuaforGoster,
    demoKuaforKadinGoster,
    demoRestaurantGoster,
    demoEmlakGoster,
    demoAvukatGoster,
    demoOtoyikamaGoster,
  };

  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify({ ayarlar: next } satisfies Db, null, 2), "utf8");
  return next;
}
