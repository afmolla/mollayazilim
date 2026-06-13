import Link from "next/link";
import type { Metadata } from "next";
import { JsonLdLocalBusiness } from "@/components/JsonLd";
import { GradientBg } from "@/components/molla/GradientBg";
import { MollaNavbar } from "@/components/molla/MollaNavbar";
import { MollaFooter } from "@/components/molla/MollaFooter";
import { MollaLeadForm } from "@/components/molla/MollaLeadForm";
import { MollaPageShell } from "@/components/molla/MollaPageShell";
import { ayarlarGetir, type SiteAyarlar } from "@/lib/settings-store";
import { landingGetir, type MollaDemoKey } from "@/lib/molla-landing-store";
import { parseGoogleMapsInput } from "@/lib/footer-social-map";
import { siteOrigin, siteUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const ayar = await ayarlarGetir();
  const base = await siteUrl();
  const canonical = base.endsWith("/") ? base : `${base}/`;
  const title =
    ayar.seoTitle?.trim() ||
    "Molla CRM | Tekirdağ Kapaklı Müşteri Takip & Satış Yönetimi Yazılımı";
  const description =
    ayar.seoDescription?.trim() ||
    "Tekirdağ ve Kapaklı için Türkçe CRM programı: müşteri takibi, satış pipeline, teklif yönetimi. Ücretsiz demo — kurumsal web sitesi ve admin panel hizmetleri.";
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

function demoGosterilir(key: MollaDemoKey, ayar: SiteAyarlar): boolean {
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
    case "esnekAmbalaj":
      return ayar.demoEsnekAmbalajGoster !== false;
    case "crm":
      return ayar.demoCrmGoster !== false;
  }
}

/** ISR: settings en geç ~60 sn içinde yansır; her istekte sıfırdan işlenmez (çok daha hızlı). */
export const revalidate = 60;

