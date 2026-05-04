import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { qrMenuGetir, qrMenuKaydet, type QrMenuData } from "@/lib/qr-menu-store";
import { withSiteFromRequest } from "@/lib/api-site-context";

export async function GET(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    return NextResponse.json({ menu: await qrMenuGetir() });
  });
}

export async function PATCH(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    const body = (await req.json()) as Partial<QrMenuData>;
    const next = await qrMenuKaydet(body);
    return NextResponse.json({ ok: true, menu: next });
  });
}
