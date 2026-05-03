import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/session";

/** Vitrin tarafında düzenleme çubuğu için — oturum var mı (çerez httpOnly okunamaz) */
export async function GET() {
  const ok = await oturumVarMi();
  return NextResponse.json({ ok });
}
