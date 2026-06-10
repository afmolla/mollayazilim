import Link from "next/link";
import type { Metadata } from "next";
import { JsonLdLocalBusiness } from "@/components/JsonLd";
import { GradientBg } from "@/components/molla/GradientBg";
import { MollaNavbar } from "@/components/molla/MollaNavbar";
import { MollaFooter } from "@/components/molla/MollaFooter";
import { MollaLeadForm } from "@/components/molla/MollaLeadForm";
import { ayarlarGetir, type SiteAyarlar } from "@/lib/settings-store";
import { parseGoogleMapsInput } from "@/lib/footer-social-map";
import { siteOrigin, siteUrl } from "@/lib/site";
import { MOLLA_LANDING_FAQ } from "@/lib/molla-landing-faq";

export async function generateMetadata(): Promise<Metadata> {
  const ayar = await ayarlarGetir();
  const base = await siteUrl();
  const canonical = base.endsWith("/") ? base : `${base}/`;
  const title =
    ayar.seoTitle?.trim() ||
    "Molla Yazılım | Tekirdağ Kapaklı Web Sitesi, QR Menü & Admin Panel";
  const description =
    ayar.seoDescription?.trim() ||
    "Molla Yazılım; kurumsal web sitesi ve yönetim paneli geliştirir. Hazır sektörel vitrin demolarıyla hızlı başlangıç, ücretsiz keşif ve SEO uyumlu yayın.";
  const keywords = ayar.seoKeywords
    ?.split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  const ogImage = ayar.seoOgImage?.trim();
  const googleVer = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
  const yandexVer = process.env.NEXT_PUBLIC_YANDEX_VERIFICATION?.trim();

  return {
    title: { absolute: title },
    description,
    keywords: keywords?.length ? keywords : undefined,
    robots:
      ayar.seoIndex === false
        ? { index: false, follow: true }
        : {
            index: true,
            follow: true,
            googleBot: {
              index: true,
              follow: true,
              "max-video-preview": -1,
              "max-image-preview": "large",
              "max-snippet": -1,
            },
          },
    alternates: { canonical },
    ...(googleVer || yandexVer
      ? {
          verification: {
            ...(googleVer ? { google: googleVer } : {}),
            ...(yandexVer ? { yandex: yandexVer } : {}),
          },
        }
      : {}),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Molla Yazılım",
      locale: "tr_TR",
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
      {children}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs font-semibold text-white/60">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function SectionTitle(props: {
  overline: string;
  title: string;
  desc: string;
  anchorId?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {props.anchorId ? (
        <span
          id={props.anchorId}
          className="block scroll-mt-[calc(var(--header-h)+5rem)]"
          aria-hidden="true"
        />
      ) : null}
      <p className="text-xs font-semibold tracking-wide text-white/70">{props.overline}</p>
      <h2 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">{props.title}</h2>
      <p className="mt-3 text-sm text-white/70 md:text-base">{props.desc}</p>
    </div>
  );
}

const FEATURES = [
  { title: "Hızlı demo", desc: "Hazır altyapı + özelleştirme ile 24 saat içinde demo." },
  { title: "Mobil + SEO", desc: "Hızlı açılan, Google uyumlu modern sayfalar." },
  { title: "Panel dahil", desc: "İçerik, medya, menüler, ayarlar — tek panel." },
  { title: "Ölçülebilir", desc: "Form/WhatsApp lead takibi ve net dönüşüm akışı." },
];

type DemoKey = "kuafor" | "kuaforKadin" | "restaurant" | "emlak" | "avukat" | "otoyikama" | "crm";

type ShowcaseItem = {
  key: DemoKey;
  title: string;
  href: string;
  meta: string;
  external?: boolean;
  badge?: "Demo" | "Uygulama";
  secondaryHref?: string;
  secondaryLabel?: string;
  primaryLabel?: string;
};

