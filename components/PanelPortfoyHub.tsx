"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWithBase } from "@/components/SitePrefixProvider";

type DemoFlags = {
  demoKuaforGoster: boolean;
  demoKuaforKadinGoster: boolean;
  demoRestaurantGoster: boolean;
  demoEmlakGoster: boolean;
  demoAvukatGoster: boolean;
  demoOtoyikamaGoster: boolean;
  demoCrmGoster: boolean;
};

const ROWS: {
  label: string;
  desc: string;
  site: string;
  panel: string;
  external?: boolean;
  flagKey: null | keyof DemoFlags;
}[] = [
  {
    label: "Ana vitrin (kurumsal)",
    desc: "http://localhost/",
    site: "/",
    panel: "/panel",
    flagKey: null,
  },
  {
    label: "Molla CRM",
    desc: "crm.mollayazilim.com — satış CRM uygulaması",
    site: "https://crm.mollayazilim.com",
    panel: "https://crm.mollayazilim.com/login",
    external: true,
    flagKey: "demoCrmGoster",
  },
  {
    label: "Erkek kuaförü vitrin",
    desc: "/kuafor — berber / fade demo",
    site: "/kuafor",
    panel: "/kuafor/panel",
    flagKey: "demoKuaforGoster" as const,
  },
  {
    label: "Kadın kuaförü vitrin",
    desc: "/kuafor-kadin — renk & bakım demo",
    site: "/kuafor-kadin",
    panel: "/kuafor-kadin/panel",
    flagKey: "demoKuaforKadinGoster" as const,
  },
  {
    label: "Restoran vitrin",
    desc: "/restaurant",
    site: "/restaurant",
    panel: "/restaurant/panel",
    flagKey: "demoRestaurantGoster" as const,
  },
  {
    label: "Emlak vitrin",
    desc: "/emlak",
    site: "/emlak",
    panel: "/emlak/panel",
    flagKey: "demoEmlakGoster" as const,
  },
  {
    label: "Avukatlık vitrin (demo)",
    desc: "/avukat — hukuk bürosu şablonu",
    site: "/avukat",
    panel: "/avukat/panel",
    flagKey: "demoAvukatGoster" as const,
  },
  {
    label: "Oto yıkama vitrin",
    desc: "/otoyikama — yıkama, pasta cila, seramik",
    site: "/otoyikama",
    panel: "/otoyikama/panel",
    flagKey: "demoOtoyikamaGoster" as const,
  },
];

export function PanelPortfoyHub() {
  const wb = useWithBase();
  const [flags, setFlags] = useState<DemoFlags>({
    demoKuaforGoster: true,
    demoKuaforKadinGoster: true,
    demoRestaurantGoster: true,
    demoEmlakGoster: true,
    demoAvukatGoster: true,
    demoOtoyikamaGoster: true,
    demoCrmGoster: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [visitStats, setVisitStats] = useState<{
    onlineNow: number;
    todayUniques: number;
    todayHits: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(wb("/api/panel/analytics"), { credentials: "same-origin", cache: "no-store" });
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
  }, [wb]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetch(wb("/api/panel/settings"), { credentials: "same-origin", cache: "no-store" });
      if (!res.ok || cancelled) {
        if (!cancelled) setLoading(false);
        return;
      }
      const j = (await res.json()) as { ayarlar?: Partial<DemoFlags> };
      const a = j.ayarlar ?? {};
      if (cancelled) return;
      setFlags({
        demoKuaforGoster: a.demoKuaforGoster !== false,
        demoKuaforKadinGoster: a.demoKuaforKadinGoster !== false,
        demoRestaurantGoster: a.demoRestaurantGoster !== false,
        demoEmlakGoster: a.demoEmlakGoster !== false,
        demoAvukatGoster: a.demoAvukatGoster !== false,
        demoOtoyikamaGoster: a.demoOtoyikamaGoster !== false,
        demoCrmGoster: a.demoCrmGoster !== false,
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [wb]);

  async function patchFlags(patch: Partial<DemoFlags>) {
    const next = { ...flags, ...patch };
    setSaving(true);
    setErr("");
    setOk("");
    try {
      const res = await fetch(wb("/api/panel/settings"), {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const j = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(j.error ?? "Kayıt başarısız");
      setFlags(next);
      setOk("Kaydedildi.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--text)]">Portföy & demolar</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Kurumsal ana site ve sektörel vitrinlerin adresleri. Ana sayfadaki “Demo / Projeler” kartlarını alttaki
          anahtarlarla göster veya gizle.
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

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Yükleniyor…</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--surface-2)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Site</th>
                  <th className="px-4 py-3">Bağlantılar</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Ana sayfada kart</th>
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
                    <td className="hidden align-middle px-4 py-4 sm:table-cell">
                      {row.flagKey ? (
                        <label className="flex cursor-pointer items-center gap-2 text-[var(--text)]">
                          <input
                            type="checkbox"
                            className="rounded border-[var(--border)]"
                            checked={flags[row.flagKey]}
                            disabled={saving}
                            onChange={(e) => void patchFlags({ [row.flagKey!]: e.target.checked })}
                          />
                          <span className="text-xs">Göster</span>
                        </label>
                      ) : (
                        <span className="text-xs text-[var(--muted)]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-xs font-semibold text-[var(--muted)]">Ana sayfada demo kartı</p>
            {ROWS.filter((r) => r.flagKey).map((row) => (
              <label key={row.flagKey} className="flex cursor-pointer items-center justify-between gap-3">
                <span className="text-sm text-[var(--text)]">{row.label}</span>
                <input
                  type="checkbox"
                  className="rounded border-[var(--border)]"
                  checked={flags[row.flagKey!]}
                  disabled={saving}
                  onChange={(e) => void patchFlags({ [row.flagKey!]: e.target.checked })}
                />
              </label>
            ))}
          </div>

          {err ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {err}
            </p>
          ) : null}
          {ok ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400" role="status">
              {ok}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
