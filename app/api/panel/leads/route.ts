import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { withSiteFromRequest } from "@/lib/api-site-context";
import { listLeads } from "@/lib/lead-store";

export async function GET(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    const url = new URL(req.url);
    const limitRaw = Number(url.searchParams.get("limit") ?? "200");
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(1000, limitRaw)) : 200;
    return NextResponse.json({ leads: await listLeads(limit) });
  });
}

