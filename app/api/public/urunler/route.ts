import { NextResponse } from "next/server";
import { urunlerGetir, urunYayinda } from "@/lib/urun-store";
import { withSiteFromRequest } from "@/lib/api-site-context";

export async function GET(req: Request) {
  return withSiteFromRequest(req, async () => {
    const url = new URL(req.url);
    const kategori = url.searchParams.get("kategori")?.trim();
    let list = urunYayinda(await urunlerGetir()).sort((a, b) => a.sira - b.sira);
    if (kategori) {
      list = list.filter((x) => x.kategoriId === kategori);
    }
    return NextResponse.json({ urunler: list });
  });
}
