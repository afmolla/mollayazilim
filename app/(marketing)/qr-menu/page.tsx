import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { qrMenuGetir } from "@/lib/qr-menu-store";
import { QrMenuPageClient } from "./QrMenuPageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "QR Menü",
  description: "Dijital menü — kategoriler ve fiyatlar.",
};

export default async function QrMenuPage() {
  const menu = await qrMenuGetir();
  if (!menu.yayin) {
    notFound();
  }
  return <QrMenuPageClient menu={menu} />;
}
