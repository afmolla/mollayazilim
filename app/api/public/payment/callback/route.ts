import { NextResponse } from "next/server";
import { verifyPayment } from "@/lib/payment-service";
import { siparisById, siparisGuncelle } from "@/lib/siparis-store";
import { withSiteFromRequest } from "@/lib/api-site-context";

export async function GET(req: Request) {
  return withSiteFromRequest(req, async () => {
    const url = new URL(req.url);
    const token = url.searchParams.get("token")?.trim();
    const siparisId = url.searchParams.get("siparisId")?.trim();
    if (!token || !siparisId) {
      return NextResponse.json({ ok: false, error: "Eksik parametre." }, { status: 400 });
    }

    const siparis = await siparisById(siparisId);
    if (!siparis) {
      return NextResponse.json({ ok: false, error: "Sipariş bulunamadı." }, { status: 404 });
    }

    const verify = await verifyPayment({ paymentToken: token, siparisId });
    if (verify.odendi) {
      await siparisGuncelle(siparisId, {
        odemeDurum: "odendi",
        odemeReferans: verify.referans ?? token,
      });
    }

    return NextResponse.json(verify);
  });
}

export async function POST(req: Request) {
  return GET(req);
}
