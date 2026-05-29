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
  if (host) {
    const protoHeader = h.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const proto =
      protoHeader ||
      (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
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
export function isUsablePublicHost(host: string): boolean {
  if (!host || host.startsWith("localhost") || host.startsWith("127.")) return false;
  if (host.endsWith(".vercel.app")) return false;
  // Ham IP adresi metadata / canonical / JSON-LD'de görünmesin
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return false;
  if (host.includes(":") && /^\[?[\da-f:]+\]?$/i.test(host.split(":")[0] ?? "")) return false;
  return true;
}

function envOriginIfPublic(): string | null {
  const raw = normalizePublicSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (isUsablePublicHost(u.host)) return u.origin;
  } catch {
    /* ignore */
  }
  return null;
}

export async function resolveSiteHost(): Promise<string | undefined> {
  const raw = normalizePublicSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (raw) {
    try {
      const host = new URL(raw).host;
      if (isUsablePublicHost(host)) return host;
    } catch {
      /* ignore */
    }
  }
  try {
    const inferred = originFromRequestHeaders(await headers());
    if (inferred) {
      const host = new URL(inferred).host;
      if (isUsablePublicHost(host)) return host;
    }
  } catch {
    /* build */
  }
  const vu = process.env.VERCEL_URL?.trim();
  if (vu) {
    const clean = vu.replace(/^https?:\/\//i, "").split("/")[0]?.trim() ?? "";
    if (isUsablePublicHost(clean)) return clean;
  }
  return undefined;
}

export async function siteOrigin(): Promise<string> {
  const fromEnv = envOriginIfPublic();
  if (fromEnv) return fromEnv;
  try {
    const inferred = originFromRequestHeaders(await headers());
    if (inferred) {
      try {
        if (isUsablePublicHost(new URL(inferred).host)) return inferred;
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* build / özel ortam */
  }
  return "http://localhost";
}

export async function siteUrl(): Promise<string> {
  const ctx = getSiteContext();
  const prefix = ctx?.prefix ?? (await getRequestSite()).prefix;
  const envOrigin = envOriginIfPublic();
  if (envOrigin) {
    if (!prefix) return envOrigin;
    if (envOrigin.endsWith(prefix)) return envOrigin;
    return `${envOrigin}${prefix}`.replace(/\/$/, "");
  }
  try {
    const inferred = originFromRequestHeaders(await headers());
    if (inferred) {
      const host = new URL(inferred).host;
      if (isUsablePublicHost(host)) {
        if (!prefix) return inferred;
        if (inferred.endsWith(prefix)) return inferred;
        return `${inferred}${prefix}`.replace(/\/$/, "");
      }
    }
  } catch {
    /* build / özel ortam */
  }
  return `http://localhost${prefix || ""}`.replace(/\/$/, "") || "http://localhost";
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
