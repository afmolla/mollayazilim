import { NextResponse } from "next/server";
import { withSiteFromRequest } from "@/lib/api-site-context";
import { recordHit } from "@/lib/analytics-store";

function pickClientIp(req: Request): string {
  const h = req.headers;
  const xff = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return xff || h.get("x-real-ip")?.trim() || h.get("cf-connecting-ip")?.trim() || "unknown";
}

function ua(req: Request): string {
  return req.headers.get("user-agent")?.slice(0, 300) ?? "";
}

function newVid(): string {
  return `v_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(req: Request) {
  return withSiteFromRequest(req, async () => {
    const body = (await req.json().catch(() => ({}))) as { path?: string };
    const path = String(body.path ?? "").slice(0, 200) || "/";

    const res = NextResponse.json({ ok: true });

    const cookie = req.headers.get("cookie") ?? "";
    const m = /(?:^|;\s*)vf_vid=([^;]+)/.exec(cookie);
    const existing = m?.[1] ? decodeURIComponent(m[1]) : "";
    const vid = existing || newVid();
    if (!existing) {
      res.cookies.set("vf_vid", vid, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
    }

    await recordHit({
      ts: new Date().toISOString(),
      vid,
      path,
      ip: pickClientIp(req),
      ua: ua(req),
    });

    return res;
  });
}

