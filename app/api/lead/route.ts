import { NextResponse } from "next/server";
import { withSiteFromRequest } from "@/lib/api-site-context";
import { recordLead } from "@/lib/lead-store";

function pickClientIp(req: Request): string {
  const h = req.headers;
  const xff = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return xff || h.get("x-real-ip")?.trim() || h.get("cf-connecting-ip")?.trim() || "unknown";
}

function ua(req: Request): string {
  return req.headers.get("user-agent")?.slice(0, 300) ?? "";
}

function readVid(req: Request): string | undefined {
  const cookie = req.headers.get("cookie") ?? "";
  const m = /(?:^|;\s*)vf_vid=([^;]+)/.exec(cookie);
  const existing = m?.[1] ? decodeURIComponent(m[1]) : "";
  return existing || undefined;
}

type Body = {
  name?: unknown;
  phone?: unknown;
  company?: unknown;
  message?: unknown;
  sourcePath?: unknown;
};

function s(v: unknown, max: number) {
  return String(v ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export async function POST(req: Request) {
  return withSiteFromRequest(req, async () => {
    const body = (await req.json().catch(() => ({}))) as Body;
    const name = s(body.name, 80);
    const phone = s(body.phone, 40);
    const company = s(body.company, 120);
    const message = String(body.message ?? "").trim().slice(0, 1200);
    const sourcePath = s(body.sourcePath, 200);

    if (!name || !phone) {
      return NextResponse.json({ ok: false, error: "Eksik alan" }, { status: 400 });
    }

    await recordLead({
      id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : undefined,
      ts: new Date().toISOString(),
      vid: readVid(req),
      ip: pickClientIp(req),
      ua: ua(req),
      name,
      phone,
      company: company || undefined,
      message: message || undefined,
      sourcePath: sourcePath || undefined,
    });

    return NextResponse.json({ ok: true });
  });
}

