import { promises as fs } from "fs";
import path from "path";
import { getDataDir } from "@/lib/data-dir";

export type MollaLandingStat = { label: string; value: string };
export type MollaLandingFeature = { title: string; desc: string };
export type MollaFaqItem = { q: string; a: string };
export type MollaNavLink = { label: string; href: string };

export type MollaDemoKey =
  | "kuafor"
  | "kuaforKadin"
  | "restaurant"
  | "emlak"
  | "avukat"
  | "otoyikama"
  | "esnekAmbalaj"
  | "crm";

export type MollaDemoItem = {
  key: MollaDemoKey;
  title: string;
  href: string;
  meta: string;
  external?: boolean;
  badge?: "Demo" | "Uygulama";
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export type MollaDemoGroup = {
  id: string;
  title: string;
  desc: string;
  items: MollaDemoItem[];
};

export type MollaPackage = {
  title: string;
  badge: string;
  desc: string;
  items: string[];
  cta: string;
  href: string;
  featured: boolean;
  featuredLabel?: string;
};

export type MollaProcessStep = { no: string; baslik: string; aciklama: string };

export type MollaSectionMeta = { overline: string; baslik: string; aciklama: string };

export type MollaLanding = {
  navbar: {
    markaAd: string;
    markaHarf: string;
    navLinks: MollaNavLink[];
    whatsappLabel: string;
    whatsappMesaj: string;
    crmDemoLabel: string;
    crmDemoHref: string;
    ctaLabel: string;
    ctaHref: string;
  };
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
    previewAciklama: string;
    previewItems: string[];
    previewGorselUrl: string;
    previewGorselAlt: string;
    previewGorselCaption: string;
    previewGorselAltBaslik: string;
  };
  crmBolum: MollaSectionMeta & {
    ozellikler: MollaLandingFeature[];
    ctaPrimaryLabel: string;
    ctaPrimaryHref: string;
    ctaSecondaryLabel: string;
    ctaSecondaryHref: string;
    demoGirisNotu: string;
  };
  hizmetlerBolum: MollaSectionMeta & {
    kartlar: MollaLandingFeature[];
    rozetler: string[];
  };
  demolarBolum: MollaSectionMeta & {
    bosMesaj: string;
    gruplar: MollaDemoGroup[];
  };
  paketlerBolum: MollaSectionMeta & {
    paketler: MollaPackage[];
  };
  surecBolum: MollaSectionMeta & {
    adimlar: MollaProcessStep[];
    taahhutBaslik: string;
    taahhutMetin: string;
  };
  sssBolum: MollaSectionMeta & {
    sorular: MollaFaqItem[];
  };
  iletisimBolum: MollaSectionMeta & {
    vurguMetin: string;
    hizliBilgiBaslik: string;
    hizliBilgi: string[];
    formBaslik: string;
    formAciklama: string;
    formVarsayilanMesaj: string;
  };
  footer: {
    baslik: string;
    aciklama: string;
    whatsappButon: string;
    telif: string;
  };
  mobilBar: {
    whatsappLabel: string;
    ctaLabel: string;
    ctaHref: string;
  };
};

type Db = { landing: MollaLanding };

