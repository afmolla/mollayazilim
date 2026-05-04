import { ayarlarGetir } from "@/lib/settings-store";
import { menuGetir } from "@/lib/menu-store";
import { qrMenuGetir } from "@/lib/qr-menu-store";
import { SiteHeaderClient } from "./SiteHeaderClient";

export async function SiteHeader() {
  const ayar = await ayarlarGetir();
  const menu = await menuGetir();
  const qr = await qrMenuGetir();
  const links = menu.header.filter((n) => n.label && n.href);
  const filtered =
    qr.yayin ? links : links.filter((n) => !n.href.includes("/qr-menu") && n.href !== "/qr-menu");

  return <SiteHeaderClient brand={ayar.salonAd} items={menu.header} navLinks={filtered} />;
}
