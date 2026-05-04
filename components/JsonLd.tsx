import { siteUrl } from "@/lib/site";
import { ayarlarGetir } from "@/lib/settings-store";
import { getRequestSite } from "@/lib/site-request";

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
  const base = await siteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": isMolla ? "Organization" : isRestaurant ? "Restaurant" : "HairSalon",
    name: isMolla ? "Molla Yazılım" : ayar.salonAd,
    url: base,
    description: isMolla
      ? "Özel yazılım çözümleri, admin panelleri ve sektöre özel sistemler."
      : isRestaurant
      ? "Restoran vitrin: QR menü, rezervasyon ve iletişim."
      : "Modern kuaför ve berber hizmetleri: kesim, sakal, boya ve bakım. Online randevu.",
    address: isMolla
      ? undefined
      : {
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
