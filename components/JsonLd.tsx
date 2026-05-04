import { siteUrl } from "@/lib/site";
import { ayarlarGetir } from "@/lib/settings-store";
import { getRequestSite } from "@/lib/site-request";

export async function JsonLdLocalBusiness() {
  const { subdir } = await getRequestSite();
  const ayar = await ayarlarGetir();
  const isRestaurant = subdir === "restaurant";
  const base = await siteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": isRestaurant ? "Restaurant" : "HairSalon",
    name: ayar.salonAd,
    url: base,
    description: isRestaurant
      ? "Restoran vitrin: QR menü, rezervasyon ve iletişim."
      : "Modern kuaför ve berber hizmetleri: kesim, sakal, boya ve bakım. Online randevu.",
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
