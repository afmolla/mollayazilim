import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { gecerliSiparisDurum, siparisGuncelle } from "@/lib/siparis-store";
import { withSiteFromRequest } from "@/lib/api-site-context";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    const { id } = await ctx.params;
    const body = (await req.json()) as { durum?: unknown; notlar?: string };
    const durum = body.durum;
    if (durum !== undefined && !gecerliSiparisDurum(durum)) {
      return NextResponse.json({ ok: false, error: "Geçersiz durum" }, { status: 400 });
    }
    const next = await siparisGuncelle(id, {
      ...(durum !== undefined && gecerliSiparisDurum(durum) ? { durum } : {}),
      notlar: body.notlar,
    });
    if (!next) return NextResponse.json({ ok: false, error: "Bulunamadı" }, { status: 404 });
    return NextResponse.json({ ok: true, siparis: next });
  });
}
