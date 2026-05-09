import type { QrMenuData } from "./types";
import Constants from "expo-constants";

/** Üretim / LAN için `.env` içinde tanımlayın: EXPO_PUBLIC_API_BASE=https://domain.com */
const BASE = (process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:3000").replace(/\/+$/, "");

const SITE_HEADERS = {
  "x-site-prefix": "/restaurant",
  "x-data-subdir": "restaurant",
} as const;

/** `app.json` / Expo config ile uyumlu — panel `mobilMinVersiyon` ile karşılaştırılır */
export function clientVersionDisplay(): string {
  return Constants.expoConfig?.version ?? "0.0.0";
}

function mobileHeaders(): Record<string, string> {
  return {
    ...SITE_HEADERS,
    "x-app-version": clientVersionDisplay(),
  };
}

export type ApiMenuResponse = { ok: true; menu: QrMenuData } | { ok: false; error?: string };

export async function fetchPublicMenu(): Promise<
  ApiMenuResponse | { ok: false; code: "APP_UPDATE_REQUIRED"; minVersion?: string; clientVersion?: string }
> {
  const res = await fetch(`${BASE}/api/public/menu`, { headers: mobileHeaders() });
  const j = (await res.json()) as ApiMenuResponse & {
    code?: string;
    minVersion?: string;
    clientVersion?: string;
  };
  if (res.status === 403 && j.code === "APP_UPDATE_REQUIRED") {
    return {
      ok: false,
      code: "APP_UPDATE_REQUIRED",
      minVersion: j.minVersion,
      clientVersion: j.clientVersion,
    };
  }
  return j as ApiMenuResponse;
}

export async function submitPublicOrder(payload: {
  telefon: string;
  musteriAd?: string;
  adres?: string;
  notlar?: string;
  satirlar: { urunId: string; adet: number }[];
}): Promise<{
  ok: boolean;
  id?: string;
  error?: string;
  code?: string;
  minVersion?: string;
  clientVersion?: string;
}> {
  const res = await fetch(`${BASE}/api/public/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...mobileHeaders() },
    body: JSON.stringify(payload),
  });
  const j = (await res.json()) as {
    ok?: boolean;
    id?: string;
    error?: string;
    code?: string;
    minVersion?: string;
    clientVersion?: string;
  };
  return {
    ok: Boolean(j.ok),
    id: j.id,
    error: j.error,
    code: j.code,
    minVersion: j.minVersion,
    clientVersion: j.clientVersion,
  };
}

/** Açılışta: sunucu zorunlu sürüm + sipariş açık mı */
export async function fetchAppMeta(): Promise<
  | {
      status: "ok";
      mobilSiparisAcik: boolean;
      minAppVersion: string | null;
      clientVersion: string;
    }
  | { status: "update_required"; minVersion: string; clientVersion: string }
  | { status: "error"; message: string }
> {
  const res = await fetch(`${BASE}/api/public/app-meta`, { headers: mobileHeaders() });
  const j = (await res.json()) as Record<string, unknown>;
  if (res.status === 403 && j.code === "APP_UPDATE_REQUIRED") {
    return {
      status: "update_required",
      minVersion: String(j.minVersion ?? ""),
      clientVersion: String(j.clientVersion ?? clientVersionDisplay()),
    };
  }
  if (!res.ok) {
    return { status: "error", message: String(j.error ?? `Sunucu ${res.status}`) };
  }
  if (j.ok !== true) {
    return { status: "error", message: String(j.error ?? "Yanıt geçersiz") };
  }
  return {
    status: "ok",
    mobilSiparisAcik: Boolean(j.mobilSiparisAcik),
    minAppVersion: typeof j.minAppVersion === "string" ? j.minAppVersion : null,
    clientVersion: String(j.clientVersion ?? clientVersionDisplay()),
  };
}

export function apiBaseUrl(): string {
  return BASE;
}
