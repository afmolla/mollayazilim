import { NextResponse } from "next/server";

/** Sadece “sunucu ayakta mı?” — HTML RSC ayrı; canlı teşhis için. */
export function GET() {
  return NextResponse.json({ ok: true, t: Date.now() });
}
