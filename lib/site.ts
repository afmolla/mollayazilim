import { getBasePath } from "@/lib/base-path";
import { ayarlarGetir } from "@/lib/settings-store";

export async function siteUrl(): Promise<string> {
  const base = getBasePath();
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ?? "";
  if (raw) {
    if (raw.endsWith(base)) {
      return raw;
    }
    return `${raw}${base}`.replace(/\/$/, "");
  }
  return `http://localhost:3000${base}`.replace(/\/$/, "");
}

/** Sunucu bileşenlerinde ayarlardan; istemcide env fallback */
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
