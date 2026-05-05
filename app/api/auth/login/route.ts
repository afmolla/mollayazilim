import { NextResponse } from "next/server";
import { getSiteContext } from "@/lib/site-context";
import { oturumAc } from "@/lib/session";
import { withSiteFromRequest } from "@/lib/api-site-context";

export async function POST(req: Request) {
  return withSiteFromRequest(req, async () => {
    const siteSubdir = getSiteContext()?.subdir ?? "molla";
    const body = (await req.json()) as { password?: string };
    const pwd = process.env.PANEL_PASSWORD ?? "demo123";
    if (!body.password || body.password !== pwd) {
      return NextResponse.json({ ok: false, error: "Geçersiz şifre" }, { status: 401 });
    }
    await oturumAc(siteSubdir);
    return NextResponse.json({ ok: true });
  });
}
