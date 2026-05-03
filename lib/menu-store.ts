import { promises as fs } from "fs";
import path from "path";

export type MenuItem = {
  label: string;
  href: string;
  newTab?: boolean;
  /** Alt menü öğeleri (isteğe bağlı) */
  children?: MenuItem[];
};

export type MenuLocation = "header" | "footer";

type Db = { header: MenuItem[]; footer: MenuItem[] };

const FILE = path.join(/* turbopackIgnore: true */ process.cwd(), "data", "menus.json");

function varsayilan(): Db {
  return {
    header: [
      { href: "/anasayfa", label: "Ana Sayfa" },
      { href: "/hizmetler", label: "Hizmetler" },
      { href: "/galeri", label: "Galeri" },
      { href: "/randevular", label: "Randevular" },
      { href: "/randevu", label: "Randevu Al" },
      { href: "/iletisim", label: "İletişim" },
    ],
    footer: [
      { href: "/randevu", label: "Online randevu" },
      { href: "/randevular", label: "Onaylı randevu örnekleri" },
      { href: "/panel", label: "Yönetim paneli" },
    ],
  };
}

/** Geçersiz düğümleri atar; alt menüleri özyinelemeli temizler */
export function cleanMenuItem(x: unknown): MenuItem | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const label = String(o.label ?? "").trim();
  if (!label) return null;
  const hrefRaw = String(o.href ?? "").trim();
  const newTab = !!o.newTab;
  const rawChildren = o.children;
  const children = Array.isArray(rawChildren)
    ? rawChildren.map(cleanMenuItem).filter((c): c is MenuItem => c !== null)
    : [];

  if (children.length > 0) {
    const href = hrefRaw && hrefRaw !== "#" ? hrefRaw : "#";
    return { label, href, newTab, children };
  }
  if (!hrefRaw || hrefRaw === "#") return null;
  return { label: label, href: hrefRaw, newTab };
}

export async function menuGetir(): Promise<Db> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const db = JSON.parse(raw) as Partial<Db>;
    const header = Array.isArray(db.header) ? db.header.map(cleanMenuItem).filter((x): x is MenuItem => x !== null) : varsayilan().header;
    const footer = Array.isArray(db.footer) ? db.footer.map(cleanMenuItem).filter((x): x is MenuItem => x !== null) : varsayilan().footer;
    return { header: header.length ? header : varsayilan().header, footer: footer.length ? footer : varsayilan().footer };
  } catch {
    return varsayilan();
  }
}

export async function menuKaydet(loc: MenuLocation, items: MenuItem[]): Promise<Db> {
  const cur = await menuGetir();
  const cleaned = items.map(cleanMenuItem).filter((x): x is MenuItem => x !== null);
  const next: Db = { ...cur, [loc]: cleaned } as Db;
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(next, null, 2), "utf8");
  return next;
}
