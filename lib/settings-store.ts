import { promises as fs } from "fs";
import path from "path";

export type SiteAyarlar = {
  salonAd: string;
  whatsapp: string;
  adresKisa: string;
  adresDetay: string;
  calismaSaatleri: string;
  sehir: string;
  menuDavranis?: "hover" | "sabit";
  /** Yönetim paneli: sol menü kaydırırken görünür kalsın */
  panelSolMenuSabitle?: boolean;
  /** Yönetim paneli: ilk açılışta menü dar mı (tarayıcıda yerel tercih yoksa) */
  panelSolMenuBaslangic?: "acik" | "dar";
  instagram?: string;
  facebook?: string;
  googleMaps?: string;
};

type Db = { ayarlar: SiteAyarlar };

const FILE = path.join(/* turbopackIgnore: true */ process.cwd(), "data", "settings.json");

function varsayilan(): SiteAyarlar {
  return {
    salonAd: process.env.NEXT_PUBLIC_SALON_AD ?? "Atlas Kuaför Studio",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_SALON ?? "905551234567",
    adresKisa: "Nişantaşı · İstanbul",
    adresDetay: "Teşvikiye Mah. Örnek Sok. No:1, Şişli / İstanbul",
    calismaSaatleri: "Her gün 09:00 — 21:00",
    sehir: "İstanbul",
    menuDavranis: "hover",
    panelSolMenuSabitle: true,
    panelSolMenuBaslangic: "acik",
  };
}

export async function ayarlarGetir(): Promise<SiteAyarlar> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const db = JSON.parse(raw) as Partial<Db>;
    return { ...varsayilan(), ...(db.ayarlar ?? {}) };
  } catch {
    return varsayilan();
  }
}

export async function ayarlarKaydet(patch: Partial<SiteAyarlar>): Promise<SiteAyarlar> {
  const cur = await ayarlarGetir();
  const menuDavranis: "hover" | "sabit" =
    patch.menuDavranis === "sabit" || patch.menuDavranis === "hover"
      ? patch.menuDavranis
      : (cur.menuDavranis ?? "hover");
  const panelSolMenuSabitle =
    typeof patch.panelSolMenuSabitle === "boolean"
      ? patch.panelSolMenuSabitle
      : (cur.panelSolMenuSabitle ?? true);
  const panelSolMenuBaslangic: "acik" | "dar" =
    patch.panelSolMenuBaslangic === "dar" || patch.panelSolMenuBaslangic === "acik"
      ? patch.panelSolMenuBaslangic
      : (cur.panelSolMenuBaslangic ?? "acik");
  const next: SiteAyarlar = {
    ...cur,
    ...patch,
    salonAd: (patch.salonAd ?? cur.salonAd).trim(),
    whatsapp: (patch.whatsapp ?? cur.whatsapp).trim(),
    adresKisa: (patch.adresKisa ?? cur.adresKisa).trim(),
    adresDetay: (patch.adresDetay ?? cur.adresDetay).trim(),
    calismaSaatleri: (patch.calismaSaatleri ?? cur.calismaSaatleri).trim(),
    sehir: (patch.sehir ?? cur.sehir).trim(),
    menuDavranis,
    panelSolMenuSabitle,
    panelSolMenuBaslangic,
  };

  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify({ ayarlar: next } satisfies Db, null, 2), "utf8");
  return next;
}

