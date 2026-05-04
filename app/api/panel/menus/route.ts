import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { menuGetir, menuKaydet, type MenuItem } from "@/lib/menu-store";
import { withSiteFromRequest } from "@/lib/api-site-context";

export async function GET(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    return NextResponse.json(await menuGetir());
  });
}

export async function PUT(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    const body = (await req.json()) as { location?: "header" | "footer"; items?: unknown };
    const loc = body.location;
    if (loc !== "header" && loc !== "footer") {
      return NextResponse.json({ error: "location gerekli (header/footer)" }, { status: 400 });
    }
    const items = Array.isArray(body.items) ? (body.items as MenuItem[]) : [];
    const db = await menuKaydet(loc, items);
    return NextResponse.json({ ok: true, ...db });
  });
}
