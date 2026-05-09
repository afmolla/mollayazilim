import { normalizeExternalUrl } from "@/lib/footer-social-map";

/** Mağaza URL’si veya kök-relative `/apk/...` / tam `https://...` indirme adreslerini çözümler. */
export function resolveDownloadHref(raw: string | undefined, origin: string): string {
  const t = (raw ?? "").trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("/")) {
    const base = origin.replace(/\/+$/, "");
    return `${base}${t}`;
  }
  return normalizeExternalUrl(t);
}
