import { NextResponse } from "next/server";
import { initiatePayment } from "@/lib/payment-service";
import { siparisById, siparisGuncelle } from "@/lib/siparis-store";
import { withSiteFromRequest } from "@/lib/api-site-context";

export async function POST(req: Request) {
  return withSiteFromRequest(req, async () => {
    const body = (await req.json()) as { siparisId?: string };
    const siparisId = body.siparisId?.trim();
    if (!siparisId) {
      return NextResponse.json({ ok: false, error: "Sipariş ID gerekli." }, { status: 400 });
    }

    const siparis = await siparisById(siparisId);
    if (!siparis) {
      return NextResponse.json({ ok: false, error: "Sipariş bulunamadı." }, { status: 404 });
    }

    const origin = new URL(req.url).origin;
    const result = await initiatePayment({
      siparisId,
      toplam: siparis.toplam ?? 0,
      musteriAd: siparis.musteriAd ?? "",
      eposta: siparis.eposta,
      telefon: siparis.telefon,
      callbackUrl: `${origin}/api/public/payment/callback`,
    });

    if (result.ok && result.paymentToken) {
      await siparisGuncelle(siparisId, {
        odemeDurum: "baslatildi",
        odemeReferans: result.paymentToken,
      });
    }

    return NextResponse.json(result);
  });
}
