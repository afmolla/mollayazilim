import type { IlanKayit } from "@/lib/ilan-store";

export function fmtIlanPrice(x: Pick<IlanKayit, "tip" | "fiyat">): string {
  if (x.tip === "kiralik") return `${x.fiyat.toLocaleString("tr-TR")} ₺ / ay`;
  return `${x.fiyat.toLocaleString("tr-TR")} ₺`;
}

export function fmtIlanKonum(x: Pick<IlanKayit, "mahalle" | "ilce" | "il">): string {
  const m = x.mahalle?.trim();
  const parts = [m, x.ilce, x.il].filter(Boolean);
  return parts.join(" · ");
}
