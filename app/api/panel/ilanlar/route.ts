import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { ilanEkle, ilanlarGetir } from "@/lib/ilan-store";
import type { IlanKayit } from "@/lib/ilan-store";
import { withSiteFromRequest } from "@/lib/api-site-context";

export async function GET(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    return NextResponse.json({ ilanlar: await ilanlarGetir() });
  });
}

export async function POST(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    const body = (await req.json()) as Partial<IlanKayit>;
    const baslik = String(body.baslik ?? "").trim();
    const ozet = String(body.ozet ?? "").trim();
    const il = String(body.il ?? "").trim();
    const ilce = String(body.ilce ?? "").trim();
    const tip = body.tip === "kiralik" ? "kiralik" : "satilik";
    const metrekare = Number(body.metrekare);
    const oda = String(body.oda ?? "").trim();
    const fiyat = Number(body.fiyat);
    const kapakSrc = String(body.kapakSrc ?? "").trim();
    if (!baslik || !ozet || !il || !ilce || !oda || !kapakSrc || !Number.isFinite(fiyat) || !Number.isFinite(metrekare)) {
      return NextResponse.json({ error: "Zorunlu alanlar eksik" }, { status: 400 });
    }
    const kayit = await ilanEkle({
      baslik,
      ozet,
      il,
      ilce,
      mahalle: body.mahalle?.trim() || undefined,
      tip,
      metrekare,
      oda,
      fiyat,
      kapakSrc,
      yayinda: body.yayinda !== false,
    });
    return NextResponse.json({ ok: true, ilan: kayit });
  });
}
