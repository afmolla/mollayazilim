import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { urunGuncelle, urunSil, urunById } from "@/lib/urun-store";
import type { UrunKayit } from "@/lib/urun-store";
import { withSiteFromRequest } from "@/lib/api-site-context";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Params) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    const { id } = await ctx.params;
    const urun = await urunById(id);
    if (!urun) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    return NextResponse.json({ urun });
  });
}

export async function PATCH(req: Request, ctx: Params) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    const { id } = await ctx.params;
    const body = (await req.json()) as Partial<UrunKayit>;
    const urun = await urunGuncelle(id, body);
    if (!urun) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    return NextResponse.json({ ok: true, urun });
  });
}

export async function DELETE(req: Request, ctx: Params) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    const { id } = await ctx.params;
    const ok = await urunSil(id);
    if (!ok) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    return NextResponse.json({ ok: true });
  });
}
