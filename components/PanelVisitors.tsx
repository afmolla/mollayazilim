"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWithBase } from "@/components/SitePrefixProvider";

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

function tsLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "medium" });
}

function shortVid(vid: string) {
  return vid.length > 12 ? `${vid.slice(0, 10)}…` : vid;
}

export function PanelVisitors() {
  const wb = useWithBase();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
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
        const res = await fetch(wb(`/api/panel/visitors?${params}`), {
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
          hits?: VisitorHit[];
          total?: number;
        };
        setStats(j.stats ?? null);
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
