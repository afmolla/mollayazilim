import { siteUrl } from "@/lib/site";
import { ayarlarGetir } from "@/lib/settings-store";
import { getRequestSite } from "@/lib/site-request";
import { MOLLA_LANDING_FAQ } from "@/lib/molla-landing-faq";

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
      "Kurumsal web sitesi, özel yazılım ve yönetim paneli. QR menü, randevu ve sektörel hazır demolar — SEO uyumlu teslim.";
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
          ...(ayar.iletisimEposta ? { email: ayar.iletisimEposta.trim() } : {}),
          ...(ayar.iletisimTelefon ? { telephone: ayar.iletisimTelefon.trim() } : {}),
        },
        {
          "@type": "WebSite",
          "@id": `${baseNorm}/#website`,
          url: `${baseNorm}/`,
          name: "Molla Yazılım",
          inLanguage: "tr-TR",
          publisher: { "@id": `${baseNorm}/#organization` },
          description: ayar.seoDescription?.trim() || orgDescription,
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
              addressLocality: ayar.sehir || "İstanbul",
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
        addressLocality: ayar.sehir || "İstanbul",
        streetAddress: ayar.adresDetay || "İstanbul",
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
      addressLocality: ayar.sehir || "İstanbul",
      streetAddress: ayar.adresDetay || "İstanbul",
      addressCountry: "TR",
    },
    priceRange: "$$",
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
