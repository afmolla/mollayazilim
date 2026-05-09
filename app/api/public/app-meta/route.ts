import { NextResponse } from "next/server";
import { ayarlarGetir } from "@/lib/settings-store";
import { publicCorsHeaders } from "@/lib/public-cors";
import { clientAppVersion, mobileVersionBlockResponse } from "@/lib/mobile-app-version";
import { withSiteFromRequest } from "@/lib/api-site-context";

/**
 * Mobil uygulama açılışında: zorunlu sürüm + sipariş açık mı (hafif istek).
 * Başlıklar: x-site-prefix, x-data-subdir, x-app-version
 */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: publicCorsHeaders() });
}

export async function GET(req: Request) {
  return withSiteFromRequest(req, async () => {
    const ayar = await ayarlarGetir();
    const block = mobileVersionBlockResponse(req, ayar);
    if (block) return block;

    const min = ayar.mobilMinVersiyon?.trim() ?? "";
    return NextResponse.json(
      {
        ok: true,
        mobilSiparisAcik: ayar.mobilSiparisAcik === true,
        minAppVersion: min || null,
        clientVersion: clientAppVersion(req),
      },
      { headers: publicCorsHeaders() },
    );
  });
}
