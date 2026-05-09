import type { QrMenuData, QrMenuUrun } from "@/lib/qr-menu-store";

export function urunIdToUrun(menu: QrMenuData): Map<string, QrMenuUrun> {
  const m = new Map<string, QrMenuUrun>();
  for (const k of menu.kategoriler) {
    for (const u of k.ogeler) m.set(u.id, u);
  }
  return m;
}
