import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { tumSiparisler } from "@/lib/siparis-store";
import { withSiteFromRequest } from "@/lib/api-site-context";

export async function GET(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    return NextResponse.json({ siparisler: await tumSiparisler() });
  });
}
