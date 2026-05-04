import { promises as fs } from "fs";
import path from "path";
import { getDataDir } from "@/lib/data-dir";

export type Medya = {
  id: string;
  ad: string;
  url: string;
  mime: string;
  boyut: number;
  olusturulma: string;
};

type MedyaDb = { medya: Medya[] };

const UPLOAD_DIR = path.join(/* turbopackIgnore: true */ process.cwd(), "public", "uploads");

async function dbFile(): Promise<string> {
  return path.join(await getDataDir(), "media.json");
}

async function oku(): Promise<MedyaDb> {
  const DB_FILE = await dbFile();
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    return JSON.parse(raw) as MedyaDb;
  } catch {
    return { medya: [] };
  }
}

async function yaz(db: MedyaDb): Promise<void> {
  const DB_FILE = await dbFile();
  await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

export async function medyaListele(): Promise<Medya[]> {
  const { medya } = await oku();
  return [...medya].sort(
    (a, b) => new Date(b.olusturulma).getTime() - new Date(a.olusturulma).getTime()
  );
}

export async function medyaKaydet(input: {
  id: string;
  ad: string;
  url: string;
  mime: string;
  boyut: number;
}): Promise<Medya> {
  const db = await oku();
  const m: Medya = {
    id: input.id,
    ad: input.ad,
    url: input.url,
    mime: input.mime,
    boyut: input.boyut,
    olusturulma: new Date().toISOString(),
  };
  db.medya.push(m);
  await yaz(db);
  return m;
}

export async function medyaSil(id: string): Promise<boolean> {
  const db = await oku();
  const before = db.medya.length;
  const item = db.medya.find((x) => x.id === id);
  db.medya = db.medya.filter((x) => x.id !== id);
  if (db.medya.length === before || !item) return false;
  await yaz(db);
  const rel = item.url.replace(/^\/+/, "");
  const filePath = path.join(/* turbopackIgnore: true */ process.cwd(), "public", rel);
  try {
    await fs.unlink(filePath);
  } catch {
    /* ignore */
  }
  return true;
}

export async function ensureUploadDir(): Promise<void> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export function uploadDir(): string {
  return UPLOAD_DIR;
}
