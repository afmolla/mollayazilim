import { NextResponse } from "next/server";
import { siparisEkle } from "@/lib/siparis-store";
import { initiatePayment } from "@/lib/payment-service";
import { urunById, urunVaryantFiyat, formatTry } from "@/lib/urun-store";
import { withSiteFromRequest } from "@/lib/api-site-context";
import type { SiparisSatir } from "@/lib/types";

function temizTelefon(tel: string): string {
  return tel.replace(/\D/g, "");
}

function gecerliTelefon(tel: string): boolean {
  return tel.length >= 10 && tel.length <= 15;
}

export async function POST(req: Request) {
  return withSiteFromRequest(req, async () => {
    const body = (await req.json()) as {
      musteriAd?: string;
      telefon?: string;
      eposta?: string;
      firma?: string;
      vergiNo?: string;
      vergiDairesi?: string;
      il?: string;
      ilce?: string;
      postaKodu?: string;
      adres?: string;
      notlar?: string;
      odemeBaslat?: boolean;
      satirlar?: { urunId?: string; varyantId?: string; miktar?: number }[];
    };

    const telefonRaw = body.telefon?.trim() ?? "";
    const telefon = temizTelefon(telefonRaw);
    const musteriAd = body.musteriAd?.trim() ?? "";
    if (!musteriAd) {
      return NextResponse.json({ ok: false, error: "Ad soyad zorunludur." }, { status: 400 });
    }
    if (!telefonRaw || !gecerliTelefon(telefon)) {
      return NextResponse.json({ ok: false, error: "Geçerli bir telefon girin." }, { status: 400 });
    }

    const rawLines = Array.isArray(body.satirlar) ? body.satirlar : [];
    if (rawLines.length === 0) {
      return NextResponse.json({ ok: false, error: "Sepet boş." }, { status: 400 });
    }

    const satirlar: SiparisSatir[] = [];
    let araToplam = 0;

    for (const ln of rawLines) {
      const urunId = ln.urunId?.trim();
      const varyantId = ln.varyantId?.trim();
      const miktar = typeof ln.miktar === "number" ? ln.miktar : Number.NaN;
      if (!urunId || !varyantId || !Number.isFinite(miktar) || miktar < 1) {
        return NextResponse.json({ ok: false, error: "Geçersiz sepet satırı." }, { status: 400 });
      }
      const urun = await urunById(urunId);
      if (!urun || !urun.yayinda || !urun.stokta) {
        return NextResponse.json({ ok: false, error: "Ürün mevcut değil." }, { status: 400 });
      }
      const varyant = urun.varyantlar.find((v) => v.id === varyantId);
      if (!varyant) {
        return NextResponse.json({ ok: false, error: "Varyant bulunamadı." }, { status: 400 });
      }
      const birimFiyat = urunVaryantFiyat(varyant);
      const lineTotal = birimFiyat * miktar;
      araToplam += lineTotal;
      satirlar.push({
        urunId: urun.id,
        varyantId: varyant.id,
        ad: `${urun.baslik} (${varyant.etiket})`,
        fiyat: formatTry(lineTotal),
        adet: miktar,
        birimFiyat,
      });
    }

    const kdv = Math.round(araToplam * 0.2 * 100) / 100;
    const toplam = Math.round((araToplam + kdv) * 100) / 100;

    const siparis = await siparisEkle({
      durum: "beklemede",
      kaynak: "web",
      odemeDurum: "bekliyor",
      telefon,
      musteriAd,
      eposta: body.eposta?.trim() || undefined,
      firma: body.firma?.trim() || undefined,
      vergiNo: body.vergiNo?.trim() || undefined,
      vergiDairesi: body.vergiDairesi?.trim() || undefined,
      il: body.il?.trim() || undefined,
      ilce: body.ilce?.trim() || undefined,
      postaKodu: body.postaKodu?.trim() || undefined,
      adres: body.adres?.trim() || undefined,
      notlar: body.notlar?.trim() || undefined,
      araToplam,
      kdv,
      toplam,
      satirlar,
    });

    let payment: Awaited<ReturnType<typeof initiatePayment>> | undefined;
    if (body.odemeBaslat !== false) {
      const origin = new URL(req.url).origin;
      payment = await initiatePayment({
        siparisId: siparis.id,
        toplam,
        musteriAd,
        eposta: body.eposta?.trim(),
        telefon,
        callbackUrl: `${origin}/api/public/payment/callback`,
      });
    }

    return NextResponse.json({
      ok: true,
      id: siparis.id,
      toplam,
      odemeDurum: siparis.odemeDurum,
      payment,
    });
  });
}
