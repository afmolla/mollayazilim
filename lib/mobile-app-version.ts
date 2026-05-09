import { NextResponse } from "next/server";
import type { SiteAyarlar } from "@/lib/settings-store";
import { publicCorsHeaders } from "@/lib/public-cors";
import { semverLt } from "@/lib/semver-compare";

export const APP_UPDATE_CODE = "APP_UPDATE_REQUIRED" as const;

/** İstemci sürümü — başlık yoksa 0.0.0 kabul edilir */
export function clientAppVersion(req: Request): string {
  const v = req.headers.get("x-app-version")?.trim();
  return v || "0.0.0";
}

/**
 * Panelde `mobilMinVersiyon` doluysa eski uygulamalar menü/sipariş alamaz.
 * Boşsa kontrol yok.
 */
export function mobileVersionBlockResponse(
  req: Request,
  ayar: SiteAyarlar,
): NextResponse | null {
  const min = ayar.mobilMinVersiyon?.trim();
  if (!min) return null;
  const cv = clientAppVersion(req);
  if (!semverLt(cv, min)) return null;
  return NextResponse.json(
    {
      ok: false,
      code: APP_UPDATE_CODE,
      error: "Uygulama güncellemesi gerekli.",
      minVersion: min,
      clientVersion: cv,
    },
    { status: 403, headers: publicCorsHeaders() },
  );
}
