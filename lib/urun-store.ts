import { promises as fs } from "fs";
import path from "path";
import { getDataDir } from "@/lib/data-dir";
import type { UrunKayit } from "@/lib/urun-types";

type Db = { urunler: UrunKayit[] };

async function urunlerFile(): Promise<string> {
  return path.join(await getDataDir(), "urunler.json");
}

export async function urunlerGetir(): Promise<UrunKayit[]> {
  const FILE = await urunlerFile();
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const db = JSON.parse(raw) as Db;
    return Array.isArray(db.urunler) ? db.urunler : [];
  } catch {
    return [];
  }
}

export async function urunlerKaydet(next: UrunKayit[]): Promise<void> {
  const FILE = await urunlerFile();
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify({ urunler: next } satisfies Db, null, 2), "utf8");
}

export function urunYayinda(list: UrunKayit[]): UrunKayit[] {
  return list.filter((x) => x.yayinda && x.stokta);
}

export async function urunBySlug(slug: string): Promise<UrunKayit | null> {
  const list = await urunlerGetir();
  return list.find((x) => x.slug === slug) ?? null;
}

export async function urunById(id: string): Promise<UrunKayit | null> {
  const list = await urunlerGetir();
  return list.find((x) => x.id === id) ?? null;
}

export function slugifyUrun(baslik: string): string {
  return baslik
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function urunEkle(
  kayit: Omit<UrunKayit, "id" | "guncellenme" | "slug"> & { id?: string; slug?: string },
): Promise<UrunKayit> {
  const list = await urunlerGetir();
  const id = kayit.id?.trim() || `urun_${Math.random().toString(36).slice(2, 12)}`;
  const slugBase = kayit.slug?.trim() || slugifyUrun(kayit.baslik);
  let slug = slugBase;
  let n = 1;
  while (list.some((x) => x.slug === slug && x.id !== id)) {
    slug = `${slugBase}-${n++}`;
  }
  const row: UrunKayit = {
    ...kayit,
    id,
    slug,
    guncellenme: new Date().toISOString(),
  };
  list.push(row);
  await urunlerKaydet(list);
  return row;
}

export async function urunGuncelle(
  id: string,
  patch: Partial<Omit<UrunKayit, "id">>,
): Promise<UrunKayit | null> {
  const list = await urunlerGetir();
  const i = list.findIndex((x) => x.id === id);
  if (i < 0) return null;
  list[i] = {
    ...list[i],
    ...patch,
    id: list[i].id,
    guncellenme: new Date().toISOString(),
  };
  await urunlerKaydet(list);
  return list[i];
}

export async function urunSil(id: string): Promise<boolean> {
  const list = await urunlerGetir();
  const next = list.filter((x) => x.id !== id);
  if (next.length === list.length) return false;
  await urunlerKaydet(next);
  return true;
}

export type { UrunKayit, UrunKategoriId, UrunVaryant } from "@/lib/urun-types";
export { URUN_KATEGORILER, formatTry, urunVaryantFiyat } from "@/lib/urun-types";
