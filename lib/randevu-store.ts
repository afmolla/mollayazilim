import { promises as fs } from "fs";
import path from "path";
import { getDataDir } from "@/lib/data-dir";
import type { Randevu, RandevuListesi } from "./types";

async function dosyaYolu(): Promise<string> {
  return path.join(await getDataDir(), "randevular.json");
}

async function dosyaOku(): Promise<RandevuListesi> {
  const DOSYA = await dosyaYolu();
  try {
    const raw = await fs.readFile(DOSYA, "utf8");
    const parsed = JSON.parse(raw) as Partial<RandevuListesi>;
    const randevular = Array.isArray(parsed.randevular) ? parsed.randevular : [];
    return { randevular };
  } catch {
    return { randevular: [] };
  }
}

function satirGecerli(r: unknown): r is Randevu {
  if (!r || typeof r !== "object") return false;
  const o = r as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.ad === "string" &&
    typeof o.telefon === "string" &&
    typeof o.hizmet === "string" &&
    typeof o.tarih === "string" &&
    typeof o.saat === "string" &&
    typeof o.durum === "string" &&
    typeof o.olusturulma === "string"
  );
}

async function dosyaYaz(data: RandevuListesi): Promise<void> {
  const DOSYA = await dosyaYolu();
  await fs.mkdir(path.dirname(DOSYA), { recursive: true });
  await fs.writeFile(DOSYA, JSON.stringify(data, null, 2), "utf8");
}

export async function tumRandevular(): Promise<Randevu[]> {
  try {
    const { randevular } = await dosyaOku();
    const rows = randevular.filter(satirGecerli);
    return [...rows].sort((a, b) => {
      const tb = new Date(b.olusturulma ?? 0).getTime();
      const ta = new Date(a.olusturulma ?? 0).getTime();
      return tb - ta;
    });
  } catch {
    return [];
  }
}

export async function randevuById(id: string): Promise<Randevu | undefined> {
  const list = await tumRandevular();
  return list.find((r) => r.id === id);
}

export async function randevuEkle(r: Omit<Randevu, "id" | "olusturulma">): Promise<Randevu> {
  const data = await dosyaOku();
  const yeni: Randevu = {
    ...r,
    id: crypto.randomUUID(),
    olusturulma: new Date().toISOString(),
  };
  data.randevular.push(yeni);
  await dosyaYaz(data);
  return yeni;
}

export async function randevuGuncelle(
  id: string,
  patch: Partial<Pick<Randevu, "durum" | "notlar">>
): Promise<Randevu | null> {
  const data = await dosyaOku();
  const i = data.randevular.findIndex((x) => x.id === id);
  if (i === -1) return null;
  data.randevular[i] = { ...data.randevular[i], ...patch };
  await dosyaYaz(data);
  return data.randevular[i];
}

/** Genel sitede listelenen: onaylı randevular (demo için zengin içerik) */
export async function yayindakiRandevular(): Promise<Randevu[]> {
  const all = await tumRandevular();
  return all.filter((r) => r.durum === "onaylandi");
}
