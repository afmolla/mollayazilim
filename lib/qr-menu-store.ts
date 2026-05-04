import { promises as fs } from "fs";
import path from "path";
import { getDataDir } from "@/lib/data-dir";

async function qrMenuFile(): Promise<string> {
  return path.join(await getDataDir(), "qr-menu.json");
}

export type QrMenuUrun = {
  id: string;
  ad: string;
  aciklama?: string;
  /** İsteğe bağlı görsel URL (https://...) */
  gorselSrc?: string;
  /** Görsel alt metni (erişilebilirlik/SEO) */
  gorselAlt?: string;
  fiyat: string;
  sira: number;
};

export type QrMenuKategori = {
  id: string;
  baslik: string;
  aciklama?: string;
  sira: number;
  ogeler: QrMenuUrun[];
};

export type QrMenuData = {
  baslik: string;
  altBaslik: string;
  /** false = vitrin ve üst menüde gizli; panelden düzenlenebilir */
  yayin: boolean;
  guncellenme: string;
  kategoriler: QrMenuKategori[];
};

type Db = { menu: QrMenuData };

function newId() {
  return `qm_${Math.random().toString(36).slice(2, 10)}`;
}

function varsayilan(): QrMenuData {
  const now = new Date().toISOString();
  return {
    baslik: "QR Menü",
    altBaslik: "Kategorilere dokunarak inceleyin.",
    yayin: true,
    guncellenme: now,
    kategoriler: [
      {
        id: newId(),
        baslik: "Başlangıçlar",
        sira: 0,
        ogeler: [
          {
            id: newId(),
            ad: "Çorba",
            aciklama: "Günün çorbası",
            gorselSrc: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",
            gorselAlt: "Sıcak çorba",
            fiyat: "120 ₺",
            sira: 0,
          },
          {
            id: newId(),
            ad: "Meze tabağı",
            gorselSrc: "https://images.unsplash.com/photo-1541013406133-0b59c0d4f2b1?w=800&q=80",
            gorselAlt: "Meze tabağı",
            fiyat: "280 ₺",
            sira: 1,
          },
        ],
      },
      {
        id: newId(),
        baslik: "Ana yemekler",
        sira: 1,
        ogeler: [
          {
            id: newId(),
            ad: "Izgara köfte",
            aciklama: "Pilav ve salata ile",
            gorselSrc: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
            gorselAlt: "Izgara köfte",
            fiyat: "420 ₺",
            sira: 0,
          },
          {
            id: newId(),
            ad: "Tavuk şiş",
            gorselSrc: "https://images.unsplash.com/photo-1604908176997-125f25cc500f?w=800&q=80",
            gorselAlt: "Tavuk şiş",
            fiyat: "380 ₺",
            sira: 1,
          },
        ],
      },
    ],
  };
}

async function oku(): Promise<Db> {
  const FILE = await qrMenuFile();
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const j = JSON.parse(raw) as Partial<Db>;
    if (j.menu && typeof j.menu === "object") {
      return {
        menu: {
          baslik: String(j.menu.baslik ?? varsayilan().baslik),
          altBaslik: String(j.menu.altBaslik ?? ""),
          yayin: j.menu.yayin !== false,
          guncellenme: String(j.menu.guncellenme ?? new Date().toISOString()),
          kategoriler: Array.isArray(j.menu.kategoriler) ? (j.menu.kategoriler as QrMenuKategori[]) : [],
        },
      };
    }
  } catch {
    /* yok */
  }
  return { menu: varsayilan() };
}

async function yaz(db: Db): Promise<void> {
  const FILE = await qrMenuFile();
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(db, null, 2), "utf8");
}

export async function qrMenuGetir(): Promise<QrMenuData> {
  const { menu } = await oku();
  return menu;
}

export async function qrMenuKaydet(patch: Partial<QrMenuData>): Promise<QrMenuData> {
  const cur = await qrMenuGetir();
  const next: QrMenuData = {
    baslik: patch.baslik ?? cur.baslik,
    altBaslik: patch.altBaslik ?? cur.altBaslik,
    yayin: typeof patch.yayin === "boolean" ? patch.yayin : cur.yayin,
    guncellenme: new Date().toISOString(),
    kategoriler: Array.isArray(patch.kategoriler) ? patch.kategoriler : cur.kategoriler,
  };
  await yaz({ menu: next });
  return next;
}
