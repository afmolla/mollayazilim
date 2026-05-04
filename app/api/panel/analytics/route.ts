import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { withSiteFromRequest } from "@/lib/api-site-context";
import { getStats } from "@/lib/analytics-store";

export async function GET(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    return NextResponse.json(await getStats());
  });
}

