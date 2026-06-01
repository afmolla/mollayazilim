import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { panelPasswordKaydet, panelPasswordMatches } from "@/lib/panel-password-store";
import { withSiteFromRequest } from "@/lib/api-site-context";
import { describePersistError } from "@/lib/panel-persist-error";

export async function PATCH(req: Request) {
  return withSiteFromRequest(req, async () => {
    if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const body = (await req.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };
    const currentPassword = body.currentPassword?.trim() ?? "";
    const newPassword = body.newPassword?.trim() ?? "";

    if (!(await panelPasswordMatches(currentPassword))) {
      return NextResponse.json({ ok: false, error: "Mevcut şifre yanlış" }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ ok: false, error: "Yeni şifre en az 6 karakter olmalı" }, { status: 400 });
    }

    try {
      await panelPasswordKaydet(newPassword);
      return NextResponse.json({ ok: true });
    } catch (e) {
      return NextResponse.json({ ok: false, error: describePersistError(e) }, { status: 500 });
    }
  });
}
