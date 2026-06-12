import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { landingGetir, landingKaydet } from "@/lib/molla-landing-store";
import { withSiteFromRequest } from "@/lib/api-site-context";
import { getSiteContext } from "@/lib/site-context";
import { describePersistError } from "@/lib/panel-persist-error";

export async function GET(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (getSiteContext()?.subdir !== "molla") {
      return NextResponse.json({ error: "Yalnız kurumsal panel" }, { status: 404 });
    }
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    return NextResponse.json({ landing: await landingGetir() });
  });
}

export async function PATCH(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (getSiteContext()?.subdir !== "molla") {
      return NextResponse.json({ error: "Yalnız kurumsal panel" }, { status: 404 });
    }
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    try {
      const body = (await req.json()) as Record<string, unknown>;
      const next = await landingKaydet(body);
      return NextResponse.json({ ok: true, landing: next });
    } catch (e) {
      return NextResponse.json({ ok: false, error: describePersistError(e) }, { status: 500 });
    }
  });
}
