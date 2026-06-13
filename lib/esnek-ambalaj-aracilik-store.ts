import { promises as fs } from "fs";
import path from "path";
import { getDataDir } from "@/lib/data-dir";
import type { AmbalajMalzeme } from "@/lib/esnek-ambalaj-pricing";

export type EsnekAmbalajAracilik = {
  /** Müşteriye yansıyan aracılık marjı (%) */
  aracilikMarjYuzde: number;
  /** Bu kg altında küçük parti ek ücreti uygulanır */
  minSiparisKg: number;
  /** minSiparisKg altı ek yüzde */
  kucukPartiEkYuzde: number;
  /** Tahmini teslim (iş günü) */
  teslimGunMin: number;
  teslimGunMax: number;
  /** Tedarikçi kg maliyetleri — boşsa pricing varsayılanları kullanılır */
  tedarikciKgFiyat: Partial<Record<AmbalajMalzeme, number>>;
  /** Müşteri fiyat ekranında marj dökümü göster (genelde false) */
  marjDokumuGoster: boolean;
};

type Db = { aracilik: EsnekAmbalajAracilik };

const DEFAULT: EsnekAmbalajAracilik = {
  aracilikMarjYuzde: 15,
  minSiparisKg: 40,
  kucukPartiEkYuzde: 12,
  teslimGunMin: 5,
  teslimGunMax: 12,
  tedarikciKgFiyat: {},
  marjDokumuGoster: false,
};

async function aracilikFile(): Promise<string> {
  return path.join(await getDataDir(), "aracilik.json");
}

export async function aracilikGetir(): Promise<EsnekAmbalajAracilik> {
  const FILE = await aracilikFile();
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const db = JSON.parse(raw) as Partial<Db>;
    return { ...DEFAULT, ...(db.aracilik ?? {}) };
  } catch {
    return DEFAULT;
  }
}

export async function aracilikKaydet(patch: Partial<EsnekAmbalajAracilik>): Promise<EsnekAmbalajAracilik> {
  const FILE = await aracilikFile();
  const cur = await aracilikGetir();
  const next: EsnekAmbalajAracilik = {
    ...cur,
    ...patch,
    aracilikMarjYuzde: clampNum(patch.aracilikMarjYuzde ?? cur.aracilikMarjYuzde, 5, 40),
    minSiparisKg: clampNum(patch.minSiparisKg ?? cur.minSiparisKg, 10, 500),
    kucukPartiEkYuzde: clampNum(patch.kucukPartiEkYuzde ?? cur.kucukPartiEkYuzde, 0, 30),
    teslimGunMin: clampNum(patch.teslimGunMin ?? cur.teslimGunMin, 1, 30),
    teslimGunMax: clampNum(patch.teslimGunMax ?? cur.teslimGunMax, 2, 45),
    tedarikciKgFiyat: { ...cur.tedarikciKgFiyat, ...(patch.tedarikciKgFiyat ?? {}) },
    marjDokumuGoster:
      typeof patch.marjDokumuGoster === "boolean" ? patch.marjDokumuGoster : cur.marjDokumuGoster,
  };
  if (next.teslimGunMax < next.teslimGunMin) next.teslimGunMax = next.teslimGunMin;

  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify({ aracilik: next } satisfies Db, null, 2), "utf8");
  return next;
}

function clampNum(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
