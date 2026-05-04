import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { bloklardanHtml, sayfaBySlug, sayfaSil, sayfaUpsert, type SayfaBlok } from "@/lib/pages-store";
import { withSiteFromRequest } from "@/lib/api-site-context";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(req: Request, ctx: Ctx) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const { slug } = await ctx.params;
    const s = await sayfaBySlug(slug);
    if (!s) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    return NextResponse.json({ sayfa: s });
  });
}

export async function PUT(req: Request, ctx: Ctx) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const { slug } = await ctx.params;
    const body = (await req.json()) as {
      baslik?: string;
      aciklama?: string;
      icerikHtml?: string;
      bloklar?: SayfaBlok[];
      seoIndex?: boolean;
      yayin?: boolean;
    };
    try {
      const bloklar = Array.isArray(body.bloklar) ? body.bloklar : undefined;
      const s = await sayfaUpsert({
        slug,
        baslik: body.baslik ?? "",
        aciklama: body.aciklama,
        icerikHtml: bloklar ? bloklardanHtml(bloklar) : (body.icerikHtml ?? ""),
        bloklar,
        seoIndex: body.seoIndex,
        yayin: !!body.yayin,
      });
      return NextResponse.json({ ok: true, sayfa: s });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Kaydedilemedi";
      return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }
  });
}

export async function DELETE(req: Request, ctx: Ctx) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const { slug } = await ctx.params;
    const ok = await sayfaSil(slug);
    if (!ok) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    return NextResponse.json({ ok: true });
  });
}
