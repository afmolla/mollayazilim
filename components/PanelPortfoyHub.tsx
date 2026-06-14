"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePanelFetch, useWithBase } from "@/components/SitePrefixProvider";

const ROWS: {
  label: string;
  desc: string;
  site: string;
  panel: string;
  external?: boolean;
}[] = [
  {
    label: "Ana vitrin (kurumsal)",
    desc: "http://localhost/",
    site: "/",
    panel: "/panel",
  },
  {
    label: "Molla CRM",
    desc: "crm.mollayazilim.com — satış CRM uygulaması",
    site: "https://crm.mollayazilim.com",
    panel: "https://crm.mollayazilim.com/login",
    external: true,
  },
  {
    label: "Erkek kuaförü vitrin",
    desc: "/kuafor — berber / fade demo",
    site: "/kuafor",
    panel: "/kuafor/panel",
  },
  {
    label: "Kadın kuaförü vitrin",
    desc: "/kuafor-kadin — renk & bakım demo",
    site: "/kuafor-kadin",
    panel: "/kuafor-kadin/panel",
  },
  {
    label: "Restoran vitrin",
    desc: "/restaurant",
    site: "/restaurant",
    panel: "/restaurant/panel",
  },
  {
    label: "Emlak vitrin",
    desc: "/emlak",
    site: "/emlak",
    panel: "/emlak/panel",
  },
  {
    label: "Avukatlık vitrin (demo)",
    desc: "/avukat — hukuk bürosu şablonu",
    site: "/avukat",
    panel: "/avukat/panel",
  },
  {
    label: "Oto yıkama vitrin",
    desc: "/otoyikama — yıkama, pasta cila, seramik",
    site: "/otoyikama",
    panel: "/otoyikama/panel",
  },
  {
    label: "Ambalaj vitrin",
    desc: "/ambalaj — OPP, CPP, torba/rulo + fiyat hesaplama",
    site: "/ambalaj",
    panel: "/ambalaj/panel",
  },
];

export function PanelPortfoyHub() {
  const wb = useWithBase();
  const panelFetch = usePanelFetch();
  const [visitStats, setVisitStats] = useState<{
    onlineNow: number;
    todayUniques: number;
    todayHits: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await panelFetch(wb("/api/panel/analytics"), { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const j = (await res.json()) as {
          onlineNow?: number;
          todayUniques?: number;
          todayHits?: number;
        };
        if (cancelled) return;
        setVisitStats({
          onlineNow: j.onlineNow ?? 0,
          todayUniques: j.todayUniques ?? 0,
          todayHits: j.todayHits ?? 0,
        });
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [wb, panelFetch]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--text)]">Portföy & demolar</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Kurumsal ana site ve sektörel vitrinlerin adresleri. Demo kartlarının görünürlüğü{" "}
          <Link href={wb("/panel?vf_tab=icerik")} className="font-medium text-[var(--brand)] hover:underline">
            İçerik → Demolar
          </Link>{" "}
          sekmesinden yönetilir.
        </p>
      </div>

      {visitStats ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">Ana site ziyaretçi özeti</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Çerez onayı veren ziyaretçiler kaydedilir (KVKK uyumlu).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span>
              <span className="text-[var(--muted)]">Online </span>
              <strong className="tabular-nums text-[var(--brand)]">{visitStats.onlineNow}</strong>
            </span>
            <span>
              <span className="text-[var(--muted)]">Bugün tekil </span>
              <strong className="tabular-nums text-[var(--brand)]">{visitStats.todayUniques}</strong>
            </span>
            <span>
              <span className="text-[var(--muted)]">Görüntüleme </span>
              <strong className="tabular-nums text-[var(--brand)]">{visitStats.todayHits}</strong>
            </span>
            <Link
              href={wb("/panel?vf_tab=ziyaretciler")}
              className="rounded-lg bg-[var(--brand)] px-3 py-1.5 text-xs font-semibold text-[var(--on-brand)] hover:opacity-95"
            >
              Detaylı rapor
            </Link>
          </div>
        </div>
      ) : null}

          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--surface-2)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Site</th>
                  <th className="px-4 py-3">Bağlantılar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {ROWS.map((row) => (
                  <tr key={row.site}>
                    <td className="px-4 py-4 align-top">
                      <p className="font-medium text-[var(--text)]">{row.label}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{row.desc}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        {row.external ? (
                          <a
                            href={row.site}
                            className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-3)]"
                          >
                            Uygulama
                          </a>
                        ) : (
                          <Link
                            href={row.site}
                            className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-3)]"
                          >
                            Site
                          </Link>
                        )}
                        {row.external ? (
                          <a
                            href={row.panel}
                            className="rounded-lg bg-[var(--brand)] px-3 py-1.5 text-xs font-semibold text-[var(--on-brand)] hover:opacity-95"
                          >
                            Giriş
                          </a>
                        ) : (
                          <Link
                            href={row.panel}
                            className="rounded-lg bg-[var(--brand)] px-3 py-1.5 text-xs font-semibold text-[var(--on-brand)] hover:opacity-95"
                          >
                            Panel
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
    </div>
  );
}
