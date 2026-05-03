import { siteUrl } from "@/lib/site";
import { ayarlarGetir } from "@/lib/settings-store";

export async function JsonLdLocalBusiness() {
  const ayar = await ayarlarGetir();
  const data = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: ayar.salonAd,
    url: siteUrl(),
    description:
      "Modern kuaför ve berber hizmetleri: kesim, sakal, boya ve bakım. Online randevu.",
    address: {
      "@type": "PostalAddress",
      addressLocality: ayar.sehir || "İstanbul",
      streetAddress: ayar.adresDetay,
      addressCountry: "TR",
    },
    priceRange: "$$",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
