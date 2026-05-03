import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";
import { ayarlarGetir, ayarlarKaydet } from "@/lib/settings-store";

export async function GET() {
  if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  return NextResponse.json({ ayarlar: await ayarlarGetir() });
}

export async function PATCH(req: Request) {
  if (!(await oturumVarMi())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const body = (await req.json()) as Record<string, unknown>;
  const next = await ayarlarKaydet(body);
  return NextResponse.json({ ok: true, ayarlar: next });
}