const DEFAULT_DEMO_GROUPS: MollaDemoGroup[] = [
  {
    id: "yazilim",
    title: "Yazılım ürünleri",
    desc: "Kendi geliştirdiğimiz iş uygulamaları — canlı ortamda inceleyebilir, giriş yaparak deneyebilirsiniz.",
    items: [
      {
        key: "crm",
        title: "Molla CRM",
        href: "https://crm.mollayazilim.com",
        meta: "Mobil-first satış CRM — müşteri, fırsat, pipeline, görev ve ekip yönetimi",
        external: true,
        badge: "Uygulama",
        primaryLabel: "CRM'i incele",
        secondaryHref: "https://crm.mollayazilim.com/login",
        secondaryLabel: "Giriş yap",
      },
    ],
  },
  {
    id: "kuaför",
    title: "Kuaför demoları",
    desc: "Erkek berber vitrinı (/kuafor) ve kadın kuaförü vitrinı (/kuafor-kadin) — farklı tasarım, aynı panel mantığı.",
    items: [
      { key: "kuafor", title: "Erkek kuaförü", href: "/kuafor", meta: "Berber vitrin + panel" },
      { key: "kuaforKadin", title: "Kadın kuaförü", href: "/kuafor-kadin", meta: "Renk & bakım vitrin" },
    ],
  },
  {
    id: "avukat",
    title: "Avukatlık vitrini",
    desc: "Hukuk bürosu için kurumsal sayfalar, görüşme talebi ve içerik yönetimi.",
    items: [{ key: "avukat", title: "Avukatlık Demo", href: "/avukat", meta: "Hukuk vitrin + görüşme talebi" }],
  },
  {
    id: "diger",
    title: "Diğer sektör demoları",
    desc: "Restoran QR menü, emlak ilan vitrinleri, esnek ambalaj ve oto yıkama.",
    items: [
      { key: "restaurant", title: "Restoran Demo", href: "/restaurant", meta: "QR menü + rezervasyon" },
      { key: "emlak", title: "Emlak Demo", href: "/emlak", meta: "İlan + filtreleme" },
      {
        key: "esnekAmbalaj",
        title: "Esnek Ambalaj",
        href: "/esnek-ambalaj",
        meta: "OPP · CPP · torba/rulo · fiyat hesaplama",
      },
      { key: "otoyikama", title: "Oto Yıkama Demo", href: "/otoyikama", meta: "Yıkama · pasta cila · seramik" },
    ],
  },
];

const DEFAULT_FAQ: MollaFaqItem[] = [
  {
    q: "CRM programı nedir, işletmeme ne kazandırır?",
    a: "CRM (müşteri ilişkileri yönetimi) yazılımı; müşteri kayıtları, satış fırsatları, teklifler, görevler ve ekip iletişimini tek panelde toplar. Excel ve WhatsApp dağınıklığını bitirir; kaçan fırsatları görünür kılar, satış sürecini ölçülebilir hale getirir.",
  },
  {
    q: "Tekirdağ ve Kapaklı'da CRM kurulumu nasıl yapılıyor?",
    a: "Kapaklı merkezli ekibimiz Tekirdağ, Çerkezköy, Çorlu, Saray ve çevre ilçelerdeki KOBİ'lere uzaktan veya yerinde keşif sunar. 15 dakikalık görüşmeden sonra canlı demo hesabı açılır; ihtiyaca göre modüller ve eğitim planlanır.",
  },
  {
    q: "Molla CRM'de hangi modüller var?",
    a: "Müşteri ve firma kayıtları, satış pipeline (fırsat aşamaları), teklif takibi, görev ve hatırlatıcılar, ekip yönetimi, raporlar ve mobil uyumlu arayüz. Sektöre göre ambalaj fiyat motoru, e-posta senkron ve iş akışı otomasyonu eklenebilir.",
  },
  {
    q: "CRM mi, web sitesi mi — hangisinden başlamalıyım?",
    a: "Satış ve müşteri takibi acil ise önce CRM ile başlayın; marka görünürlüğü ve online vitrin öncelikse web sitesi. Çoğu işletme için CRM + kurumsal web sitesi birlikte en yüksek dönüşümü sağlar — ikisini de aynı panel mantığıyla teslim ediyoruz.",
  },
  {
    q: "Tekirdağ Kapaklı'da web sitesi teslim süresi ne kadar?",
    a: "Keşif görüşmesinden sonra çoğu projede 24 saat içinde demo çıkarıyoruz; içerik hazırsa yayına çıkış genelde 3–10 gün aralığında planlanır.",
  },
  {
    q: "SEO uyumlu site ve CRM birlikte alınabilir mi?",
    a: "Evet. CRM ile müşteri takibini kurarken kurumsal web sitenizi Google'da görünür hale getiriyoruz: meta, canonical, site haritası, yapılandırılmış veri ve Tekirdağ–Kapaklı yerel anahtar kelime optimizasyonu dahil.",
  },
];

