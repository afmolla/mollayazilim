/** Ayarlardan gelen harita / sosyal alanlarını güvenli şekilde ayrıştırır */

export function normalizeExternalUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function isAllowedMapEmbedSrc(src: string): boolean {
  try {
    const u = new URL(src);
    const h = u.hostname.toLowerCase();
    if (h === "maps.google.com" || h === "www.google.com" || h === "google.com") return true;
    if (h.endsWith(".google.com") || h.endsWith(".googleusercontent.com")) return true;
    return false;
  } catch {
    return false;
  }
}

export type MapsBlock = { type: "iframe"; src: string } | { type: "link"; href: string };

/** Google Maps: iframe gömme kodu, /maps/embed URL veya normal harita bağlantısı */
export function parseGoogleMapsInput(raw: string | undefined): MapsBlock | null {
  if (!raw?.trim()) return null;
  const t = raw.trim();

  if (/<iframe/i.test(t)) {
    const m = t.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    const src = m?.[1]?.trim();
    if (src && isAllowedMapEmbedSrc(src)) return { type: "iframe", src };
    const anyUrl = t.match(/https?:\/\/[^\s"'<>]+/);
    if (anyUrl?.[0]) {
      const href = anyUrl[0].replace(/&amp;/g, "&");
      return { type: "link", href: normalizeExternalUrl(href) };
    }
    return null;
  }

  const href = normalizeExternalUrl(t);
  if (!href) return null;
  if (/\/maps\/embed/i.test(href) && isAllowedMapEmbedSrc(href)) {
    return { type: "iframe", src: href };
  }
  return { type: "link", href };
}
