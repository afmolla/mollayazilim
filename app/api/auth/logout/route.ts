import { NextResponse } from "next/server";
import { oturumKapat } from "@/lib/session";
import { withSiteFromRequest } from "@/lib/api-site-context";

export async function POST(req: Request) {
  return withSiteFromRequest(req, async () => {
    await oturumKapat();
    return NextResponse.json({ ok: true });
  });
}
