import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { ayarlarGetir, ayarlarKaydet, type SiteAyarlar } from "@/lib/settings-store";
import { menuGetir, menuKaydet, type MenuItem } from "@/lib/menu-store";
import { icerikGetir, icerikKaydet, type SiteIcerik } from "@/lib/content-store";
import { medyaListele } from "@/lib/media-store";
import { tumSayfalar, type Sayfa } from "@/lib/pages-store";
export const runtime = "nodejs";

type BackupPayload = {
  version: 1;
  exportedAt: string;
  settings: Awaited<ReturnType<typeof ayarlarGetir>>;
  menus: Awaited<ReturnType<typeof menuGetir>>;
  content: Awaited<ReturnType<typeof icerikGetir>>;
  pages: Awaited<ReturnType<typeof tumSayfalar>>;
  media: Awaited<ReturnType<typeof medyaListele>>;
};

export async function GET() {
  if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const payload: BackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: await ayarlarGetir(),
    menus: await menuGetir(),
    content: await icerikGetir(),
    pages: await tumSayfalar(),
    media: await medyaListele(),
  };
  return NextResponse.json(payload);
}

export async function POST(req: Request) {
  if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const body = (await req.json()) as Partial<BackupPayload>;
  if (body.version !== 1) {
    return NextResponse.json({ error: "Backup formatı desteklenmiyor" }, { status: 400 });
  }

  // Not: uploads dosyaları geri yüklenmez; sadece metadata.
  if (body.settings) await ayarlarKaydet(body.settings as Partial<SiteAyarlar>);
  if (body.menus) {
    const m = body.menus as { header?: unknown; footer?: unknown };
    await menuKaydet("header", Array.isArray(m.header) ? (m.header as MenuItem[]) : []);
    await menuKaydet("footer", Array.isArray(m.footer) ? (m.footer as MenuItem[]) : []);
  }
  if (body.content) await icerikKaydet(body.content as Partial<SiteIcerik>);

  // CMS sayfaları: pages-store upsert ile yazmak yerine direkt store'u beslemek için mevcut API'leri kullanmak gerekirdi.
  // Demo için pages-store sayfaUpsert kullanıyoruz.
  if (Array.isArray(body.pages)) {
    const { sayfaUpsert } = await import("@/lib/pages-store");
    for (const p of body.pages as Sayfa[]) {
      await sayfaUpsert({
        slug: String(p.slug ?? ""),
        baslik: String(p.baslik ?? ""),
        aciklama: typeof p.aciklama === "string" ? p.aciklama : undefined,
        icerikHtml: String(p.icerikHtml ?? ""),
        bloklar: Array.isArray(p.bloklar) ? p.bloklar : undefined,
        seoIndex: p.seoIndex,
        yayin: !!p.yayin,
      });
    }
  }

  return NextResponse.json({ ok: true });
}

