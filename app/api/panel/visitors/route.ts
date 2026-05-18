import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { withSiteFromRequest } from "@/lib/api-site-context";
import { getStats, listVisitorHits } from "@/lib/analytics-store";

export async function GET(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? "100");
    const offset = Number(url.searchParams.get("offset") ?? "0");
    const q = url.searchParams.get("q") ?? "";

    const [stats, log] = await Promise.all([
      getStats(),
      listVisitorHits({ limit, offset, q }),
    ]);

    return NextResponse.json({ stats, ...log });
  });
}
