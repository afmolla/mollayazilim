import { NextResponse } from "next/server";
import { getSiteContext } from "@/lib/site-context";
import { oturumAc } from "@/lib/session";
import { withSiteFromRequest } from "@/lib/api-site-context";
import { panelPasswordMatches } from "@/lib/panel-password-store";

export async function POST(req: Request) {
  return withSiteFromRequest(req, async () => {
    const siteSubdir = getSiteContext()?.subdir ?? "molla";
    const body = (await req.json()) as { password?: string };
    if (!(await panelPasswordMatches(body.password))) {
      return NextResponse.json({ ok: false, error: "Geçersiz şifre" }, { status: 401 });
    }
    await oturumAc(siteSubdir);
    return NextResponse.json({ ok: true });
  });
}
