/** Soyut / markasız stok görseller — panelden değiştirilebilir */

export const ESNEK_AMBALAJ_IMAGES = {
  hero: "https://images.unsplash.com/photo-1618005198919-d8d4b5b322ab?w=1920&q=80",
  sidebar: "https://images.unsplash.com/photo-1579546929518-9e396f3cc770?w=1200&q=80",
  texture1: "https://images.unsplash.com/photo-1557683316-973403b01281?w=800&q=80",
  texture2: "https://images.unsplash.com/photo-1620641788421-7cf1e369ad59?w=800&q=80",
  texture3: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&q=80",
  texture4: "https://images.unsplash.com/photo-1558591710-4bcf4ddd3c55?w=800&q=80",
} as const;

export function normalizeAmbalajImageSrc(src: string | undefined, fallback: string): string {
  const s = src?.trim();
  if (!s) return fallback;
  if (s.startsWith("http") || s.startsWith("/")) return s;
  return fallback;
}
