import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { urunEkle, urunlerGetir } from "@/lib/urun-store";
import type { UrunKayit } from "@/lib/urun-store";
import { withSiteFromRequest } from "@/lib/api-site-context";

export async function GET(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    const list = await urunlerGetir();
    return NextResponse.json({ urunler: list.sort((a, b) => a.sira - b.sira) });
  });
}

export async function POST(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    const body = (await req.json()) as Partial<UrunKayit>;
    const baslik = String(body.baslik ?? "").trim();
    const ozet = String(body.ozet ?? "").trim();
    const kategoriId = body.kategoriId;
    const imageSrc = String(body.imageSrc ?? "").trim();
    const validKat = kategoriId === "doypack" || kategoriId === "quadro" || kategoriId === "flat" || kategoriId === "torba" || kategoriId === "baski";
    if (!baslik || !ozet || !validKat || !imageSrc || !Array.isArray(body.varyantlar) || body.varyantlar.length === 0) {
      return NextResponse.json({ error: "Zorunlu alanlar eksik" }, { status: 400 });
    }
    const kayit = await urunEkle({
      baslik,
      ozet,
      aciklama: body.aciklama?.trim() || undefined,
      kategoriId,
      imageSrc,
      imageAlt: body.imageAlt?.trim() || undefined,
      etiket: body.etiket?.trim() || undefined,
      minSiparis: body.minSiparis?.trim() || undefined,
      varyantlar: body.varyantlar,
      yayinda: body.yayinda !== false,
      stokta: body.stokta !== false,
      sira: typeof body.sira === "number" ? body.sira : 99,
    });
    return NextResponse.json({ ok: true, urun: kayit });
  });
}
