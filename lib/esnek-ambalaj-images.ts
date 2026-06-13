/** Esnek ambalaj vitrini — Unsplash / stok görselleri */

export const ESNEK_AMBALAJ_IMAGES = {
  hero: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&q=80",
  rulo: "https://images.unsplash.com/photo-1619642751034-765df691d327?w=1200&q=80",
  torba: "https://images.unsplash.com/photo-1604719312566-8912a922856c?w=1200&q=80",
  baski: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c3?w=1200&q=80",
  fabrika: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&q=80",
  gida: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80",
} as const;

export function normalizeAmbalajImageSrc(src: string | undefined, fallback: string): string {
  const s = src?.trim();
  if (!s) return fallback;
  if (s.startsWith("http") || s.startsWith("/")) return s;
  return fallback;
}