export function varsayilanMollaLanding(): MollaLanding {
  return {
    navbar: {
      markaAd: "Molla Yazılım",
      markaHarf: "M",
      navLinks: [
        { label: "CRM", href: "#crm" },
        { label: "Web Sitesi", href: "#hizmetler" },
        { label: "Demolar", href: "#demolar" },
        { label: "İletişim", href: "#iletisim" },
      ],
      whatsappLabel: "WhatsApp",
      whatsappMesaj: "Merhaba, Molla CRM hakkında bilgi ve demo almak istiyorum.",
      crmDemoLabel: "CRM Demo",
      crmDemoHref: "https://crm.mollayazilim.com/login",
      ctaLabel: "Ücretsiz keşif",
      ctaHref: "#iletisim",
    },
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
      previewAciklama: "Fırsatlar, teklifler ve müşteri notları — tek ekranda.",
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
      ctaPrimaryLabel: "Canlı CRM'yi dene →",
      ctaPrimaryHref: "https://crm.mollayazilim.com/login",
      ctaSecondaryLabel: "CRM demo talebi",
      ctaSecondaryHref: "#iletisim",
      demoGirisNotu: "Demo giriş: demo@crm.local / Demo1234!",
    },
    hizmetlerBolum: {
      overline: "Web Sitesi",
      baslik: "Kurumsal web sitesi & sektörel vitrin demoları",
      aciklama:
        "CRM kurduktan sonra veya paralelde: Google'da görünür kurumsal site, admin panel ve hazır sektör demoları.",
      kartlar: [
        {
          title: "Kuaför (erkek & kadın)",
          desc: "İki ayrı demo vitrin; randevu akışı, içerik ve panel — berber ve kadın salonu tasarımları.",
        },
        { title: "Restoran Sistemi", desc: "QR menü, rezervasyon, masa yönetimi." },
        { title: "Emlak Sistemi", desc: "İlan yönetimi, filtreleme, admin paneli." },
        { title: "Avukatlık Vitrini", desc: "Hukuk odaklı sayfalar, görüşme talebi + panel." },
      ],
      rozetler: ["Modern UI", "Panel dahil", "Hızlı kurulum"],
    },
    demolarBolum: {
      overline: "Demo / Projeler",
      baslik: "Demolar ve yazılım ürünleri",
      aciklama:
        "Sektörel vitrin demoları ve Molla CRM — örnek siteler gerçek bir işletmeyi temsil etmez; her kartta vitrin + panel (veya uygulama girişi) akışını görebilirsiniz.",
      bosMesaj:
        "Bu demolar şu an kapalı. Yönetim panelinde Portföy sekmesinden tekrar açabilirsiniz.",
      gruplar: DEFAULT_DEMO_GROUPS,
    },
    paketlerBolum: {
      overline: "Paketler",
      baslik: "İhtiyacınıza göre net başlangıç",
      aciklama: "Önce hızlı demo çıkarıyoruz; sonra paketi işletmenize göre netleştiriyoruz.",
      paketler: [
        {
          title: "Molla CRM",
          badge: "Öncelikli ürün",
          desc: "Müşteri takibi, satış pipeline, teklif ve ekip yönetimi. Tekirdağ ve çevresindeki KOBİ'ler için Türkçe CRM.",
          items: ["Canlı demo hesabı", "Pipeline & teklif", "Mobil uyum", "Yerel destek Kapaklı"],
          cta: "CRM demo iste",
          href: "#crm",
          featured: true,
          featuredLabel: "En popüler",
        },
        {
          title: "Kurumsal Web",
          badge: "Web sitesi",
          desc: "Markanızı Google'da görünür kılın. Kurumsal web sitesi + SEO temel kurulum.",
          items: ["Modern tasarım", "Mobil uyum", "Tekirdağ yerel SEO", "WhatsApp / form CTA"],
          cta: "Web teklifi al",
          href: "#iletisim",
          featured: false,
        },
        {
          title: "CRM + Web",
          badge: "Tam paket",
          desc: "Satış takibi CRM ile, marka görünürlüğü web sitesi ile — en yüksek dönüşüm paketi.",
          items: ["CRM + kurumsal site", "Admin panel", "Lead takibi", "Tek sözleşme, tek ekip"],
          cta: "Paket teklifi",
          href: "#iletisim",
          featured: false,
        },
      ],
    },
    surecBolum: {
      overline: "Süreç",
      baslik: "3 adımda yayına",
      aciklama: "Sürpriz yok: kapsam, demo, yayına çıkış. Hepsi net planla.",
      adimlar: [
        { no: "01", baslik: "Keşif (15 dk)", aciklama: "Sektör, hedef, örnek siteler ve içerik ihtiyacı netleşir." },
        { no: "02", baslik: "Demo (24 saat)", aciklama: "Tasarım + akış + CTA'lar demo üzerinde görünür hale gelir." },
        { no: "03", baslik: "Yayına çıkış (3–10 gün)", aciklama: "Alan adı, SEO temel kurulum, hız ve takip ile canlıya alınır." },
      ],
      taahhutBaslik: "Taahhüt",
      taahhutMetin:
        "İlk görüşmeden sonra 24 saat içinde demo planı ve teslim takvimi paylaşırız. Uymuyorsa başlamayız.",
    },
    sssBolum: {
      overline: "SSS",
      baslik: "Sık sorulan sorular",
      aciklama: "Netleştirelim: süreç, teslim ve içerik yönetimi.",
      sorular: DEFAULT_FAQ,
    },
    iletisimBolum: {
      overline: "İletişim",
      baslik: "CRM veya web — 15 dakikada netleştirelim",
      aciklama:
        "Tekirdağ ve Kapaklı'da müşteri takibi mi, kurumsal web sitesi mi, ikisi birden mi? Ücretsiz keşifte ihtiyacınızı dinleyip aynı gün demo planı paylaşıyoruz.",
      vurguMetin:
        "Projeyi başlatmak veya satın alma sürecine geçmek için formu doldurun ya da WhatsApp üzerinden yazın — ücretsiz keşif için en geç aynı gün dönüş yapıyoruz.",
      hizliBilgiBaslik: "Hızlı bilgi",
      hizliBilgi: [
        "Ortalama ilk dönüş: aynı gün",
        "Demo + fiyat aralığı: 24 saat içinde",
        "Teslim: ihtiyaca göre günler içinde",
      ],
      formBaslik: "Hızlı teklif al",
      formAciklama: "30 saniyede formu gönderin; aynı zamanda WhatsApp'tan direkt yazabilirsiniz.",
      formVarsayilanMesaj: "Molla CRM demo ve fiyat bilgisi almak istiyorum. İşletmem Tekirdağ/Kapaklı bölgesinde.",
    },
    footer: {
      baslik: "Molla Yazılım",
      aciklama:
        "Tekirdağ Kapaklı merkezli yazılım firması. Molla CRM ile müşteri takibi; kurumsal web sitesi ve admin panel ile Google'da görünürlük.",
      whatsappButon: "WhatsApp'tan yazın",
      telif: "CRM & web sitesi · Tekirdağ Kapaklı",
    },
    mobilBar: {
      whatsappLabel: "WhatsApp",
      ctaLabel: "Ücretsiz keşif",
      ctaHref: "#iletisim",
    },
  };
}

async function landingFile(): Promise<string> {
  return path.join(await getDataDir(), "landing.json");
}

function mergeLanding(base: MollaLanding, patch: Partial<MollaLanding>): MollaLanding {
  const mergeSection = <T extends object>(b: T, p?: Partial<T>): T => ({ ...b, ...(p ?? {}) });
  return {
    navbar: mergeSection(base.navbar, patch.navbar),
    hero: mergeSection(base.hero, patch.hero),
    crmBolum: mergeSection(base.crmBolum, patch.crmBolum),
    hizmetlerBolum: mergeSection(base.hizmetlerBolum, patch.hizmetlerBolum),
    demolarBolum: mergeSection(base.demolarBolum, patch.demolarBolum),
    paketlerBolum: mergeSection(base.paketlerBolum, patch.paketlerBolum),
    surecBolum: mergeSection(base.surecBolum, patch.surecBolum),
    sssBolum: mergeSection(base.sssBolum, patch.sssBolum),
    iletisimBolum: mergeSection(base.iletisimBolum, patch.iletisimBolum),
    footer: mergeSection(base.footer, patch.footer),
    mobilBar: mergeSection(base.mobilBar, patch.mobilBar),
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
