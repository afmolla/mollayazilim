import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { ayarlarGetir, ayarlarKaydet } from "@/lib/settings-store";
import { withSiteFromRequest } from "@/lib/api-site-context";
import { describePersistError } from "@/lib/panel-persist-error";

export async function GET(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    return NextResponse.json({ ayarlar: await ayarlarGetir() });
  });
}

export async function PATCH(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    try {
      const body = (await req.json()) as Record<string, unknown>;
      const next = await ayarlarKaydet(body);
      return NextResponse.json({ ok: true, ayarlar: next });
    } catch (e) {
      const msg = describePersistError(e);
      return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
  });
}
