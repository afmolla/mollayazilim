import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { randevuGuncelle } from "@/lib/randevu-store";
import type { RandevuDurum } from "@/lib/types";
import { withSiteFromRequest } from "@/lib/api-site-context";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const { id } = await ctx.params;
    const body = (await req.json()) as { durum?: RandevuDurum; notlar?: string };
    const patch: { durum?: RandevuDurum; notlar?: string } = {};
    if (body.durum === "beklemede" || body.durum === "onaylandi" || body.durum === "iptal") {
      patch.durum = body.durum;
    }
    if (typeof body.notlar === "string") patch.notlar = body.notlar;
    const r = await randevuGuncelle(id, patch);
    if (!r) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    return NextResponse.json({ ok: true, randevu: r });
  });
}
