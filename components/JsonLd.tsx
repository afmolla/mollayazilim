import { siteUrl } from "@/lib/site";
import type { SiteAyarlar } from "@/lib/settings-store";
import { ayarlarGetir } from "@/lib/settings-store";
import { getRequestSite } from "@/lib/site-request";
import { MOLLA_LANDING_FAQ } from "@/lib/molla-landing-faq";

function normalizeSocialUrl(
  raw: string | undefined,
  kind: "instagram" | "facebook" | "twitter" | "linkedin" | "youtube" | "tiktok",
): string | null {
  const t = raw?.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  const u = t.replace(/^@/, "").replace(/^\//, "");
  switch (kind) {
    case "instagram":
      return `https://www.instagram.com/${u}`;
    case "facebook":
      return `https://www.facebook.com/${u}`;
    case "twitter":
      return `https://twitter.com/${u}`;
    case "linkedin":
      return u.includes("/") ? `https://www.linkedin.com/${u}` : `https://www.linkedin.com/in/${u}`;
    case "youtube":
      return u.startsWith("channel/") || u.startsWith("@")
        ? `https://www.youtube.com/${u}`
        : `https://www.youtube.com/channel/${u}`;
    case "tiktok":
      return `https://www.tiktok.com/@${u.replace(/^@/, "")}`;
    default:
      return null;
  }
}

function sameAsFromAyar(ayar: SiteAyarlar): string[] {
  const urls = [
    normalizeSocialUrl(ayar.instagram, "instagram"),
    normalizeSocialUrl(ayar.facebook, "facebook"),
    normalizeSocialUrl(ayar.twitter, "twitter"),
    normalizeSocialUrl(ayar.linkedin, "linkedin"),
    normalizeSocialUrl(ayar.youtube, "youtube"),
    normalizeSocialUrl(ayar.tiktok, "tiktok"),
  ].filter(Boolean) as string[];
  return urls;
}

export async function JsonLdLocalBusiness() {
  try {
    return await jsonLdBody();
  } catch {
    return null;
  }
}

async function jsonLdBody() {
  const { subdir } = await getRequestSite();
  const ayar = await ayarlarGetir();
  const isMolla = subdir === "molla";
  const isRestaurant = subdir === "restaurant";
  const isEmlak = subdir === "emlak";
  const isAvukat = subdir === "avukat";
  const base = await siteUrl();
  const baseNorm = base.replace(/\/$/, "");
  const logoUrl = `${baseNorm}/icon.svg`;

  if (isMolla) {
    const orgDescription =
      "Tekirdağ Kapaklı merkezli yazılım firması. Molla CRM: Türkçe müşteri takip ve satış yönetimi. Kurumsal web sitesi ve admin panel.";
    const sameAs = sameAsFromAyar(ayar);
    const contactPoint =
      ayar.iletisimTelefon?.trim() || ayar.iletisimEposta?.trim()
        ? [
            {
              "@type": "ContactPoint",
              contactType: "sales",
              ...(ayar.iletisimTelefon?.trim()
                ? { telephone: ayar.iletisimTelefon.trim() }
                : {}),
              ...(ayar.iletisimEposta?.trim() ? { email: ayar.iletisimEposta.trim() } : {}),
              areaServed: "TR",
              availableLanguage: ["Turkish"],
            },
          ]
        : undefined;
    const street = ayar.adresDetay?.trim();
    const graphPayload = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${baseNorm}/#organization`,
          name: "Molla Yazılım",
          url: baseNorm,
          logo: { "@type": "ImageObject", url: logoUrl },
          description: orgDescription,
          ...(sameAs.length ? { sameAs } : {}),
          ...(contactPoint ? { contactPoint } : {}),
          ...(ayar.iletisimEposta ? { email: ayar.iletisimEposta.trim() } : {}),
          ...(ayar.iletisimTelefon ? { telephone: ayar.iletisimTelefon.trim() } : {}),
          ...(street || ayar.sehir
            ? {
                address: {
                  "@type": "PostalAddress",
                  ...(street ? { streetAddress: street } : {}),
                  addressLocality: ayar.sehir?.trim() || "Tekirdağ",
                  ...(ayar.adresKisa?.trim() ? { addressRegion: "Kapaklı" } : {}),
                  addressCountry: "TR",
                },
              }
            : {}),
          areaServed: [{ "@type": "Country", name: "Turkey" }],
        },
        {
          "@type": "WebSite",
          "@id": `${baseNorm}/#website`,
          url: `${baseNorm}/`,
          name: "Molla Yazılım",
          inLanguage: "tr-TR",
          publisher: { "@id": `${baseNorm}/#organization` },
          description: ayar.seoDescription?.trim() || orgDescription,
          isPartOf: { "@id": `${baseNorm}/#organization` },
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${baseNorm}/?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        },
        {
          "@type": "ProfessionalService",
          "@id": `${baseNorm}/#service`,
          name: "Molla Yazılım",
          url: baseNorm,
          image: logoUrl,
          description:
            ayar.seoDescription?.trim() ||
            "CRM programı, müşteri takip yazılımı, satış pipeline ve teklif yönetimi. Tekirdağ Kapaklı KOBİ'ler için Türkçe CRM; kurumsal web sitesi ve admin panel.",
          provider: { "@id": `${baseNorm}/#organization` },
          areaServed: [
            { "@type": "City", name: "Kapaklı" },
            { "@type": "AdministrativeArea", name: "Tekirdağ" },
            { "@type": "Country", name: "Turkey" },
          ],
          knowsAbout: [
            "CRM programı",
            "müşteri takip programı",
            "satış takip yazılımı",
            "müşteri ilişkileri yönetimi",
            "pipeline yönetimi",
            "teklif takip",
            "KOBİ CRM",
            "kurumsal web sitesi",
            "admin panel",
            "SEO",
            "Tekirdağ",
            "Kapaklı",
            "Çerkezköy",
            "Çorlu",
          ],
        },
        {
          "@type": "SoftwareApplication",
          "@id": `${baseNorm}/#crm`,
          name: "Molla CRM",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: "https://crm.mollayazilim.com",
          description: "Türkçe müşteri takip ve satış yönetimi CRM yazılımı. Pipeline, teklif, görev ve ekip yönetimi.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "TRY",
            description: "Ücretsiz demo hesabı",
          },
          provider: { "@id": `${baseNorm}/#organization` },
        },
        {
          "@type": "FAQPage",
          "@id": `${baseNorm}/#faq`,
          mainEntity: MOLLA_LANDING_FAQ.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.a,
            },
          })),
        },
      ],
    };
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graphPayload) }}
      />
    );
  }

  if (isAvukat) {
    const avukatPayload = {
      "@context": "https://schema.org",
      "@type": "LegalService",
      name: ayar.salonAd,
      url: base,
      description:
        ayar.seoDescription?.trim() ||
        "Demo hukuk bürosu vitrin — uzmanlıklar ve görüşme talebi.",
      ...(ayar.adresDetay?.trim()
        ? {
            address: {
              "@type": "PostalAddress",
              streetAddress: ayar.adresDetay,
              addressLocality: ayar.sehir || "Tekirdağ",
              addressCountry: "TR",
            },
          }
        : {}),
      ...(ayar.iletisimTelefon?.trim() ? { telephone: ayar.iletisimTelefon.trim() } : {}),
    };
    return (
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(avukatPayload) }} />
    );
  }

  if (isEmlak) {
    const emlakPayload = {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      name: ayar.salonAd,
      url: base,
      description:
        ayar.seoDescription?.trim() ||
        "Emlak vitrin demo — ilan listesi ve iletişim.",
      address: {
        "@type": "PostalAddress",
        addressLocality: ayar.sehir || "Tekirdağ",
        streetAddress: ayar.adresDetay || "Kapaklı, Tekirdağ",
        addressCountry: "TR",
      },
      ...(ayar.iletisimTelefon?.trim() ? { telephone: ayar.iletisimTelefon.trim() } : {}),
    };
    return (
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(emlakPayload) }} />
    );
  }

  const data = {
    "@context": "https://schema.org",
    "@type": isRestaurant ? "Restaurant" : "HairSalon",
    name: ayar.salonAd,
    url: base,
    description: isRestaurant
      ? "Restoran vitrin: QR menü, rezervasyon ve iletişim."
      : "Kuaför ve berber demo vitrin — randevu ve iletişim.",
    address: {
      "@type": "PostalAddress",
      addressLocality: ayar.sehir || "Tekirdağ",
      streetAddress: ayar.adresDetay || "Kapaklı, Tekirdağ",
      addressCountry: "TR",
    },
    priceRange: "$$",
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
