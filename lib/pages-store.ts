import { promises as fs } from "fs";
import { getDataDir } from "@/lib/data-dir";
import type { SayfaBlok } from "./cms-blok";

export type { SayfaBlok } from "./cms-blok";
export { bloklardanHtml, sayfaSlugify } from "./cms-blok";

export type Sayfa = {
  slug: string;
  baslik: string;
  aciklama?: string;
  icerikHtml: string;
  bloklar?: SayfaBlok[];
  /** false = robots noindex; eski kayıtlarda yok → indeksle */
  seoIndex?: boolean;
  yayin: boolean;
  guncellenme: string;
};

type SayfaDb = { sayfalar: Sayfa[] };

const DOSYA = path.join(/* turbopackIgnore: true */ getDataDir(), "sayfalar.json");

function slugify(raw: string): string {
  return raw
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function oku(): Promise<SayfaDb> {
  try {
    const raw = await fs.readFile(DOSYA, "utf8");
    return JSON.parse(raw) as SayfaDb;
  } catch {
    return { sayfalar: [] };
  }
}

async function yaz(db: SayfaDb): Promise<void> {
  await fs.mkdir(path.dirname(DOSYA), { recursive: true });
  await fs.writeFile(DOSYA, JSON.stringify(db, null, 2), "utf8");
}

export async function tumSayfalar(): Promise<Sayfa[]> {
  const { sayfalar } = await oku();
  return [...sayfalar].sort(
    (a, b) => new Date(b.guncellenme).getTime() - new Date(a.guncellenme).getTime()
  );
}

export async function yayinSayfalar(): Promise<Sayfa[]> {
  const all = await tumSayfalar();
  return all.filter((s) => s.yayin);
}

export async function sayfaBySlug(slug: string): Promise<Sayfa | undefined> {
  const s = slugify(slug);
  const all = await tumSayfalar();
  return all.find((x) => x.slug === s);
}

export async function sayfaUpsert(input: {
  slug: string;
  baslik: string;
  aciklama?: string;
  icerikHtml: string;
  bloklar?: SayfaBlok[];
  seoIndex?: boolean;
  yayin: boolean;
}): Promise<Sayfa> {
  const db = await oku();
  const now = new Date().toISOString();
  const slug = slugify(input.slug);
  if (!slug) throw new Error("Slug boş olamaz");
  const baslik = input.baslik.trim();
  if (!baslik) throw new Error("Başlık boş olamaz");

  const i = db.sayfalar.findIndex((x) => x.slug === slug);
  const existing = i >= 0 ? db.sayfalar[i] : undefined;
  const icerikHtml =
    typeof input.icerikHtml === "string" ? input.icerikHtml : (existing?.icerikHtml ?? "");
  const bloklar = Array.isArray(input.bloklar) ? input.bloklar : existing?.bloklar;
  const s: Sayfa = {
    slug,
    baslik,
    aciklama: input.aciklama?.trim() || undefined,
    icerikHtml,
    bloklar,
    seoIndex: input.seoIndex === false ? false : true,
    yayin: !!input.yayin,
    guncellenme: now,
  };
  if (i === -1) db.sayfalar.push(s);
  else db.sayfalar[i] = s;
  await yaz(db);
  return s;
}

export async function sayfaSil(slug: string): Promise<boolean> {
  const db = await oku();
  const s = slugify(slug);
  const before = db.sayfalar.length;
  db.sayfalar = db.sayfalar.filter((x) => x.slug !== s);
  if (db.sayfalar.length === before) return false;
  await yaz(db);
  return true;
}

