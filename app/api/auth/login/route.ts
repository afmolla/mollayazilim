import { NextResponse } from "next/server";
import { oturumAc } from "@/lib/session";
import { withSiteFromRequest } from "@/lib/api-site-context";

export async function POST(req: Request) {
  return withSiteFromRequest(req, async () => {
    const body = (await req.json()) as { password?: string };
    const pwd = process.env.PANEL_PASSWORD ?? "demo123";
    if (!body.password || body.password !== pwd) {
      return NextResponse.json({ ok: false, error: "Geçersiz şifre" }, { status: 401 });
    }
    await oturumAc();
    return NextResponse.json({ ok: true });
  });
}
