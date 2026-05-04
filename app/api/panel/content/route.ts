import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { icerikGetir, icerikKaydet, type SiteIcerik } from "@/lib/content-store";
import { withSiteFromRequest } from "@/lib/api-site-context";

export async function GET(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    return NextResponse.json({ icerik: await icerikGetir() });
  });
}

export async function PATCH(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    const body = (await req.json()) as Partial<SiteIcerik>;
    const next = await icerikKaydet(body);
    return NextResponse.json({ ok: true, icerik: next });
  });
}
