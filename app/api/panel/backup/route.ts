import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { ayarlarGetir, ayarlarKaydet, type SiteAyarlar } from "@/lib/settings-store";
import { menuGetir, menuKaydet, type MenuItem } from "@/lib/menu-store";
import { icerikGetir, icerikKaydet, type SiteIcerik } from "@/lib/content-store";
import { medyaListele } from "@/lib/media-store";
import { tumSayfalar, type Sayfa } from "@/lib/pages-store";
import { qrMenuGetir } from "@/lib/qr-menu-store";
import { withSiteFromRequest } from "@/lib/api-site-context";

export const runtime = "nodejs";

type BackupPayload = {
  version: 1 | 2;
  exportedAt: string;
  settings: Awaited<ReturnType<typeof ayarlarGetir>>;
  menus: Awaited<ReturnType<typeof menuGetir>>;
  content: Awaited<ReturnType<typeof icerikGetir>>;
  pages: Awaited<ReturnType<typeof tumSayfalar>>;
  media: Awaited<ReturnType<typeof medyaListele>>;
  qrMenu: Awaited<ReturnType<typeof qrMenuGetir>>;
};

export async function GET(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    const payload: BackupPayload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      settings: await ayarlarGetir(),
      menus: await menuGetir(),
      content: await icerikGetir(),
      pages: await tumSayfalar(),
      media: await medyaListele(),
      qrMenu: await qrMenuGetir(),
    };
    return NextResponse.json(payload);
  });
}

export async function POST(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    const body = (await req.json()) as Partial<BackupPayload> & { version?: number };

    if (body.version !== 1 && body.version !== 2) {
      return NextResponse.json({ error: "Backup formatı desteklenmiyor" }, { status: 400 });
    }

    if (body.settings) await ayarlarKaydet(body.settings as Partial<SiteAyarlar>);
    if (body.menus) {
      const m = body.menus as { header?: unknown; footer?: unknown };
      await menuKaydet("header", Array.isArray(m.header) ? (m.header as MenuItem[]) : []);
      await menuKaydet("footer", Array.isArray(m.footer) ? (m.footer as MenuItem[]) : []);
    }
    if (body.content) await icerikKaydet(body.content as Partial<SiteIcerik>);

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

    if (body.version === 2 && body.qrMenu) {
      const { qrMenuKaydet } = await import("@/lib/qr-menu-store");
      await qrMenuKaydet(body.qrMenu);
    }

    return NextResponse.json({ ok: true });
  });
}
