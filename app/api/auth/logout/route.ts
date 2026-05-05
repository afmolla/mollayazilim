import { NextResponse } from "next/server";
import { getSiteContext } from "@/lib/site-context";
import { oturumKapat } from "@/lib/session";
import { withSiteFromRequest } from "@/lib/api-site-context";

export async function POST(req: Request) {
  return withSiteFromRequest(req, async () => {
    const siteSubdir = getSiteContext()?.subdir ?? "molla";
    await oturumKapat(siteSubdir);
    return NextResponse.json({ ok: true });
  });
}
