import { NextResponse } from "next/server";
import { ayarlarGetir } from "@/lib/settings-store";
import { publicCorsHeaders } from "@/lib/public-cors";
import { qrMenuGetir } from "@/lib/qr-menu-store";
import { urunIdToUrun } from "@/lib/qr-menu-index";
import { siparisEkle } from "@/lib/siparis-store";
import { withSiteFromRequest } from "@/lib/api-site-context";
import { mobileVersionBlockResponse } from "@/lib/mobile-app-version";

function temizTelefon(tel: string): string {
  return tel.replace(/\D/g, "");
}

function gecerliTelefon(tel: string): boolean {
  return tel.length >= 10 && tel.length <= 15;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: publicCorsHeaders() });
}

export async function POST(req: Request) {
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
      return NextResponse.json({ ok: false, error: "Menü yayında değil." }, { status: 400, headers: publicCorsHeaders() });
    }

    const urunMap = urunIdToUrun(menu);

    const body = (await req.json()) as {
      telefon?: string;
      musteriAd?: string;
      adres?: string;
      notlar?: string;
      satirlar?: { urunId?: string; adet?: number }[];
    };

    const telefonRaw = body.telefon?.trim() ?? "";
    const telefon = temizTelefon(telefonRaw);
    if (!telefonRaw || !gecerliTelefon(telefon)) {
      return NextResponse.json(
        { ok: false, error: "Geçerli bir telefon girin." },
        { status: 400, headers: publicCorsHeaders() },
      );
    }

    const rawLines = Array.isArray(body.satirlar) ? body.satirlar : [];
    if (rawLines.length === 0) {
      return NextResponse.json({ ok: false, error: "Sepet boş." }, { status: 400, headers: publicCorsHeaders() });
    }

    const satirlar: { urunId: string; ad: string; fiyat: string; adet: number }[] = [];

    for (const ln of rawLines) {
      const id = ln.urunId?.trim();
      const adet = typeof ln.adet === "number" ? ln.adet : Number.NaN;
      if (!id || !Number.isFinite(adet) || adet < 1 || adet > 99) {
        return NextResponse.json({ ok: false, error: "Geçersiz ürün satırı." }, { status: 400, headers: publicCorsHeaders() });
      }
      const u = urunMap.get(id);
      if (!u) {
        return NextResponse.json({ ok: false, error: "Bilinmeyen ürün." }, { status: 400, headers: publicCorsHeaders() });
      }
      satirlar.push({
        urunId: u.id,
        ad: u.ad,
        fiyat: u.fiyat,
        adet: Math.floor(adet),
      });
    }

    const siparis = await siparisEkle({
      durum: "beklemede",
      kaynak: "mobil",
      telefon,
      musteriAd: body.musteriAd?.trim() || undefined,
      adres: body.adres?.trim() || undefined,
      notlar: body.notlar?.trim() || undefined,
      satirlar,
    });

    return NextResponse.json({ ok: true, id: siparis.id }, { headers: publicCorsHeaders() });
  });
}
