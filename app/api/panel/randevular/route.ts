import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { tumRandevular } from "@/lib/randevu-store";
import { withSiteFromRequest } from "@/lib/api-site-context";

export async function GET(req: Request) {
  return withSiteFromRequest(req, async () => {
    try {
      if (!(await oturumVarMi())) {
        return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
      }
      const list = await tumRandevular();
      return NextResponse.json({ randevular: list });
    } catch (e) {
      console.error("[panel/randevular]", e);
      return NextResponse.json({ error: "Randevular okunamadı" }, { status: 500 });
    }
  });
}
