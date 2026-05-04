import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { getSiteContext } from "@/lib/site-context";
import { getRequestSite } from "@/lib/site-request";

const COOKIE = "kuafor_panel";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 gün

async function cookiePath(): Promise<string> {
  const p = getSiteContext()?.prefix?.trim();
  if (p) return p;
  try {
    const { prefix } = await getRequestSite();
    return prefix || "/";
  } catch {
    return "/";
  }
}

/** Yalnızca SITE_URL https ise Secure (HTTP/IIS veya localhost prod `next start` çerez gönderebilir) */
function cookieSecure(): boolean {
  if (process.env.SESSION_COOKIE_SECURE === "true") return true;
  if (process.env.SESSION_COOKIE_SECURE === "false") return false;
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().toLowerCase();
  return base.startsWith("https://");
}

function secret(): string {
  return process.env.SESSION_SECRET ?? "kuafor-demo-degistirin";
}

function sign(payload: string): string {
  const h = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${h}`;
}

function verify(token: string): boolean {
  const last = token.lastIndexOf(".");
  if (last <= 0) return false;
  const payload = token.slice(0, last);
  const sig = token.slice(last + 1);
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function oturumAc(): Promise<void> {
  const exp = Date.now() + MAX_AGE * 1000;
  const payload = Buffer.from(JSON.stringify({ exp }), "utf8").toString("base64url");
  const token = sign(payload);
  const jar = await cookies();
  const path = await cookiePath();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(),
    path,
    maxAge: MAX_AGE,
  });
}

export async function oturumKapat(): Promise<void> {
  const jar = await cookies();
  const path = await cookiePath();
  jar.set(COOKIE, "", { httpOnly: true, sameSite: "lax", secure: cookieSecure(), path, maxAge: 0 });
}

export async function oturumVarMi(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token || !verify(token)) return false;
  const last = token.lastIndexOf(".");
  const payload = token.slice(0, last);
  try {
    const raw = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { exp?: number };
    if (!raw.exp || Date.now() > raw.exp) return false;
    return true;
  } catch {
    return false;
  }
}
