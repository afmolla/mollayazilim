import { NextResponse } from "next/server";
import { ayarlarGetir } from "@/lib/settings-store";
import { publicCorsHeaders } from "@/lib/public-cors";
import { qrMenuGetir } from "@/lib/qr-menu-store";
import { withSiteFromRequest } from "@/lib/api-site-context";
import { mobileVersionBlockResponse } from "@/lib/mobile-app-version";

/**
 * Mobil uygulama: yayındaki QR menüyü okur.
 * İstemci mutlaka site bağlamı göndermeli:
 *   `x-site-prefix: /restaurant` ve `x-data-subdir: restaurant`
 */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: publicCorsHeaders() });
}

export async function GET(req: Request) {
  return withSiteFromRequest(req, async () => {
    const ayar = await ayarlarGetir();
    if (ayar.mobilSiparisAcik !== true) {
      return NextResponse.json(
        { ok: false, error: "Mobil sipariş kapalı." },
        { status: 403, headers: publicCorsHeaders() },
      );
    }
    const verErr = mobileVersionBlockResponse(req, ayar);
    if (verErr) return verErr;
    const menu = await qrMenuGetir();
    if (!menu.yayin) {
      return NextResponse.json({ ok: false, error: "Menü yayında değil." }, { status: 404, headers: publicCorsHeaders() });
    }
    return NextResponse.json({ ok: true, menu }, { headers: publicCorsHeaders() });
  });
}
