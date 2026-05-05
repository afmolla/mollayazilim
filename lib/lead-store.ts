import { promises as fs } from "fs";
import path from "path";
import { getDataDir } from "@/lib/data-dir";
import { createHash } from "crypto";

export type LeadPayload = {
  name: string;
  phone: string;
  company?: string;
  message?: string;
  sourcePath?: string;
};

export type LeadRecord = {
  id?: string;
  ts: string;
  vid?: string;
  ip?: string;
  ua?: string;
} & LeadPayload;

export type LeadStatus = "yeni" | "aranacak" | "kapandi";

export type LeadMeta = {
  status?: LeadStatus;
  note?: string;
  updatedTs?: string;
};

async function files() {
  const dir = await getDataDir();
  return {
    leads: path.join(dir, "leads.jsonl"),
    meta: path.join(dir, "leads.meta.json"),
  };
}

export async function recordLead(lead: LeadRecord): Promise<void> {
  const { leads } = await files();
  await fs.mkdir(path.dirname(leads), { recursive: true });
  await fs.appendFile(leads, `${JSON.stringify(lead)}\n`, "utf8");
}

function stableId(x: LeadRecord): string {
  if (x.id) return x.id;
  const raw = `${x.ts}|${x.vid ?? ""}|${x.phone}|${x.name}|${x.sourcePath ?? ""}`;
  return createHash("sha256").update(raw).digest("hex").slice(0, 24);
}

async function readMeta(): Promise<Record<string, LeadMeta>> {
  const { meta } = await files();
  try {
    const raw = await fs.readFile(meta, "utf8");
    const j = JSON.parse(raw) as unknown;
    if (!j || typeof j !== "object") return {};
    return j as Record<string, LeadMeta>;
  } catch {
    return {};
  }
}

async function writeMeta(m: Record<string, LeadMeta>) {
  const { meta } = await files();
  await fs.mkdir(path.dirname(meta), { recursive: true });
  await fs.writeFile(meta, JSON.stringify(m, null, 2), "utf8");
}

export async function listLeads(limit = 200): Promise<Array<LeadRecord & { id: string; meta?: LeadMeta }>> {
  const { leads } = await files();
  const meta = await readMeta();
  try {
    const raw = await fs.readFile(leads, "utf8");
    const rows: LeadRecord[] = [];
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t) continue;
      try {
        const obj = JSON.parse(t) as LeadRecord;
        if (!obj || typeof obj !== "object") continue;
        if (typeof obj.ts !== "string" || typeof obj.name !== "string" || typeof obj.phone !== "string") continue;
        rows.push(obj);
      } catch {
        // ignore bad line
      }
    }
    rows.sort((a, b) => (a.ts < b.ts ? 1 : -1));
    return rows.slice(0, Math.max(1, limit)).map((r) => {
      const id = stableId(r);
      return { ...r, id, meta: meta[id] };
    });
  } catch {
    return [];
  }
}

export async function updateLeadMeta(id: string, patch: LeadMeta): Promise<LeadMeta> {
  const meta = await readMeta();
  const cur = meta[id] ?? {};
  const next: LeadMeta = {
    ...cur,
    ...patch,
    note: typeof patch.note === "string" ? patch.note.slice(0, 2000) : cur.note,
    status:
      patch.status === "yeni" || patch.status === "aranacak" || patch.status === "kapandi"
        ? patch.status
        : cur.status,
    updatedTs: new Date().toISOString(),
  };
  meta[id] = next;
  await writeMeta(meta);
  return next;
}