export default async function MollaHome() {
  const [ayar, landing] = await Promise.all([ayarlarGetir(), landingGetir()]);
  const h = landing.hero;
  const crm = landing.crmBolum;
  const hz = landing.hizmetlerBolum;
  const dm = landing.demolarBolum;
  const pk = landing.paketlerBolum;
  const sr = landing.surecBolum;
  const sss = landing.sssBolum;
  const il = landing.iletisimBolum;
  const mb = landing.mobilBar;
  const waNum = String(ayar.iletisimWhatsapp ?? ayar.whatsapp ?? "").replace(/\D/g, "");
  const origin = (await siteOrigin()).replace(/\/$/, "");
  const mapBlock = parseGoogleMapsInput(ayar.googleMaps);
  const waHref = waNum
    ? `https://wa.me/${waNum}?text=${encodeURIComponent(landing.navbar.whatsappMesaj)}`
    : "#";
  const gorunurDemoSayisi = dm.gruplar.flatMap((g) => g.items).filter((it) => demoGosterilir(it.key, ayar)).length;
  return (
    <MollaPageShell>
    <>
      <JsonLdLocalBusiness />
      <GradientBg>
        <MollaNavbar navbar={landing.navbar} whatsapp={waNum || "905551234567"} />

      <div className="flex min-h-dvh flex-col">
      <main className="molla-root-main relative z-10 flex-1 scroll-mt-0 pb-20 md:pb-0">
        <section className="mx-auto max-w-6xl px-4 pb-7 pt-0 md:px-6 md:pb-10">
          <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2">
            <div>
              <Pill>{h.pill}</Pill>
              <h1 className="mt-2.5 text-4xl font-extrabold tracking-tight text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.35)] md:mt-3 md:text-5xl">
                {h.baslik}{" "}
                <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-200 to-cyan-200 bg-clip-text text-transparent">
                  {h.baslikVurgu}
                </span>
              </h1>
              <p className="mt-3 max-w-prose text-base text-white/75 md:text-lg">{h.aciklama}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href={h.ctaPrimaryHref}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-black hover:opacity-95"
                >
                  {h.ctaPrimaryLabel}
                </a>
                <a
                  href={h.ctaSecondaryHref}
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  {h.ctaSecondaryLabel}
                </a>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                {h.stats.map((s) => (
                  <Stat key={s.label} label={s.label} value={s.value} />
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-white/70 md:grid-cols-4">
                {h.features.map((f) => (
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
                  {h.previewBaslik}
                </div>
                <div className="grid gap-0 md:grid-cols-2">
                  <div className="p-4">
                    <p className="text-sm font-semibold text-white">{h.previewAltBaslik}</p>
                    <p className="mt-1 text-sm text-white/70">{h.previewAciklama}</p>
                    <div className="mt-4 grid gap-2">
                      {h.previewItems.map((x) => (
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
                      src={h.previewGorselUrl}
                      alt={h.previewGorselAlt}
                      className="absolute inset-0 h-full w-full object-cover opacity-80"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-sm font-semibold text-white">{h.previewGorselCaption}</p>
                      <p className="mt-1 text-xs text-white/70">{h.previewGorselAltBaslik}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <SectionTitle
            anchorId="crm"
            overline={crm.overline}
            title={crm.baslik}
            desc={crm.aciklama}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {crm.ozellikler.map((x) => (
              <div key={x.title} className="rounded-3xl border border-indigo-300/20 bg-indigo-500/[0.08] p-6">
                <p className="text-base font-semibold text-white">{x.title}</p>
                <p className="mt-2 text-sm text-white/70">{x.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={crm.ctaPrimaryHref} className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-black hover:opacity-95">
              {crm.ctaPrimaryLabel}
            </a>
            <a href={crm.ctaSecondaryHref} className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">
              {crm.ctaSecondaryLabel}
            </a>
          </div>
          <p className="mt-4 text-center text-xs text-white/50">{crm.demoGirisNotu}</p>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
          <SectionTitle anchorId="hizmetler" overline={hz.overline} title={hz.baslik} desc={hz.aciklama} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {hz.kartlar.map((x) => (
              <div key={x.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-base font-semibold text-white">{x.title}</p>
                <p className="mt-2 text-sm text-white/70">{x.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/70">
                  {hz.rozetler.map((b) => (
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
          <SectionTitle anchorId="demolar" overline={dm.overline} title={dm.baslik} desc={dm.aciklama} />
          <div className="mt-8 space-y-12">
            {gorunurDemoSayisi === 0 ? (
              <p className="text-center text-sm text-white/65">{dm.bosMesaj}</p>
            ) : (
              dm.gruplar.map((group) => {
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
          <SectionTitle overline={pk.overline} title={pk.baslik} desc={pk.aciklama} />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {pk.paketler.map((p) => (
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
                  {p.featured && p.featuredLabel ? (
                    <span className="rounded-full border border-emerald-300/25 bg-emerald-500/[0.12] px-3 py-1 text-xs font-semibold text-emerald-100">
                      {p.featuredLabel}
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
          <SectionTitle overline={sr.overline} title={sr.baslik} desc={sr.aciklama} />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {sr.adimlar.map((x) => (
              <div key={x.no} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs font-semibold tracking-wide text-white/60">{x.no}</p>
                <p className="mt-2 text-base font-semibold text-white">{x.baslik}</p>
                <p className="mt-2 text-sm text-white/70">{x.aciklama}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-3xl border border-emerald-400/25 bg-emerald-500/[0.10] p-6">
            <p className="text-sm font-semibold text-white">{sr.taahhutBaslik}</p>
            <p className="mt-2 text-sm text-white/80">{sr.taahhutMetin}</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-6 pt-4 md:px-6">
          <SectionTitle overline={sss.overline} title={sss.baslik} desc={sss.aciklama} />
          <div className="mx-auto mt-8 grid max-w-3xl gap-3">
            {sss.sorular.map((x) => (
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
              <p className="text-xs font-semibold tracking-wide text-white/70">{il.overline}</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">{il.baslik}</h2>
              <p className="mt-2.5 text-sm text-white/70 md:text-base">{il.aciklama}</p>
              <p className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.12] px-4 py-3 text-sm text-white/90">
                {il.vurguMetin}
              </p>
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{il.hizliBilgiBaslik}</p>
                <ul className="mt-2 grid gap-1 text-sm text-white/70">
                  {il.hizliBilgi.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
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

            <MollaLeadForm
              sourcePath="/"
              whatsapp={ayar.iletisimWhatsapp ?? ayar.whatsapp}
              defaultMessage={il.formVarsayilanMesaj}
              formBaslik={il.formBaslik}
              formAciklama={il.formAciklama}
            />
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
            {mb.whatsappLabel}
          </a>
          <a
            href={mb.ctaHref}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 text-sm font-semibold text-black"
          >
            {mb.ctaLabel}
          </a>
        </div>
      </div>

      <MollaFooter />
      </div>
    </GradientBg>
    </>
    </MollaPageShell>
  );
}

