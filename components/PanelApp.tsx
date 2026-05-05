"use client";
import { useSitePrefix, useWithBase } from "@/components/SitePrefixProvider";

import { useEffect, useMemo, useState } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { useRouter, useSearchParams } from "next/navigation";
import { PanelDashboard } from "@/components/PanelDashboard";
import { PanelLeads } from "@/components/PanelLeads";
import { PanelSeo } from "@/components/PanelSeo";
import { PanelMedia } from "@/components/PanelMedia";
import { PanelMenus } from "@/components/PanelMenus";
import { PanelSettings } from "@/components/PanelSettings";
import { PanelUnifiedIcerik } from "@/components/PanelUnifiedIcerik";
import { PanelBackup } from "@/components/PanelBackup";
import { PanelSiteVisualEdit } from "@/components/PanelSiteVisualEdit";
import { PanelPortfoyHub } from "@/components/PanelPortfoyHub";
import { isPanelContentTab, type VfIcerikSnapshot } from "@/lib/panel-deeplink";

type TabId =
  | "portfoy"
  | "randevular"
  | "leads"
  | "seo"
  | "icerik"
  | "site_duzenle"
  | "medya"
  | "menuler"
  | "ayarlar"
  | "yedek";

function tabFromSearchParams(sp: ReadonlyURLSearchParams): TabId {
  const vfTab = sp.get("vf_tab");
  const sablon = sp.get("vf_sablon");
  const slug = sp.get("vf_slug")?.trim();
  const allowed = new Set<TabId>([
    "portfoy",
    "randevular",
    "leads",
    "seo",
    "icerik",
    "site_duzenle",
    "medya",
    "menuler",
    "ayarlar",
    "yedek",
  ]);
  if (vfTab && allowed.has(vfTab as TabId)) return vfTab as TabId;
  if (Boolean(slug) || (Boolean(sablon) && isPanelContentTab(sablon ?? ""))) return "icerik";
  return "randevular";
}

const NAV_COLLAPSE_KEY = "kuafor-panel-nav-collapsed";

type PanelAppProps = {
  panelSolMenuSabitle?: boolean;
  panelSolMenuBaslangic?: "acik" | "dar";
};

const NAV_BASE: { id: TabId; label: string; short: string }[] = [
  { id: "randevular", label: "Randevular", short: "Ra" },
  { id: "leads", label: "Lead’ler", short: "Le" },
  { id: "seo", label: "SEO", short: "Seo" },
  { id: "icerik", label: "İçerik", short: "İç" },
  { id: "site_duzenle", label: "Site düzenle", short: "Sd" },
  { id: "medya", label: "Medya", short: "Me" },
  { id: "menuler", label: "Menüler", short: "Mn" },
  { id: "ayarlar", label: "Ayarlar", short: "Ay" },
  { id: "yedek", label: "Yedek", short: "Ye" },
];

const NAV_MASTER_FIRST: { id: TabId; label: string; short: string } = {
  id: "portfoy",
  label: "Portföy",
  short: "Po",
};

function readCollapsedPref(baslangic: "acik" | "dar"): boolean {
  if (typeof window === "undefined") return baslangic === "dar";
  try {
    const v = localStorage.getItem(NAV_COLLAPSE_KEY);
    if (v === "1") return true;
    if (v === "0") return false;
    return baslangic === "dar";
  } catch {
    return baslangic === "dar";
  }
}

