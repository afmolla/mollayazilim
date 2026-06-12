"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePanelFetch, useWithBase } from "@/components/SitePrefixProvider";

type VisitorHit = {
  ts: string;
  vid: string;
  path: string;
  ip: string;
  ua: string;
  referer?: string;
  browser: string;
  device: string;
};

type Stats = {
  day: string;
  onlineNow: number;
  todayHits: number;
  todayUniques: number;
  totalLogged: number;
};

type VisitorReport = {
  last7Days: { day: string; hits: number; uniques: number }[];
  topPages: { path: string; hits: number; uniques: number }[];
  topReferrers: { label: string; hits: number }[];
  devices: { device: string; count: number }[];
  browsers: { browser: string; count: number }[];
};

function dayLabel(ymd: string) {
  const d = new Date(`${ymd}T12:00:00`);
  return d.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric", month: "short" });
}

function maxInDays(days: VisitorReport["last7Days"], key: "hits" | "uniques") {
  return Math.max(1, ...days.map((d) => d[key]));
}

function tsLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "medium" });
}

function shortVid(vid: string) {
  return vid.length > 12 ? `${vid.slice(0, 10)}…` : vid;
}

export function PanelVisitors() {
  const wb = useWithBase();
  const panelFetch = usePanelFetch();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [report, setReport] = useState<VisitorReport | null>(null);
  const [hits, setHits] = useState<VisitorHit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 80;

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const params = new URLSearchParams({
          limit: String(limit),
          offset: String(offset),
        });
        if (q.trim()) params.set("q", q.trim());
        const res = await panelFetch(wb(`/api/panel/visitors?${params}`), {
          credentials: "same-origin",
          cache: "no-store",
          signal,
        });
        if (res.status === 401) {
          setErr("Oturum gerekli veya süresi doldu.");
          router.refresh();
          return;
        }
        if (!res.ok) {
          setErr("Ziyaretçi kayıtları yüklenemedi");
          return;
        }
        const j = (await res.json()) as {
          stats?: Stats;
          report?: VisitorReport;
          hits?: VisitorHit[];
          total?: number;
        };
        setStats(j.stats ?? null);
        setReport(j.report ?? null);
        setHits(Array.isArray(j.hits) ? j.hits : []);
        setTotal(typeof j.total === "number" ? j.total : 0);
        setErr("");
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (e instanceof Error && e.name === "AbortError") return;
        setErr("Ziyaretçi kayıtları yüklenemedi");
      } finally {
        setLoading(false);
      }
    },
    [limit, offset, q, router, wb],
  );

  useEffect(() => {
    const ac = new AbortController();
    const tid = window.setTimeout(() => ac.abort(), 30000);
    queueMicrotask(() => {
      void fetchData(ac.signal);
    });
    return () => {
      window.clearTimeout(tid);
      ac.abort();
    };
  }, [fetchData]);

  useEffect(() => {
    const t = setInterval(() => void fetchData(), 20_000);
    return () => clearInterval(t);
  }, [fetchData]);

  const page = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Ziyaretçiler</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Siteye gelen ziyaretler IP, sayfa ve tarayıcı bilgisiyle kaydedilir (çerez ile benzersiz ziyaretçi).
        </p>
      </div>

      {stats ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Şu an online", value: stats.onlineNow },
            { label: "Bugün sayfa görüntüleme", value: stats.todayHits },
            { label: "Bugün benzersiz", value: stats.todayUniques },
            { label: "Toplam kayıt", value: stats.totalLogged },
          ].map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{c.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--brand)]">{c.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {report && report.last7Days.some((d) => d.hits > 0) ? (
        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
          <div>
            <h2 className="text-base font-semibold text-[var(--text)]">Son 7 gün</h2>
            <p className="mt-0.5 text-xs text-[var(--muted)]">Günlük sayfa görüntüleme ve benzersiz ziyaretçi</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-7">
            {report.last7Days.map((d) => {
              const hitPct = Math.round((d.hits / maxInDays(report.last7Days, "hits")) * 100);
              const uniqPct = Math.round((d.uniques / maxInDays(report.last7Days, "uniques")) * 100);
              return (
                <div key={d.day} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-2 py-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">{dayLabel(d.day)}</p>
                  <div className="mt-2 flex h-16 items-end justify-center gap-1">
                    <div
                      className="w-3 rounded-t bg-[var(--brand)]/80"
                      style={{ height: `${Math.max(8, hitPct)}%` }}
                      title={`${d.hits} görüntüleme`}
                    />
                    <div
                      className="w-3 rounded-t bg-emerald-500/70"
                      style={{ height: `${Math.max(8, uniqPct)}%` }}
                      title={`${d.uniques} benzersiz`}
                    />
                  </div>
                  <p className="mt-2 text-xs tabular-nums text-[var(--text)]">
                    {d.hits} <span className="text-[var(--muted)]">/ {d.uniques}</span>
                  </p>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-[var(--muted)]">
            <span className="inline-block h-2 w-2 rounded-sm bg-[var(--brand)]/80 align-middle" /> görüntüleme ·{" "}
            <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500/70 align-middle" /> benzersiz
          </p>
        </div>
      ) : null}

      {report && (report.topPages.length > 0 || report.topReferrers.length > 0) ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {report.topPages.length > 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h2 className="text-sm font-semibold text-[var(--text)]">En çok görüntülenen sayfalar</h2>
              <ul className="mt-3 space-y-2">
                {report.topPages.map((p) => (
                  <li key={p.path} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-mono text-xs text-[var(--text)]" title={p.path}>
                      {p.path}
                    </span>
                    <span className="shrink-0 tabular-nums text-[var(--muted)]">
                      {p.hits} <span className="text-[10px]">({p.uniques} tekil)</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {report.topReferrers.length > 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h2 className="text-sm font-semibold text-[var(--text)]">Trafik kaynakları</h2>
              <ul className="mt-3 space-y-2">
                {report.topReferrers.map((r) => (
                  <li key={r.label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-[var(--text)]">{r.label}</span>
                    <span className="shrink-0 tabular-nums text-[var(--muted)]">{r.hits}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {report && (report.devices.length > 0 || report.browsers.length > 0) ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {report.devices.length > 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h2 className="text-sm font-semibold text-[var(--text)]">Cihaz dağılımı</h2>
              <ul className="mt-3 space-y-1.5 text-sm">
                {report.devices.map((d) => (
                  <li key={d.device} className="flex justify-between text-[var(--text)]">
                    <span>{d.device}</span>
                    <span className="tabular-nums text-[var(--muted)]">{d.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {report.browsers.length > 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h2 className="text-sm font-semibold text-[var(--text)]">Tarayıcı dağılımı</h2>
              <ul className="mt-3 space-y-1.5 text-sm">
                {report.browsers.map((b) => (
                  <li key={b.browser} className="flex justify-between text-[var(--text)]">
                    <span>{b.browser}</span>
                    <span className="tabular-nums text-[var(--muted)]">{b.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <div>
        <h2 className="text-base font-semibold text-[var(--text)]">Ziyaret günlüğü</h2>
        <p className="mt-0.5 text-xs text-[var(--muted)]">Son kayıtlar (IP, sayfa, tarayıcı)</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOffset(0);
          }}
          placeholder="IP, sayfa veya tarayıcı ara…"
          className="min-w-[12rem] flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]"
        />
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void fetchData();
          }}
          className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
        >
          Yenile
        </button>
      </div>

      {err ? <p className="text-sm text-red-500">{err}</p> : null}

      {loading && hits.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Yükleniyor…</p>
      ) : hits.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-10 text-center text-sm text-[var(--muted)]">
          Henüz kayıt yok. Siteyi ziyaret edince burada görünür.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-2)] text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-3 py-2.5 font-semibold">Zaman</th>
                <th className="px-3 py-2.5 font-semibold">IP</th>
                <th className="px-3 py-2.5 font-semibold">Sayfa</th>
                <th className="px-3 py-2.5 font-semibold">Cihaz</th>
                <th className="px-3 py-2.5 font-semibold">Kaynak</th>
                <th className="px-3 py-2.5 font-semibold">Ziyaretçi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {hits.map((h) => (
                <tr key={`${h.ts}-${h.vid}-${h.path}`} className="hover:bg-[var(--surface-2)]/60">
                  <td className="whitespace-nowrap px-3 py-2.5 text-[var(--muted)]">{tsLabel(h.ts)}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-[var(--text)]">{h.ip}</td>
                  <td className="max-w-[14rem] truncate px-3 py-2.5 text-[var(--text)]" title={h.path}>
                    {h.path}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[var(--text)]">
                    {h.browser}
                    <span className="text-[var(--muted)]"> · {h.device}</span>
                  </td>
                  <td className="max-w-[10rem] truncate px-3 py-2.5 text-xs text-[var(--muted)]" title={h.referer}>
                    {h.referer ? (
                      <a href={h.referer} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {(() => {
                          try {
                            return new URL(h.referer).hostname;
                          } catch {
                            return h.referer;
                          }
                        })()}
                      </a>
                    ) : (
                      "Doğrudan"
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-[var(--muted)]" title={h.vid}>
                    {shortVid(h.vid)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > limit ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--muted)]">
          <span>
            {total} kayıt · sayfa {page}/{pageCount}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={offset <= 0}
              onClick={() => setOffset((o) => Math.max(0, o - limit))}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 disabled:opacity-40"
            >
              Önceki
            </button>
            <button
              type="button"
              disabled={offset + limit >= total}
              onClick={() => setOffset((o) => o + limit)}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 disabled:opacity-40"
            >
              Sonraki
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
