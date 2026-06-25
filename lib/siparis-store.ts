import { promises as fs } from "fs";
import path from "path";
import { getDataDir } from "@/lib/data-dir";
import type { Siparis, SiparisDurum, SiparisListesi } from "@/lib/types";

async function dosyaYolu(): Promise<string> {
  return path.join(await getDataDir(), "siparisler.json");
}

async function dosyaOku(): Promise<SiparisListesi> {
  const DOSYA = await dosyaYolu();
  try {
    const raw = await fs.readFile(DOSYA, "utf8");
    const parsed = JSON.parse(raw) as Partial<SiparisListesi>;
    const siparisler = Array.isArray(parsed.siparisler) ? parsed.siparisler : [];
    return { siparisler };
  } catch {
    return { siparisler: [] };
  }
}

function satirGecerli(r: unknown): r is Siparis {
  if (!r || typeof r !== "object") return false;
  const o = r as Record<string, unknown>;
  const kaynakOk = o.kaynak === "mobil" || o.kaynak === "web";
  return (
    typeof o.id === "string" &&
    typeof o.olusturulma === "string" &&
    typeof o.telefon === "string" &&
    kaynakOk &&
    typeof o.durum === "string" &&
    Array.isArray(o.satirlar)
  );
}

async function dosyaYaz(data: SiparisListesi): Promise<void> {
  const DOSYA = await dosyaYolu();
  await fs.mkdir(path.dirname(DOSYA), { recursive: true });
  await fs.writeFile(DOSYA, JSON.stringify(data, null, 2), "utf8");
}

export async function tumSiparisler(): Promise<Siparis[]> {
  try {
    const { siparisler } = await dosyaOku();
    const rows = siparisler.filter(satirGecerli);
    return [...rows].sort((a, b) => {
      const tb = new Date(b.olusturulma ?? 0).getTime();
      const ta = new Date(a.olusturulma ?? 0).getTime();
      return tb - ta;
    });
  } catch {
    return [];
  }
}

export async function siparisById(id: string): Promise<Siparis | undefined> {
  const list = await tumSiparisler();
  return list.find((r) => r.id === id);
}

export async function siparisEkle(r: Omit<Siparis, "id" | "olusturulma">): Promise<Siparis> {
  const data = await dosyaOku();
  const yeni: Siparis = {
    ...r,
    id: crypto.randomUUID(),
    olusturulma: new Date().toISOString(),
  };
  data.siparisler.push(yeni);
  await dosyaYaz(data);
  return yeni;
}

export async function siparisGuncelle(
  id: string,
  patch: Partial<Pick<Siparis, "durum" | "notlar" | "odemeDurum" | "odemeReferans">>,
): Promise<Siparis | null> {
  const data = await dosyaOku();
  const i = data.siparisler.findIndex((x) => satirGecerli(x) && x.id === id);
  if (i === -1) return null;
  const cur = data.siparisler[i] as Siparis;
  const nextDurum =
    patch.durum === "beklemede" ||
    patch.durum === "hazirlaniyor" ||
    patch.durum === "tamamlandi" ||
    patch.durum === "iptal"
      ? patch.durum
      : cur.durum;
  const odemeOk =
    patch.odemeDurum === "bekliyor" ||
    patch.odemeDurum === "baslatildi" ||
    patch.odemeDurum === "odendi" ||
    patch.odemeDurum === "basarisiz" ||
    patch.odemeDurum === "iptal";
  data.siparisler[i] = {
    ...cur,
    durum: nextDurum,
    notlar: typeof patch.notlar === "string" ? patch.notlar : cur.notlar,
    odemeDurum: odemeOk ? patch.odemeDurum : cur.odemeDurum,
    odemeReferans: typeof patch.odemeReferans === "string" ? patch.odemeReferans : cur.odemeReferans,
  };
  await dosyaYaz(data);
  return data.siparisler[i] as Siparis;
}

export function gecerliSiparisDurum(d: unknown): d is SiparisDurum {
  return (
    d === "beklemede" || d === "hazirlaniyor" || d === "tamamlandi" || d === "iptal"
  );
}
