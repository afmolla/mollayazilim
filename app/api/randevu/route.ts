import { NextResponse } from "next/server";
import { randevuEkle } from "@/lib/randevu-store";

function temizTelefon(tel: string): string {
  return tel.replace(/\D/g, "");
}

function gecerliTelefon(tel: string): boolean {
  // TR +90 dahil olabilecek şekilde 10-15 rakam aralığı (demo)
  return tel.length >= 10 && tel.length <= 15;
}

function gecerliTarih(tarih: string): boolean {
  // YYYY-MM-DD beklenir
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tarih)) return false;
  const d = new Date(`${tarih}T00:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  // Geçmiş günleri engelle (bugün ok)
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return d.getTime() >= startOfToday.getTime();
}

function gecerliSaat(saat: string): boolean {
  // HH:MM
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(saat);
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    ad?: string;
    telefon?: string;
    hizmet?: string;
    tarih?: string;
    saat?: string;
    notlar?: string;
  };
  const ad = body.ad?.trim();
  const telefonRaw = body.telefon?.trim() ?? "";
  const telefon = temizTelefon(telefonRaw);
  const hizmet = body.hizmet?.trim();
  const tarih = body.tarih?.trim();
  const saat = body.saat?.trim();
  if (!ad || !telefonRaw || !hizmet || !tarih || !saat) {
    return NextResponse.json(
      { ok: false, error: "Tüm zorunlu alanları doldurun." },
      { status: 400 }
    );
  }
  if (!gecerliTelefon(telefon)) {
    return NextResponse.json(
      { ok: false, error: "Telefon formatı geçersiz. Ülke kodu ile girin." },
      { status: 400 }
    );
  }
  if (!gecerliTarih(tarih)) {
    return NextResponse.json(
      { ok: false, error: "Tarih geçersiz veya geçmiş bir gün seçildi." },
      { status: 400 }
    );
  }
  if (!gecerliSaat(saat)) {
    return NextResponse.json({ ok: false, error: "Saat formatı geçersiz." }, { status: 400 });
  }
  const r = await randevuEkle({
    ad,
    telefon,
    hizmet,
    tarih,
    saat,
    durum: "beklemede",
    notlar: body.notlar?.trim(),
  });
  return NextResponse.json({ ok: true, id: r.id });
}
