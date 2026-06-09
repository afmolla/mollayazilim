import { promises as fs } from "fs";
import path from "path";
import { getDataDir } from "@/lib/data-dir";

export type AnalyticsHit = {
  ts: string;
  vid: string;
  path: string;
  ip: string;
  ua: string;
  referer?: string;
};

export type VisitorHitRow = AnalyticsHit & {
  browser: string;
  device: string;
};

export type AnalyticsSnapshot = {
  /** YYYY-MM-DD (UTC) */
  day: string;
  /** vid -> last seen epoch ms */
  lastSeen: Record<string, number>;
  /** today visits (total hits) */
  todayHits: number;
  /** today unique visitors (vid set size) */
  todayUniques: number;
  /** today unique -> last ip/ua (for admin view) */
  todayMeta: Record<
    string,
    { ip: string; ua: string; lastPath: string; lastTs: string; referer?: string }
  >;
};

const HITS_RETAIN_LINES = 10_000;

export function parseUserAgent(ua: string): { browser: string; device: string } {
  const u = ua.toLowerCase();
  let browser = "Diğer";
  if (u.includes("edg/")) browser = "Edge";
  else if (u.includes("chrome/") && !u.includes("edg/")) browser = "Chrome";
  else if (u.includes("firefox/")) browser = "Firefox";
  else if (u.includes("safari/") && !u.includes("chrome/")) browser = "Safari";
  else if (u.includes("opr/") || u.includes("opera")) browser = "Opera";

  let device = "Masaüstü";
  if (u.includes("mobile") || u.includes("iphone") || u.includes("android")) device = "Mobil";
  else if (u.includes("ipad") || u.includes("tablet")) device = "Tablet";

  return { browser, device };
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function files() {
  const dir = await getDataDir();
  return {
    snapshot: path.join(dir, "analytics.json"),
    hits: path.join(dir, "analytics.hits.jsonl"),
  };
}

async function readSnapshot(): Promise<AnalyticsSnapshot> {
  const { snapshot } = await files();
  try {
    const raw = await fs.readFile(snapshot, "utf8");
    const j = JSON.parse(raw) as Partial<AnalyticsSnapshot>;
    const nowDay = dayKey(new Date());
    const lastSeen = (j.lastSeen && typeof j.lastSeen === "object" ? (j.lastSeen as Record<string, number>) : {}) ?? {};
    const base: AnalyticsSnapshot = {
      day: typeof j.day === "string" ? j.day : nowDay,
      lastSeen,
      todayHits: typeof j.todayHits === "number" ? j.todayHits : 0,
      todayUniques: typeof j.todayUniques === "number" ? j.todayUniques : 0,
      todayMeta: (j.todayMeta && typeof j.todayMeta === "object" ? (j.todayMeta as AnalyticsSnapshot["todayMeta"]) : {}) ?? {},
    };
    if (base.day !== nowDay) {
      return { day: nowDay, lastSeen: base.lastSeen, todayHits: 0, todayUniques: 0, todayMeta: {} };
    }
    return base;
  } catch {
    const nowDay = dayKey(new Date());
    return { day: nowDay, lastSeen: {}, todayHits: 0, todayUniques: 0, todayMeta: {} };
  }
}

async function writeSnapshot(s: AnalyticsSnapshot) {
  const { snapshot } = await files();
  await fs.mkdir(path.dirname(snapshot), { recursive: true });
  await fs.writeFile(snapshot, JSON.stringify(s, null, 2), "utf8");
}

async function trimHitsFile() {
  const { hits } = await files();
  try {
    const raw = await fs.readFile(hits, "utf8");
    const lines = raw.split("\n").filter(Boolean);
    if (lines.length <= HITS_RETAIN_LINES) return;
    const kept = lines.slice(-HITS_RETAIN_LINES);
    await fs.writeFile(hits, `${kept.join("\n")}\n`, "utf8");
  } catch {
    /* yoksa sorun değil */
  }
}

function pruneLastSeen(lastSeen: Record<string, number>, keepMs: number) {
  const now = Date.now();
  for (const [k, v] of Object.entries(lastSeen)) {
    if (!v || now - v > keepMs) delete lastSeen[k];
  }
}

export async function recordHit(hit: AnalyticsHit): Promise<void> {
  const { hits } = await files();
  const snap = await readSnapshot();

  const now = Date.now();
  snap.todayHits += 1;
  const wasNewToday = !snap.todayMeta[hit.vid];
  if (wasNewToday) snap.todayUniques += 1;
  snap.todayMeta[hit.vid] = {
    ip: hit.ip,
    ua: hit.ua,
    lastPath: hit.path,
    lastTs: hit.ts,
    ...(hit.referer ? { referer: hit.referer } : {}),
  };
  snap.lastSeen[hit.vid] = now;

  pruneLastSeen(snap.lastSeen, 48 * 60 * 60 * 1000);

  await fs.mkdir(path.dirname(hits), { recursive: true });
  await fs.appendFile(hits, `${JSON.stringify(hit)}\n`, "utf8");
  if (snap.todayHits % 100 === 0) await trimHitsFile();
  await writeSnapshot(snap);
}

async function readAllHits(): Promise<AnalyticsHit[]> {
  const { hits } = await files();
  try {
    const raw = await fs.readFile(hits, "utf8");
    const out: AnalyticsHit[] = [];
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      try {
        const j = JSON.parse(line) as Partial<AnalyticsHit>;
        if (typeof j.ts !== "string" || typeof j.vid !== "string") continue;
        out.push({
          ts: j.ts,
          vid: j.vid,
          path: String(j.path ?? "/").slice(0, 200),
          ip: String(j.ip ?? "unknown").slice(0, 80),
          ua: String(j.ua ?? "").slice(0, 300),
          ...(j.referer ? { referer: String(j.referer).slice(0, 500) } : {}),
        });
      } catch {
        /* skip bad line */
      }
    }
    return out;
  } catch {
    return [];
  }
}

