import { promises as fs } from "fs";
import path from "path";
import { getDataDir } from "@/lib/data-dir";

export type MollaLandingStat = { label: string; value: string };
export type MollaLandingFeature = { title: string; desc: string };

export type MollaLanding = {
  hero: {
    pill: string;
    baslik: string;
    baslikVurgu: string;
    aciklama: string;
    ctaPrimaryLabel: string;
    ctaPrimaryHref: string;
    ctaSecondaryLabel: string;
    ctaSecondaryHref: string;
    stats: MollaLandingStat[];
    features: MollaLandingFeature[];
    previewBaslik: string;
    previewAltBaslik: string;
    previewItems: string[];
    previewGorselUrl: string;
    previewGorselAlt: string;
    previewGorselCaption: string;
    previewGorselAltBaslik: string;
  };
  crmBolum: {
    overline: string;
    baslik: string;
    aciklama: string;
    ozellikler: MollaLandingFeature[];
  };
};

type Db = { landing: MollaLanding };

export function varsayilanMollaLanding(): MollaLanding {
  return {
    hero: {
      pill: "CRM programı · Müşteri takip · Satış yönetimi",
      baslik: "Tekirdağ & Kapaklı İçin",
      baslikVurgu: "Türkçe CRM Yazılımı",
      aciklama:
        "Molla CRM ile müşterilerinizi, tekliflerinizi ve satış sürecinizi tek panelden yönetin. Excel ve WhatsApp karmaşasına son — pipeline, görev ve ekip koordinasyonu bir arada. İkinci adım: kurumsal web sitesi ile Google'da görünür olun.",
      ctaPrimaryLabel: "CRM'i dene",
      ctaPrimaryHref: "https://crm.mollayazilim.com/login",
      ctaSecondaryLabel: "Ücretsiz keşif",
      ctaSecondaryHref: "#iletisim",
      stats: [
        { label: "Hedef bölge", value: "Tekirdağ · Kapaklı" },
        { label: "CRM demo", value: "Aynı gün" },
        { label: "Kurulum", value: "Hızlı başlangıç" },
        { label: "Destek", value: "Türkçe & yerel" },
      ],
      features: [
        { title: "Pipeline takibi", desc: "Fırsat aşamaları, teklif ve satış hunisi tek ekranda." },
        { title: "Müşteri 360°", desc: "Firma, kontak, not ve geçmiş etkileşimler bir arada." },
        { title: "Mobil CRM", desc: "Saha ekibi telefondan müşteri ve görev yönetir." },
        { title: "Türkçe & KVKK", desc: "Türkiye iş süreçlerine uygun, yerel destek." },
      ],
      previewBaslik: "Molla CRM önizleme",
      previewAltBaslik: "Satış pipeline",
      previewItems: [
        "Müşteri & firma kaydı",
        "Teklif takibi",
        "Görev & hatırlatıcı",
        "Ekip yönetimi",
        "Satış raporları",
      ],
      previewGorselUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
      previewGorselAlt: "Dashboard görseli",
      previewGorselCaption: "Müşteri takip programı",
      previewGorselAltBaslik: "KOBİ'ler için Türkçe CRM — mobil uyumlu, hızlı kurulum.",
    },
    crmBolum: {
      overline: "Molla CRM",
      baslik: "Müşteri takip programı — satış sürecinizi kaybetmeyin",
      aciklama:
        "Tekirdağ, Kapaklı, Çerkezköy, Çorlu ve çevresindeki üretici, ticaret ve hizmet firmaları için Türkçe CRM. Excel ve WhatsApp yerine tek panel.",
      ozellikler: [
        { title: "Müşteri & firma kaydı", desc: "Tüm kontaklar, notlar ve geçmiş görüşmeler tek profilde." },
        { title: "Satış pipeline", desc: "Adaydan kapanışa her aşamayı görsel huni ile takip edin." },
        { title: "Teklif & fırsat", desc: "Teklif hazırlama, revizyon ve onay sürecini kayıt altına alın." },
        { title: "Görev & hatırlatıcı", desc: "Ekip görevleri, arama hatırlatmaları ve takvim entegrasyonu." },
        { title: "Raporlar", desc: "Satış performansı, dönüşüm oranı ve ekip verimliliği." },
        { title: "Mobil uyum", desc: "Telefon ve tabletten saha satış — her an erişim." },
      ],
    },
  };
}

async function landingFile(): Promise<string> {
  return path.join(await getDataDir(), "landing.json");
}

function mergeLanding(base: MollaLanding, patch: Partial<MollaLanding>): MollaLanding {
  return {
    hero: { ...base.hero, ...(patch.hero ?? {}) },
    crmBolum: { ...base.crmBolum, ...(patch.crmBolum ?? {}) },
  };
}

export async function landingGetir(): Promise<MollaLanding> {
  const base = varsayilanMollaLanding();
  try {
    const raw = await fs.readFile(await landingFile(), "utf8");
    const db = JSON.parse(raw) as Partial<Db>;
    if (!db.landing) return base;
    return mergeLanding(base, db.landing);
  } catch {
    return base;
  }
}

export async function landingKaydet(patch: Partial<MollaLanding>): Promise<MollaLanding> {
  const cur = await landingGetir();
  const next = mergeLanding(cur, patch);
  const file = await landingFile();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify({ landing: next } satisfies Db, null, 2), "utf8");
  return next;
}
