import { headers } from "next/headers";
import { getSiteContext } from "@/lib/site-context";
import { getRequestSite } from "@/lib/site-request";
import { ayarlarGetir } from "@/lib/settings-store";

/**
 * Vercel’de `NEXT_PUBLIC_SITE_URL` bazen sadece alan adı (şemasız) veriliyor;
 * `metadata` / `new URL` geçerli mutlak URL ister — aksi halde üretimde 500.
 */
export function normalizePublicSiteUrl(raw: string | undefined): string {
  const t = (raw ?? "").trim().replace(/\/$/, "");
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

/**
 * Deploy’da env boşken build zamanı `localhost` gömülür; metadata/RSC üretimde patlayabiliyor.
 * Vercel istek başlıkları + VERCEL_URL ile gerçek kökeni türet.
 */
export function originFromRequestHeaders(h: Headers): string | null {
  const hostRaw = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const host = hostRaw.split(",")[0]?.trim() ?? "";
  if (host && !host.startsWith("localhost") && !host.startsWith("127.")) {
    const proto = (h.get("x-forwarded-proto") ?? "https").split(",")[0]?.trim() || "https";
    return `${proto}://${host}`;
  }
  const vu = process.env.VERCEL_URL?.trim();
  if (vu) {
    const clean = vu.replace(/^https?:\/\//i, "");
    if (clean && !clean.startsWith("localhost")) return `https://${clean}`;
  }
  return null;
}

/**
 * Statik dosyalar (`public/apk/...`) her zaman alan kökünden sunulur; çoklu vitrin önekinden bağımsızdır.
 */
/**
 * robots.txt `Host` ve benzeri için üretim alan adı.
 * localhost / 127.* döndürmez — env yoksa Vercel veya istek başlığından çıkarır.
 */
export async function resolveSiteHost(): Promise<string | undefined> {
  const raw = normalizePublicSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (raw) {
    try {
      const host = new URL(raw).host;
      if (host && !host.startsWith("localhost") && !host.startsWith("127.")) return host;
    } catch {
      /* ignore */
    }
  }
  const vu = process.env.VERCEL_URL?.trim();
  if (vu) {
    const clean = vu.replace(/^https?:\/\//i, "").split("/")[0]?.trim() ?? "";
    if (clean && !clean.startsWith("localhost") && !clean.startsWith("127.")) return clean;
  }
  try {
    const inferred = originFromRequestHeaders(await headers());
    if (inferred) {
      const host = new URL(inferred).host;
      if (host && !host.startsWith("localhost") && !host.startsWith("127.")) return host;
    }
  } catch {
    /* build */
  }
  return undefined;
}

export async function siteOrigin(): Promise<string> {
  const raw = normalizePublicSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (raw) {
    try {
      return new URL(raw).origin;
    } catch {
      /* fall through */
    }
  }
  try {
    const inferred = originFromRequestHeaders(await headers());
    if (inferred) return inferred;
  } catch {
    /* build / özel ortam */
  }
  return "http://localhost:3000";
}

export async function siteUrl(): Promise<string> {
  const ctx = getSiteContext();
  const prefix = ctx?.prefix ?? (await getRequestSite()).prefix;
  const raw = normalizePublicSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (raw) {
    // Kök alan (Molla landing): prefix boş — domain kökü dönsün.
    if (!prefix) return raw;
    if (raw.endsWith(prefix)) {
      return raw;
    }
    return `${raw}${prefix}`.replace(/\/$/, "");
  }
  try {
    const inferred = originFromRequestHeaders(await headers());
    if (inferred) {
      if (!prefix) return inferred;
      if (inferred.endsWith(prefix)) return inferred;
      return `${inferred}${prefix}`.replace(/\/$/, "");
    }
  } catch {
    /* build / özel ortam */
  }
  return `http://localhost:3000${prefix || ""}`.replace(/\/$/, "") || "http://localhost:3000";
}

export async function salonAd(): Promise<string> {
  try {
    const a = await ayarlarGetir();
    if (a.salonAd?.trim()) return a.salonAd.trim();
  } catch {
    /* ignore */
  }
  return process.env.NEXT_PUBLIC_SALON_AD ?? "Atlas Kuaför Studio";
}

export async function salonWhatsapp(): Promise<string> {
  try {
    const a = await ayarlarGetir();
    if (a.whatsapp?.trim()) return a.whatsapp.trim();
  } catch {
    /* ignore */
  }
  return process.env.NEXT_PUBLIC_WHATSAPP_SALON ?? "905551234567";
}
