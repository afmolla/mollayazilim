import { promises as fs } from "fs";
import path from "path";
import { getDataDir } from "@/lib/data-dir";

export type IlanTip = "satilik" | "kiralik";

export type IlanKayit = {
  id: string;
  baslik: string;
  ozet: string;
  il: string;
  ilce: string;
  mahalle?: string;
  tip: IlanTip;
  /** Brüt m² */
  metrekare: number;
  oda: string;
  /** TRY */
  fiyat: number;
  /** HTTPS görsel */
  kapakSrc: string;
  yayinda: boolean;
  guncellenme: string;
};

type Db = { ilanlar: IlanKayit[] };

async function ilanlarFile(): Promise<string> {
  return path.join(await getDataDir(), "ilanlar.json");
}

export async function ilanlarGetir(): Promise<IlanKayit[]> {
  const FILE = await ilanlarFile();
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const db = JSON.parse(raw) as Db;
    return Array.isArray(db.ilanlar) ? db.ilanlar : [];
  } catch {
    return [];
  }
}

export async function ilanlarKaydet(next: IlanKayit[]): Promise<void> {
  const FILE = await ilanlarFile();
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify({ ilanlar: next } satisfies Db, null, 2), "utf8");
}

export async function ilanById(id: string): Promise<IlanKayit | null> {
  const list = await ilanlarGetir();
  return list.find((x) => x.id === id) ?? null;
}

export function ilanYayinda(list: IlanKayit[]): IlanKayit[] {
  return list.filter((x) => x.yayinda);
}

export async function ilanEkle(kayit: Omit<IlanKayit, "id" | "guncellenme"> & { id?: string }): Promise<IlanKayit> {
  const list = await ilanlarGetir();
  const id = kayit.id?.trim() || `ilan_${Math.random().toString(36).slice(2, 12)}`;
  const row: IlanKayit = {
    ...kayit,
    id,
    guncellenme: new Date().toISOString(),
  };
  list.push(row);
  await ilanlarKaydet(list);
  return row;
}

export async function ilanGuncelle(
  id: string,
  patch: Partial<Omit<IlanKayit, "id">>,
): Promise<IlanKayit | null> {
  const list = await ilanlarGetir();
  const i = list.findIndex((x) => x.id === id);
  if (i < 0) return null;
  list[i] = {
    ...list[i],
    ...patch,
    id,
    guncellenme: new Date().toISOString(),
  };
  await ilanlarKaydet(list);
  return list[i]!;
}

export async function ilanSil(id: string): Promise<boolean> {
  const list = await ilanlarGetir();
  const next = list.filter((x) => x.id !== id);
  if (next.length === list.length) return false;
  await ilanlarKaydet(next);
  return true;
}

export function ilanlariFiltrele(
  list: IlanKayit[],
  opts: { tip?: IlanTip | ""; il?: string; q?: string; minFiyat?: number; maxFiyat?: number },
): IlanKayit[] {
  let out = ilanYayinda(list);
  if (opts.tip === "satilik" || opts.tip === "kiralik") {
    out = out.filter((x) => x.tip === opts.tip);
  }
  const il = opts.il?.trim();
  if (il) {
    const ilo = il.toLocaleLowerCase("tr");
    out = out.filter(
      (x) =>
        x.il.toLocaleLowerCase("tr").includes(ilo) ||
        x.ilce.toLocaleLowerCase("tr").includes(ilo),
    );
  }
  const q = opts.q?.trim().toLocaleLowerCase("tr");
  if (q) {
    out = out.filter(
      (x) =>
        x.baslik.toLocaleLowerCase("tr").includes(q) ||
        x.ozet.toLocaleLowerCase("tr").includes(q) ||
        x.mahalle?.toLocaleLowerCase("tr").includes(q),
    );
  }
  if (typeof opts.minFiyat === "number" && Number.isFinite(opts.minFiyat)) {
    out = out.filter((x) => x.fiyat >= opts.minFiyat!);
  }
  if (typeof opts.maxFiyat === "number" && Number.isFinite(opts.maxFiyat)) {
    out = out.filter((x) => x.fiyat <= opts.maxFiyat!);
  }
  return out.sort((a, b) => new Date(b.guncellenme).getTime() - new Date(a.guncellenme).getTime());
}
