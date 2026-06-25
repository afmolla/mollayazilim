import { NextResponse } from "next/server";
import { urunBySlug, urunYayinda, urunlerGetir } from "@/lib/urun-store";
import { withSiteFromRequest } from "@/lib/api-site-context";

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: Request, ctx: Params) {
  return withSiteFromRequest(req, async () => {
    const { slug } = await ctx.params;
    const urun = await urunBySlug(slug);
    if (!urun || !urunYayinda(await urunlerGetir()).some((x) => x.id === urun.id)) {
      return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ urun });
  });
}
