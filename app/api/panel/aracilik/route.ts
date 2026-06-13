import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { aracilikGetir, aracilikKaydet } from "@/lib/esnek-ambalaj-aracilik-store";
import { withSiteFromRequest } from "@/lib/api-site-context";
import { describePersistError } from "@/lib/panel-persist-error";

export async function GET(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    return NextResponse.json({ aracilik: await aracilikGetir() });
  });
}

export async function PATCH(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    try {
      const body = (await req.json()) as Record<string, unknown>;
      const next = await aracilikKaydet(body);
      return NextResponse.json({ ok: true, aracilik: next });
    } catch (e) {
      return NextResponse.json({ ok: false, error: describePersistError(e) }, { status: 500 });
    }
  });
}
