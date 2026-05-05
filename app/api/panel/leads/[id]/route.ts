import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { withSiteFromRequest } from "@/lib/api-site-context";
import { updateLeadMeta } from "@/lib/lead-store";

type Body = { status?: unknown; note?: unknown };

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as Body;
    const status = String(body.status ?? "").trim();
    const note = typeof body.note === "string" ? body.note : undefined;
    const next = await updateLeadMeta(id, {
      status: (status || undefined) as any,
      note,
    });
    return NextResponse.json({ ok: true, meta: next });
  });
}

