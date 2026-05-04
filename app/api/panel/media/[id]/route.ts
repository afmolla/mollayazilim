import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { medyaSil } from "@/lib/media-store";
import { withSiteFromRequest } from "@/lib/api-site-context";

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }
    const { id } = await ctx.params;
    const ok = await medyaSil(id);
    if (!ok) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    return NextResponse.json({ ok: true });
  });
}
