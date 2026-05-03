import { BASE_PATH } from "@/lib/base-path";

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ?? "";
  if (raw) {
    if (raw.endsWith(BASE_PATH)) {
      return raw;
    }
    return `${raw}${BASE_PATH}`.replace(/\/$/, "");
  }
  return `http://localhost:3000${BASE_PATH}`.replace(/\/$/, "");
}

export function salonAd(): string {
  return process.env.NEXT_PUBLIC_SALON_AD ?? "Atlas Kuaför Studio";
}

export function salonWhatsapp(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_SALON ?? "905551234567";
}