export function PanelApp(props: PanelAppProps) {
  const wb = useWithBase();
  const sitePrefix = useSitePrefix();
  const isMasterPanel = !sitePrefix.trim();
  const navItems = useMemo(
    () => (isMasterPanel ? [NAV_MASTER_FIRST, ...NAV_BASE] : NAV_BASE),
    [isMasterPanel]
  );
  const sabitle = props.panelSolMenuSabitle ?? true;
  const baslangic = props.panelSolMenuBaslangic ?? "acik";
  const router = useRouter();
  const searchParams = useSearchParams();

  const vfSablonRaw = searchParams.get("vf_sablon");
  const vfSlugRaw = searchParams.get("vf_slug")?.trim() ?? "";
  const vfIcerikSnapshot: VfIcerikSnapshot | null = useMemo(() => {
    const out: VfIcerikSnapshot = {};
    if (vfSablonRaw && isPanelContentTab(vfSablonRaw)) out.sablon = vfSablonRaw;
    if (vfSlugRaw) out.slug = vfSlugRaw;
    return Object.keys(out).length ? out : null;
  }, [vfSablonRaw, vfSlugRaw]);

  const [tab, setTab] = useState<TabId>(() => tabFromSearchParams(searchParams));
  const [collapsed, setCollapsed] = useState(() => readCollapsedPref(baslangic));

  useEffect(() => {
    if (!isMasterPanel && tab === "portfoy") setTab("randevular");
  }, [isMasterPanel, tab]);

  useEffect(() => {
    async function touchSession() {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      try {
        const res = await fetch(wb("/api/panel/session"), { credentials: "same-origin", cache: "no-store" });
        const j = (await res.json()) as { ok?: boolean };
        if (!j.ok) router.refresh();
      } catch {
        router.refresh();
      }
    }
    void touchSession();
    const id = setInterval(() => void touchSession(), 4 * 60 * 1000);
    const onVis = () => {
      if (document.visibilityState === "visible") void touchSession();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [wb, router]);

  useEffect(() => {
    const vfTab = searchParams.get("vf_tab");
    const sablon = searchParams.get("vf_sablon");
    const slug = searchParams.get("vf_slug")?.trim();
    const allowed = new Set(navItems.map((n) => n.id));
    const wantsContent =
      Boolean(slug) || (Boolean(sablon) && isPanelContentTab(sablon ?? ""));

    let dirty = false;
    if (vfTab && allowed.has(vfTab as TabId)) dirty = true;
    else if (wantsContent) dirty = true;

    if (sablon && isPanelContentTab(sablon)) dirty = true;
    if (slug) dirty = true;

    const q = searchParams.toString();
    queueMicrotask(() => {
      if (vfTab === "portfoy" && !isMasterPanel) {
        setTab("randevular");
      } else if (vfTab && allowed.has(vfTab as TabId)) setTab(vfTab as TabId);
      else if (wantsContent) setTab("icerik");
      if (dirty && q) router.replace(wb("/panel"), { scroll: false });
    });
  }, [searchParams, router, wb, navItems, isMasterPanel]);

  const persistCollapsed = (next: boolean) => {
    setCollapsed(next);
    try {
      localStorage.setItem(NAV_COLLAPSE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const navButtonClass = (active: boolean, narrow: boolean) =>
    [
      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
      narrow ? "justify-center px-2" : "",
      active
        ? "bg-[var(--brand)] text-[var(--on-brand)] shadow-sm"
        : "text-[var(--text)] hover:bg-[var(--surface-2)]",
    ].join(" ");

  const gridCols = useMemo(
    () =>
      collapsed
        ? "4.25rem minmax(0, 1fr)"
        : "min(13.5rem, calc(100vw - 2rem)) minmax(0, 1fr)",
    [collapsed]
  );

  const asideSticky = sabitle ? "sticky top-0 max-h-[calc(100vh-3.5rem)] self-start overflow-y-auto" : "";

  return (
    <div
      className="grid w-full min-h-0 flex-1 items-start"
      style={{ gridTemplateColumns: gridCols }}
    >
      <aside
        className={`min-w-0 border-r border-[var(--border)] bg-[var(--surface)] pl-3 pr-2 pt-5 transition-[width] duration-200 ease-out sm:pl-5 sm:pr-3 sm:pt-7 ${asideSticky}`}
        aria-label="Panel menüsü"
      >
        <div
          className={[
            "flex items-center border-b border-[var(--border)] px-1 py-2",
            collapsed ? "justify-center" : "justify-between gap-2",
          ].join(" ")}
        >
          {!collapsed ? (
            <span className="truncate pl-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Panel
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => persistCollapsed(!collapsed)}
            className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            title={collapsed ? "Menüyü genişlet" : "Menüyü daralt"}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Menüyü genişlet" : "Menüyü daralt"}
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>
        <nav className="flex flex-col gap-0.5 py-3">
          {navItems.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setTab(n.id)}
              className={navButtonClass(tab === n.id, collapsed)}
              title={collapsed ? n.label : undefined}
            >
              <span className={collapsed ? "text-[11px] font-bold leading-tight" : ""}>
                {collapsed ? n.short : n.label}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        {tab === "portfoy" ? (
          <PanelPortfoyHub />
        ) : tab === "randevular" ? (
          <PanelDashboard />
        ) : tab === "leads" ? (
          <PanelLeads />
        ) : tab === "seo" ? (
          <PanelSeo />
        ) : tab === "icerik" ? (
          <PanelUnifiedIcerik vfSnapshot={vfIcerikSnapshot} />
        ) : tab === "site_duzenle" ? (
          <PanelSiteVisualEdit />
        ) : tab === "medya" ? (
          <PanelMedia />
        ) : tab === "menuler" ? (
          <PanelMenus />
        ) : tab === "ayarlar" ? (
          <PanelSettings />
        ) : (
          <PanelBackup />
        )}
      </div>
    </div>
  );
}
