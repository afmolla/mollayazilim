import { Suspense } from "react";
import { PanelLogin } from "@/components/PanelLogin";
import { PanelApp } from "@/components/PanelApp";
import { oturumVarMi } from "@/lib/session";
import { ayarlarGetir } from "@/lib/settings-store";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yönetim Paneli",
  robots: { index: false, follow: false },
};

export default async function PanelPage() {
  const ok = await oturumVarMi();
  if (!ok) return <PanelLogin />;
  const ayar = await ayarlarGetir();
  return (
    <Suspense fallback={<p className="p-8 text-center text-[var(--muted)]">Panel yükleniyor…</p>}>
      <PanelApp
        panelSolMenuSabitle={ayar.panelSolMenuSabitle ?? true}
        panelSolMenuBaslangic={ayar.panelSolMenuBaslangic ?? "acik"}
      />
    </Suspense>
  );
}