function demoGosterilir(key: DemoKey, ayar: SiteAyarlar): boolean {
  /** Yerelde panelden kapatılmış olsa bile demoları göster (proxy + vitrin testi için).
   * Üretimde panel bayrakları geçerlidir. Yerelde bayrakları dinlemek için:
   * NEXT_PUBLIC_RESPECT_DEMO_FLAGS=1 */
  const respectFlags =
    process.env.NODE_ENV !== "development" || process.env.NEXT_PUBLIC_RESPECT_DEMO_FLAGS === "1";
  if (!respectFlags) return true;

  switch (key) {
    case "kuafor":
      return ayar.demoKuaforGoster !== false;
    case "kuaforKadin":
      return ayar.demoKuaforKadinGoster !== false;
    case "restaurant":
      return ayar.demoRestaurantGoster !== false;
    case "emlak":
      return ayar.demoEmlakGoster !== false;
    case "avukat":
      return ayar.demoAvukatGoster !== false;
    case "otoyikama":
      return ayar.demoOtoyikamaGoster !== false;
    case "crm":
      return ayar.demoCrmGoster !== false;
  }
}

/** Ana vitrin (#demolar) — kuaför iki ayrı kart; avukat tek blok; restoran+emlak birlikte */
const DEMO_GROUPS: readonly {
  id: string;
  title: string;
  desc: string;
  items: readonly ShowcaseItem[];
}[] = [
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
    desc: "Restoran QR menü, emlak ilan vitrinleri ve oto yıkama / detailing.",
    items: [
      { key: "restaurant", title: "Restoran Demo", href: "/restaurant", meta: "QR menü + rezervasyon" },
      { key: "emlak", title: "Emlak Demo", href: "/emlak", meta: "İlan + filtreleme" },
      { key: "otoyikama", title: "Oto Yıkama Demo", href: "/otoyikama", meta: "Yıkama · pasta cila · seramik" },
    ],
  },
];

const PACKAGES = [
  {
    title: "Başlangıç",
    badge: "Kurumsal",
    desc: "Tek sayfa veya çoklu sayfa kurumsal web sitesi. Hızlı yayına çıkın.",
    items: ["Modern tasarım", "Mobil uyum", "SEO temel kurulum", "İletişim/WhatsApp CTA"],
    cta: "Teklif al",
    href: "#iletisim",
    featured: false,
  },
  {
    title: "Pro",
    badge: "Vitrin + Panel",
    desc: "İçerik yönetimi paneli ile siteyi kendiniz yönetin. Lead’ler panelde toplansın.",
    items: ["Admin paneli", "Menü & sayfa yönetimi", "Medya yöneticisi", "Lead formu + takip"],
    cta: "Demo + teklif iste",
    href: "#iletisim",
    featured: true,
  },
  {
    title: "Sektörel",
    badge: "Hazır sistem",
    desc: "Kuaför, restoran, emlak, oto yıkama, hukuk gibi hazır demoları işletmenize göre uyarlayalım.",
    items: ["Hazır demo altyapısı", "Hızlı özelleştirme", "İhtiyaca göre modül", "Yedekleme & bakım opsiyonu"],
    cta: "Demoları incele",
    href: "#demolar",
    featured: false,
  },
] as const;

/** ISR: settings en geç ~60 sn içinde yansır; her istekte sıfırdan işlenmez (çok daha hızlı). */
export const revalidate = 60;

