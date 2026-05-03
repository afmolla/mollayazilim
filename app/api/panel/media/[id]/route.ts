import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { medyaSil } from "@/lib/media-store";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await oturumVarMi())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const ok = await medyaSil(id);
  if (!ok) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

