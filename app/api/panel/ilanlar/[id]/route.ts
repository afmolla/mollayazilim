import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { ilanGuncelle, ilanSil } from "@/lib/ilan-store";
import type { IlanKayit } from "@/lib/ilan-store";
import { withSiteFromRequest } from "@/lib/api-site-context";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    const { id } = await ctx.params;
    const body = (await req.json()) as Partial<IlanKayit>;
    const patch: Partial<Omit<IlanKayit, "id">> = {};
    if (typeof body.baslik === "string") patch.baslik = body.baslik.trim();
    if (typeof body.ozet === "string") patch.ozet = body.ozet.trim();
    if (typeof body.il === "string") patch.il = body.il.trim();
    if (typeof body.ilce === "string") patch.ilce = body.ilce.trim();
    if (body.mahalle !== undefined) patch.mahalle = body.mahalle?.trim() || undefined;
    if (body.tip === "satilik" || body.tip === "kiralik") patch.tip = body.tip;
    if (typeof body.metrekare === "number" && Number.isFinite(body.metrekare)) patch.metrekare = body.metrekare;
    if (typeof body.oda === "string") patch.oda = body.oda.trim();
    if (typeof body.fiyat === "number" && Number.isFinite(body.fiyat)) patch.fiyat = body.fiyat;
    if (typeof body.kapakSrc === "string") patch.kapakSrc = body.kapakSrc.trim();
    if (typeof body.yayinda === "boolean") patch.yayinda = body.yayinda;

    const next = await ilanGuncelle(id, patch);
    if (!next) return NextResponse.json({ ok: false, error: "Bulunamadı" }, { status: 404 });
    return NextResponse.json({ ok: true, ilan: next });
  });
}

export async function DELETE(req: Request, ctx: Ctx) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    const { id } = await ctx.params;
    const ok = await ilanSil(id);
    if (!ok) return NextResponse.json({ ok: false }, { status: 404 });
    return NextResponse.json({ ok: true });
  });
}