export default async function MollaHome() {
  const ayar = await ayarlarGetir();
  const origin = (await siteOrigin()).replace(/\/$/, "");
  const mapBlock = parseGoogleMapsInput(ayar.googleMaps);
  const waDigits = String(ayar.iletisimWhatsapp ?? ayar.whatsapp ?? "").replace(/\D/g, "");
  const waHref = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent("Merhaba, web sitesi / panel teklifi almak istiyorum.")}`
    : "#";
  const gorunurDemoSayisi = DEMO_GROUPS.flatMap((g) => g.items).filter((it) =>
    demoGosterilir(it.key, ayar),
  ).length;
  return (
    <>
      <JsonLdLocalBusiness />
      <GradientBg>
        <MollaNavbar />

      <div className="flex min-h-dvh flex-col">
      <main className="molla-root-main relative z-10 flex-1 scroll-mt-0 pb-20 md:pb-0">
        <section className="mx-auto max-w-6xl px-4 pb-7 pt-0 md:px-6 md:pb-10">
          <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2">
            <div>
              <Pill>Web sitesi · Admin panel · Sektörel demo</Pill>
              <h1 className="mt-2.5 text-4xl font-extrabold tracking-tight text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.35)] md:mt-3 md:text-5xl">
                İşletmeniz İçin{" "}
                <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-200 to-cyan-200 bg-clip-text text-transparent">
                  Satış Odaklı Web Sitesi
                </span>
              </h1>
              <p className="mt-3 max-w-prose text-base text-white/75 md:text-lg">
                Molla Yazılım; işletmenize özel <strong className="text-white">web sitesi</strong> ve{" "}
                <strong className="text-white">yönetim paneli</strong> geliştirir. Amacımız: ziyaretçi geldiğinde 3 saniyede
                “ne satıyorsunuz?” net olsun ve dönüşüm (WhatsApp / form / randevu) aksın.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href="#demolar"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-black hover:opacity-95"
                >
                  Demo gör
                </a>
                <a
                  href="#iletisim"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Teklif al
                </a>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="Ücretsiz keşif" value="15 dk görüşme" />
                <Stat label="Demo süresi" value="24 saat" />
                <Stat label="Yayına çıkış" value="3–10 gün" />
                <Stat label="Dönüş takibi" value="Panel + lead" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-white/70 md:grid-cols-4">
                {FEATURES.map((f) => (
                  <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="font-semibold text-white">{f.title}</p>
                    <p className="mt-1 leading-snug">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-br from-indigo-500/20 via-fuchsia-500/10 to-cyan-400/10 blur-2xl" />
              <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/30 shadow-2xl">
                <div className="border-b border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70">
                  Panel önizleme (demo)
                </div>
                <div className="grid gap-0 md:grid-cols-2">
                  <div className="p-4">
                    <p className="text-sm font-semibold text-white">İçerik & menü yönetimi</p>
                    <p className="mt-1 text-sm text-white/70">
                      Sayfaları ve menüleri panelden yönetin, anında yayına yansısın.
                    </p>
                    <div className="mt-4 grid gap-2">
                      {[
                        "Randevular / rezervasyon",
                        "İlanlar · hukuk vitrinleri",
                        "Medya yöneticisi",
                        "QR menü",
                        "Yedekleme",
                      ].map((x) => (
                        <div
                          key={x}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80"
                        >
                          {x}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="relative min-h-[240px] border-t border-white/10 md:border-l md:border-t-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80"
                      alt="Dashboard görseli"
                      className="absolute inset-0 h-full w-full object-cover opacity-80"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-sm font-semibold text-white">Satış odaklı vitrin</p>
                      <p className="mt-1 text-xs text-white/70">
                        Premium görünüm, hızlı geçişler, SEO uyumlu sayfalar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
          <SectionTitle
            anchorId="hizmetler"
            overline="Hizmetler"
            title="Sektöre özel hazır sistemler + özel geliştirme"
            desc="İhtiyaca göre hazır demoları özelleştiriyor veya sıfırdan özel yazılım geliştiriyoruz."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Kuaför (erkek & kadın)",
                desc: "İki ayrı demo vitrin; randevu akışı, içerik ve panel — berber ve kadın salonu tasarımları.",
              },
              { title: "Restoran Sistemi", desc: "QR menü, rezervasyon, masa yönetimi." },
              { title: "Emlak Sistemi", desc: "İlan yönetimi, filtreleme, admin paneli." },
              { title: "Avukatlık Vitrini", desc: "Hukuk odaklı sayfalar, görüşme talebi + panel." },
            ].map((x) => (
              <div key={x.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-base font-semibold text-white">{x.title}</p>
                <p className="mt-2 text-sm text-white/70">{x.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/70">
                  {["Modern UI", "Panel dahil", "Hızlı kurulum"].map((b) => (
                    <span key={b} className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-4 pt-6 md:px-6 md:pb-10">
          <SectionTitle
            anchorId="demolar"
            overline="Demo / Projeler"
            title="Demolar ve yazılım ürünleri"
            desc="Sektörel vitrin demoları ve Molla CRM — örnek siteler gerçek bir işletmeyi temsil etmez; her kartta vitrin + panel (veya uygulama girişi) akışını görebilirsiniz."
          />
          <div className="mt-8 space-y-12">
            {gorunurDemoSayisi === 0 ? (
              <p className="text-center text-sm text-white/65">
                Bu demolar şu an kapalı. Yönetim panelinde <strong className="text-white">Portföy</strong> sekmesinden
                tekrar açabilirsiniz.
              </p>
            ) : (
              DEMO_GROUPS.map((group) => {
                const kartlar = group.items.filter((it) => demoGosterilir(it.key, ayar));
                if (kartlar.length === 0) return null;
                return (
                  <div key={group.id}>
                    <h3 className="text-lg font-bold tracking-tight text-white md:text-xl">{group.title}</h3>
                    <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-white/65">{group.desc}</p>
                    <div
                      className={
                        group.id === "avukat" || group.id === "yazilim"
                          ? "mt-5 grid max-w-md gap-4 sm:grid-cols-1"
                          : "mt-5 grid gap-4 sm:grid-cols-2"
                      }
                    >
                      {kartlar.map((p) => {
                        const badge = p.badge ?? "Demo";
                        const badgeClass =
                          badge === "Uygulama"
                            ? "border-indigo-300/35 bg-indigo-500/15 text-indigo-100"
                            : "border-amber-400/35 bg-amber-500/15 text-amber-100";
                        const primaryLabel = p.primaryLabel ?? "Siteyi aç";
                        const secondaryHref = p.secondaryHref ?? `${p.href}/panel`;
                        const secondaryLabel = p.secondaryLabel ?? "Paneli aç";
                        const displayUrl = p.external ? p.href : `${origin}${p.href}`;
                        const primaryClass =
                          "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-black hover:opacity-95";
                        const secondaryClass =
                          "inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10";
                        return (
                          <div
                            key={p.key}
                            className="group rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-0.5 hover:bg-white/7 hover:shadow-xl"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <p className="min-w-0 flex-1 text-base font-semibold text-white">{p.title}</p>
                              <span
                                className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
                              >
                                {badge}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-white/70">{p.meta}</p>
                            <div className="mt-5 flex flex-wrap gap-2">
                              {p.external ? (
                                <a href={p.href} className={primaryClass}>
                                  {primaryLabel}{" "}
                                  <span className="ml-1 inline-block transition group-hover:translate-x-0.5">→</span>
                                </a>
                              ) : (
                                <Link href={p.href} prefetch={false} className={primaryClass}>
                                  {primaryLabel}{" "}
                                  <span className="ml-1 inline-block transition group-hover:translate-x-0.5">→</span>
                                </Link>
                              )}
                              {p.external ? (
                                <a href={secondaryHref} className={secondaryClass}>
                                  {secondaryLabel}
                                </a>
                              ) : (
                                <Link href={secondaryHref} prefetch={false} className={secondaryClass}>
                                  {secondaryLabel}
                                </Link>
                              )}
                            </div>
                            <p className="mt-4 break-all font-mono text-[11px] leading-snug text-white/45" title="Tam adres">
                              {displayUrl}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <SectionTitle
            overline="Paketler"
            title="İhtiyacınıza göre net başlangıç"
            desc="Önce hızlı demo çıkarıyoruz; sonra paketi işletmenize göre netleştiriyoruz."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {PACKAGES.map((p) => (
              <div
                key={p.title}
                className={[
                  "rounded-3xl border p-6",
                  p.featured
                    ? "border-fuchsia-300/30 bg-gradient-to-b from-white/10 to-white/5 shadow-2xl"
                    : "border-white/10 bg-white/5",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-white">{p.title}</p>
                    <p className="mt-1 text-xs font-semibold text-white/60">{p.badge}</p>
                  </div>
                  {p.featured ? (
                    <span className="rounded-full border border-emerald-300/25 bg-emerald-500/[0.12] px-3 py-1 text-xs font-semibold text-emerald-100">
                      En popüler
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm text-white/70">{p.desc}</p>
                <ul className="mt-4 grid gap-2 text-sm text-white/75">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <span className="mt-[0.22rem] h-1.5 w-1.5 shrink-0 rounded-full bg-white/40" aria-hidden="true" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <a
                    href={p.href}
                    className={[
                      "inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold",
                      p.featured
                        ? "bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 text-black hover:opacity-95"
                        : "border border-white/15 bg-white/5 text-white hover:bg-white/10",
                    ].join(" ")}
                  >
                    {p.cta}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <SectionTitle
            overline="Süreç"
            title="3 adımda yayına"
            desc="Sürpriz yok: kapsam, demo, yayına çıkış. Hepsi net planla."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Keşif (15 dk)",
                d: "Sektör, hedef, örnek siteler ve içerik ihtiyacı netleşir.",
              },
              {
                n: "02",
                t: "Demo (24 saat)",
                d: "Tasarım + akış + CTA’lar demo üzerinde görünür hale gelir.",
              },
              {
                n: "03",
                t: "Yayına çıkış (3–10 gün)",
                d: "Alan adı, SEO temel kurulum, hız ve takip ile canlıya alınır.",
              },
            ].map((x) => (
              <div key={x.n} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs font-semibold tracking-wide text-white/60">{x.n}</p>
                <p className="mt-2 text-base font-semibold text-white">{x.t}</p>
                <p className="mt-2 text-sm text-white/70">{x.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-3xl border border-emerald-400/25 bg-emerald-500/[0.10] p-6">
            <p className="text-sm font-semibold text-white">Taahhüt</p>
            <p className="mt-2 text-sm text-white/80">
              İlk görüşmeden sonra <strong className="text-white">24 saat içinde demo planı</strong> ve{" "}
              <strong className="text-white">teslim takvimi</strong> paylaşırız. Uymuyorsa başlamayız.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-6 pt-4 md:px-6">
          <SectionTitle
            overline="SSS"
            title="Sık sorulan sorular"
            desc="Netleştirelim: süreç, teslim ve içerik yönetimi."
          />
          <div className="mx-auto mt-8 grid max-w-3xl gap-3">
            {MOLLA_LANDING_FAQ.map((x) => (
              <details
                key={x.q}
                className="group rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-white/90">
                  <span>{x.q}</span>
                  <span className="float-right text-white/50 group-open:text-white/80" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-white/70">{x.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
          <div className="grid gap-6 md:grid-cols-2 md:items-start">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 md:p-7">
              <span
                id="iletisim"
                className="block scroll-mt-[calc(var(--header-h)+5rem)]"
                aria-hidden="true"
              />
              <p className="text-xs font-semibold tracking-wide text-white/70">İletişim</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
                Projeni 15 dakikada netleştirelim
              </h2>
              <p className="mt-2.5 text-sm text-white/70 md:text-base">
                Hangi sektörde olursanız olun (kuaför, restoran, emlak…), mevcut demoları işletmene göre uyarlayıp hızlıca
                yayına alabiliriz.
              </p>
              <p className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.12] px-4 py-3 text-sm text-white/90">
                Projeyi başlatmak veya satın alma sürecine geçmek için formu doldurun ya da WhatsApp üzerinden yazın —
                ücretsiz keşif için en geç aynı gün dönüş yapıyoruz.
              </p>
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">Hızlı bilgi</p>
                <ul className="mt-2 grid gap-1 text-sm text-white/70">
                  <li>• Ortalama ilk dönüş: aynı gün</li>
                  <li>• Demo + fiyat aralığı: 24 saat içinde</li>
                  <li>• Teslim: ihtiyaca göre günler içinde</li>
                </ul>
              </div>
              {mapBlock?.type === "iframe" ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-sm">
                  <iframe
                    title="Google Haritalar"
                    src={mapBlock.src}
                    className="h-[min(50vh,300px)] w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              ) : mapBlock?.type === "link" ? (
                <div className="mt-4">
                  <a
                    href={mapBlock.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Haritada aç
                  </a>
                </div>
              ) : null}
            </div>

            <MollaLeadForm sourcePath="/" whatsapp={ayar.iletisimWhatsapp ?? ayar.whatsapp} />
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-white/10 bg-[#070616]/95 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[#25D366] text-sm font-semibold text-white"
          >
            WhatsApp
          </a>
          <a
            href="#iletisim"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 text-sm font-semibold text-black"
          >
            Teklif al
          </a>
        </div>
      </div>

      <MollaFooter />
      </div>
    </GradientBg>
    </>
  );
}

