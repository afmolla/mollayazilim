import { promises as fs } from "fs";
import path from "path";
import { getDataDir } from "@/lib/data-dir";

export type AnalyticsHit = {
  ts: string;
  vid: string;
  path: string;
  ip: string;
  ua: string;
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
  todayMeta: Record<string, { ip: string; ua: string; lastPath: string; lastTs: string }>;
};

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
  snap.todayMeta[hit.vid] = { ip: hit.ip, ua: hit.ua, lastPath: hit.path, lastTs: hit.ts };
  snap.lastSeen[hit.vid] = now;

  pruneLastSeen(snap.lastSeen, 48 * 60 * 60 * 1000);

  await fs.mkdir(path.dirname(hits), { recursive: true });
  await fs.appendFile(hits, `${JSON.stringify(hit)}\n`, "utf8");
  await writeSnapshot(snap);
}

export async function getStats(): Promise<{
  day: string;
  onlineNow: number;
  todayHits: number;
  todayUniques: number;
  recent: Array<{ vid: string; ip: string; lastTs: string; lastPath: string }>;
}> {
  const snap = await readSnapshot();
  const ONLINE_WINDOW_MS = 3 * 60 * 1000;
  const now = Date.now();
  const onlineNow = Object.values(snap.lastSeen).filter((t) => now - t <= ONLINE_WINDOW_MS).length;
  const recent = Object.entries(snap.todayMeta)
    .map(([vid, m]) => ({ vid, ip: m.ip, lastTs: m.lastTs, lastPath: m.lastPath }))
    .sort((a, b) => (a.lastTs < b.lastTs ? 1 : -1))
    .slice(0, 50);
  return { day: snap.day, onlineNow, todayHits: snap.todayHits, todayUniques: snap.todayUniques, recent };
}

