import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { bloklardanHtml, tumSayfalar, sayfaUpsert, type SayfaBlok } from "@/lib/pages-store";

export async function GET() {
  if (!(await oturumVarMi())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const list = await tumSayfalar();
  return NextResponse.json({ sayfalar: list });
}

export async function POST(req: Request) {
  if (!(await oturumVarMi())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = (await req.json()) as {
    slug?: string;
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
      slug: body.slug ?? "",
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
}

