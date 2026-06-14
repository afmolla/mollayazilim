/** Unsplash License — markasız ürün / üretim görselleri (panelden değiştirilebilir) */

const q = (id: string, w: number) =>
  `https://images.unsplash.com/${id}?w=${w}&q=88&auto=format&fit=crop`;

export const ESNEK_AMBALAJ_IMAGES = {
  /** Valfli / kilitli doypack — hero */
  hero: q("photo-1706881811917-6590b1054050", 1920),
  /** Çoklu stand-up pouch — yan kart */
  sidebar: q("photo-1706881811952-31148fe91adc", 1200),
  doypack: q("photo-1706881811917-6590b1054050", 1200),
  quadro: q("photo-1703564202740-e9805c4a14ea", 1200),
  flatBottom: q("photo-1706881811952-31148fe91adc", 1200),
  torbaRulo: q("photo-1581091226825-a6a2a5aee158", 1200),
  baski: q("photo-1758183961426-88d64eb5f787", 1200),
  etiketHat: q("photo-1773525912464-d2640e7aff9c", 1200),
  gida: q("photo-1706881811952-31148fe91adc", 1200),
  icecek: q("photo-1706881811917-6590b1054050", 1200),
  endustri: q("photo-1581091226825-a6a2a5aee158", 1200),
  /** Geriye dönük fallback anahtarları */
  texture1: q("photo-1706881811917-6590b1054050", 800),
  texture2: q("photo-1703564202740-e9805c4a14ea", 800),
  texture3: q("photo-1581091226825-a6a2a5aee158", 800),
  texture4: q("photo-1758183961426-88d64eb5f787", 800),
} as const;

export function normalizeAmbalajImageSrc(src: string | undefined, fallback: string): string {
  const s = src?.trim();
  if (!s) return fallback;
  if (s.startsWith("http") || s.startsWith("/")) return s;
  return fallback;
}
