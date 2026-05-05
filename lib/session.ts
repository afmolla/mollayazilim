import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { getSiteContext } from "@/lib/site-context";
import { getRequestSite } from "@/lib/site-request";
import { normalizePublicSiteUrl } from "@/lib/site";

/** Hareket yoksa oturum düşer (kaydırmalı yenileme ile uzar). Varsayılan 10 dk. */
export const SESSION_IDLE_MS =
  Number(process.env.PANEL_SESSION_IDLE_SECONDS) > 0
    ? Number(process.env.PANEL_SESSION_IDLE_SECONDS) * 1000
    : 10 * 60 * 1000;

/** Eski tek çerez adı — temizlik için */
const LEGACY_COOKIE = "kuafor_panel";

function subdirToCookieName(subdir: string): string {
  const s = (subdir || "molla").trim().replace(/[^a-z0-9_-]/gi, "_") || "molla";
  return `panel_sess_${s}`;
}

async function resolveSessionCookieName(): Promise<string> {
  const ctx = getSiteContext()?.subdir?.trim();
  if (ctx) return subdirToCookieName(ctx);
  try {
    const { subdir } = await getRequestSite();
    return subdirToCookieName(subdir || "molla");
  } catch {
    return subdirToCookieName("molla");
  }
}

function cookieSecure(): boolean {
  if (process.env.SESSION_COOKIE_SECURE === "true") return true;
  if (process.env.SESSION_COOKIE_SECURE === "false") return false;
  const base = normalizePublicSiteUrl(process.env.NEXT_PUBLIC_SITE_URL).toLowerCase();
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

async function writeSessionCookie(name: string): Promise<void> {
  const until = Date.now() + SESSION_IDLE_MS;
  const payload = Buffer.from(JSON.stringify({ until }), "utf8").toString("base64url");
  const token = sign(payload);
  const jar = await cookies();
  const maxAgeSec = Math.max(60, Math.ceil(SESSION_IDLE_MS / 1000));
  jar.set(name, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(),
    path: "/",
    maxAge: maxAgeSec,
  });
}

/** Eski global çerezi sil (bir kerelik temizlik) */
async function clearLegacyCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(LEGACY_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: cookieSecure(), path: "/", maxAge: 0 });
}

export async function oturumAc(): Promise<void> {
  const name = await resolveSessionCookieName();
  await writeSessionCookie(name);
  await clearLegacyCookie();
}

export async function oturumKapat(): Promise<void> {
  const jar = await cookies();
  const name = await resolveSessionCookieName();
  jar.set(name, "", { httpOnly: true, sameSite: "lax", secure: cookieSecure(), path: "/", maxAge: 0 });
  await clearLegacyCookie();
}

export async function oturumVarMi(): Promise<boolean> {
  const name = await resolveSessionCookieName();
  const jar = await cookies();
  let token = jar.get(name)?.value;

  if (!token && name === subdirToCookieName("molla")) {
    token = jar.get(LEGACY_COOKIE)?.value;
  }

  if (!token || !verify(token)) return false;

  const last = token.lastIndexOf(".");
  const payloadB64 = token.slice(0, last);
  try {
    const raw = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as { until?: number; exp?: number };

    const deadline = typeof raw.until === "number" ? raw.until : raw.exp;
    if (deadline === undefined || Date.now() > deadline) return false;

    const remaining = deadline - Date.now();
    /* Her kontrolde çerez yazmak sunucuyu ve navigasyonu yoruyor; sürenin yarısından az kaldıysa yenile (kaydırmalı oturum korunur). */
    if (remaining <= SESSION_IDLE_MS / 2) {
      await writeSessionCookie(name);
    }
    return true;
  } catch {
    return false;
  }
}