function hitMatchesQuery(hit: AnalyticsHit, q: string): boolean {
  const n = q.trim().toLowerCase();
  if (!n) return true;
  const { browser, device } = parseUserAgent(hit.ua);
  const blob = [hit.ip, hit.path, hit.vid, hit.ua, hit.referer ?? "", browser, device].join(" ").toLowerCase();
  return blob.includes(n);
}

export async function listVisitorHits(opts: {
  limit: number;
  offset: number;
  q?: string;
}): Promise<{ total: number; hits: VisitorHitRow[] }> {
  const limit = Math.min(Math.max(opts.limit, 1), 500);
  const offset = Math.max(opts.offset, 0);
  const q = opts.q?.trim() ?? "";

  let rows = await readAllHits();
  rows.sort((a, b) => (a.ts < b.ts ? 1 : -1));
  if (q) rows = rows.filter((h) => hitMatchesQuery(h, q));

  const total = rows.length;
  const slice = rows.slice(offset, offset + limit);
  const hits: VisitorHitRow[] = slice.map((h) => {
    const { browser, device } = parseUserAgent(h.ua);
    return { ...h, browser, device };
  });
  return { total, hits };
}

export type VisitorReportDay = {
  day: string;
  hits: number;
  uniques: number;
};

export type VisitorReport = {
  last7Days: VisitorReportDay[];
  topPages: { path: string; hits: number; uniques: number }[];
  topReferrers: { label: string; hits: number }[];
  devices: { device: string; count: number }[];
  browsers: { browser: string; count: number }[];
};

function refererLabel(raw?: string): string {
  if (!raw?.trim()) return "Doğrudan";
  try {
    return new URL(raw).hostname || raw.slice(0, 80);
  } catch {
    return raw.slice(0, 80);
  }
}

export async function getVisitorReport(): Promise<VisitorReport> {
  const hits = await readAllHits();
  const now = new Date();
  const dayKeys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    dayKeys.push(dayKey(d));
  }

  const byDay = new Map<string, { hits: number; vids: Set<string> }>();
  for (const k of dayKeys) byDay.set(k, { hits: 0, vids: new Set() });

  const byPath = new Map<string, { hits: number; vids: Set<string> }>();
  const byReferer = new Map<string, number>();
  const byDevice = new Map<string, number>();
  const byBrowser = new Map<string, number>();

  for (const h of hits) {
    const d = h.ts.slice(0, 10);
    const dayBucket = byDay.get(d);
    if (dayBucket) {
      dayBucket.hits += 1;
      dayBucket.vids.add(h.vid);
    }

    const pathKey = h.path || "/";
    const pathBucket = byPath.get(pathKey) ?? { hits: 0, vids: new Set<string>() };
    pathBucket.hits += 1;
    pathBucket.vids.add(h.vid);
    byPath.set(pathKey, pathBucket);

    const ref = refererLabel(h.referer);
    byReferer.set(ref, (byReferer.get(ref) ?? 0) + 1);

    const { browser, device } = parseUserAgent(h.ua);
    byDevice.set(device, (byDevice.get(device) ?? 0) + 1);
    byBrowser.set(browser, (byBrowser.get(browser) ?? 0) + 1);
  }

  const last7Days = dayKeys.map((day) => {
    const b = byDay.get(day)!;
    return { day, hits: b.hits, uniques: b.vids.size };
  });

  const topPages = [...byPath.entries()]
    .map(([path, b]) => ({ path, hits: b.hits, uniques: b.vids.size }))
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 10);

  const topReferrers = [...byReferer.entries()]
    .map(([label, count]) => ({ label, hits: count }))
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 8);

  const devices = [...byDevice.entries()]
    .map(([device, count]) => ({ device, count }))
    .sort((a, b) => b.count - a.count);

  const browsers = [...byBrowser.entries()]
    .map(([browser, count]) => ({ browser, count }))
    .sort((a, b) => b.count - a.count);

  return { last7Days, topPages, topReferrers, devices, browsers };
}

export async function getStats(): Promise<{
  day: string;
  onlineNow: number;
  todayHits: number;
  todayUniques: number;
  totalLogged: number;
  recent: Array<{
    vid: string;
    ip: string;
    lastTs: string;
    lastPath: string;
    ua: string;
    referer?: string;
    browser: string;
    device: string;
  }>;
}> {
  const snap = await readSnapshot();
  const ONLINE_WINDOW_MS = 3 * 60 * 1000;
  const now = Date.now();
  const onlineNow = Object.values(snap.lastSeen).filter((t) => now - t <= ONLINE_WINDOW_MS).length;
  const recent = Object.entries(snap.todayMeta)
    .map(([vid, m]) => {
      const { browser, device } = parseUserAgent(m.ua);
      return {
        vid,
        ip: m.ip,
        lastTs: m.lastTs,
        lastPath: m.lastPath,
        ua: m.ua,
        ...(m.referer ? { referer: m.referer } : {}),
        browser,
        device,
      };
    })
    .sort((a, b) => (a.lastTs < b.lastTs ? 1 : -1))
    .slice(0, 50);
  const all = await readAllHits();
  return {
    day: snap.day,
    onlineNow,
    todayHits: snap.todayHits,
    todayUniques: snap.todayUniques,
    totalLogged: all.length,
    recent,
  };
}

