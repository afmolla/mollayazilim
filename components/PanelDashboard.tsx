"use client";

import { withBase } from "@/lib/base-path";
import type { Randevu, RandevuDurum } from "@/lib/types";
import { whatsappLink, whatsappRandevuMesaji } from "@/lib/whatsapp";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

function tarihEtiket(iso: string, saat: string) {
  const d = new Date(iso + "T12:00:00");
  const tarihStr = d.toLocaleDateString("tr-TR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${tarihStr} · ${saat}`;
}

function normalize(s: string) {
  return s.trim().toLocaleLowerCase("tr-TR");
}

export function PanelDashboard() {
  const router = useRouter();
  const [list, setList] = useState<Randevu[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [durum, setDurum] = useState<"hepsi" | RandevuDurum>("hepsi");
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});
  const [salonAdLive, setSalonAdLive] = useState("");

  const fetchList = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const res = await fetch(withBase("/api/panel/randevular"), {
          cache: "no-store",
          credentials: "same-origin",
          signal,
        });
        if (res.status === 401) {
          setErr("Oturum gerekli veya süresi doldu.");
          router.refresh();
          return;
        }
        if (!res.ok) {
          setErr("Liste yüklenemedi");
          return;
        }
        const j = (await res.json()) as { randevular?: unknown };
        const rows = Array.isArray(j.randevular) ? (j.randevular as Randevu[]) : [];
        setList(rows);
        setNoteDraft((prev) => {
          const next = { ...prev };
          for (const r of rows) {
            if (typeof next[r.id] === "undefined") next[r.id] = r.notlar ?? "";
          }
          return next;
        });
        setErr("");
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (e instanceof Error && e.name === "AbortError") return;
        setErr("Liste yüklenemedi");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(withBase("/api/panel/settings"), { cache: "no-store", credentials: "same-origin" });
        if (!res.ok) return;
        const j = (await res.json()) as { ayarlar?: { salonAd?: string } };
        const n = j.ayarlar?.salonAd?.trim();
        if (n) setSalonAdLive(n);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    const tid = window.setTimeout(() => ac.abort(), 28000);
    queueMicrotask(() => {
      void fetchList(ac.signal);
    });
    return () => {
      window.clearTimeout(tid);
      ac.abort();
    };
  }, [fetchList]);

  async function durumDegistir(id: string, durum: RandevuDurum) {
    setSaving((s) => ({ ...s, [id]: true }));
    try {
      const res = await fetch(withBase(`/api/panel/randevular/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ durum }),
      });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        setErr("Güncelleme başarısız");
        return;
      }
      await fetchList();
      router.refresh();
    } finally {
      setSaving((s) => ({ ...s, [id]: false }));
    }
  }

  async function cikis() {
    await fetch(withBase("/api/auth/logout"), { method: "POST" });
    router.refresh();
  }

  async function notKaydet(id: string) {
    setSaving((s) => ({ ...s, [id]: true }));
    try {
      const res = await fetch(withBase(`/api/panel/randevular/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ notlar: noteDraft[id] ?? "" }),
      });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        setErr("Not kaydedilemedi");
        return;
      }
      await fetchList();
    } finally {
      setSaving((s) => ({ ...s, [id]: false }));
    }
  }

  function waHref(r: Randevu) {
    const tarihGoster = new Date(r.tarih + "T12:00:00").toLocaleDateString(
      "tr-TR",
      { day: "numeric", month: "long", year: "numeric" }
    );
    const msg = whatsappRandevuMesaji({
      ad: r.ad,
      tarih: tarihGoster,
      saat: r.saat,
      hizmet: r.hizmet,
      salonAd: salonAdLive || "Salon",
    });
    return whatsappLink(r.telefon, msg);
  }

  if (loading) {
    return (
      <p className="text-center text-[var(--muted)]">Yükleniyor…</p>
    );
  }

  const qn = normalize(q);
  const filtered = list.filter((r) => {
    if (durum !== "hepsi" && r.durum !== durum) return false;
    if (!qn) return true;
    const hay = normalize(`${r.ad} ${r.telefon} ${r.hizmet} ${r.tarih} ${r.saat} ${r.notlar ?? ""}`);
    return hay.includes(qn);
  });

  const counts = {
    hepsi: list.length,
    beklemede: list.filter((x) => x.durum === "beklemede").length,
    onaylandi: list.filter((x) => x.durum === "onaylandi").length,
    iptal: list.filter((x) => x.durum === "iptal").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Randevular</h1>
          <p className="text-sm text-[var(--muted)]">
            Onaylayın; müşteriye tek tıkla WhatsApp mesajı gönderin.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void fetchList()}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
          >
            Yenile
          </button>
          <button
            type="button"
            onClick={() => cikis()}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
          >
            Çıkış
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "hepsi", label: `Hepsi (${counts.hepsi})` },
              { id: "beklemede", label: `Beklemede (${counts.beklemede})` },
              { id: "onaylandi", label: `Onaylı (${counts.onaylandi})` },
              { id: "iptal", label: `İptal (${counts.iptal})` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setDurum(t.id)}
              className={
                durum === t.id
                  ? "rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--on-brand)]"
                  : "rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
              }
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="w-full md:max-w-sm">
          <label className="sr-only" htmlFor="q">
            Ara
          </label>
          <input
            id="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ara: ad, telefon, hizmet…"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--text)] outline-none ring-[var(--brand)] focus:ring-2"
          />
        </div>
      </div>

      {err ? (
        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-700 dark:text-red-300">
          {err}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Müşteri</th>
              <th className="px-4 py-3 font-medium">Hizmet</th>
              <th className="px-4 py-3 font-medium">Tarih / saat</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium">Not</th>
              <th className="px-4 py-3 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filtered.map((r) => (
              <tr key={r.id} className="text-[var(--text)]">
                <td className="px-4 py-3">
                  <div className="font-medium">{r.ad}</div>
                  <div className="text-xs text-[var(--muted)]">{r.telefon}</div>
                </td>
                <td className="px-4 py-3">{r.hizmet}</td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {tarihEtiket(r.tarih, r.saat)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      r.durum === "onaylandi"
                        ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-700 dark:text-emerald-400"
                        : r.durum === "iptal"
                          ? "rounded-full bg-red-500/15 px-2 py-0.5 text-red-700 dark:text-red-400"
                          : "rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-800 dark:text-amber-300"
                    }
                  >
                    {r.durum === "onaylandi"
                      ? "Onaylı"
                      : r.durum === "iptal"
                        ? "İptal"
                        : "Beklemede"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex min-w-[240px] flex-col gap-2">
                    <textarea
                      value={noteDraft[r.id] ?? ""}
                      onChange={(e) =>
                        setNoteDraft((s) => ({ ...s, [r.id]: e.target.value }))
                      }
                      rows={2}
                      placeholder="İç not…"
                      className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text)] outline-none ring-[var(--brand)] focus:ring-2"
                    />
                    <button
                      type="button"
                      onClick={() => void notKaydet(r.id)}
                      disabled={!!saving[r.id]}
                      className="self-start rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)] disabled:opacity-60"
                    >
                      {saving[r.id] ? "Kaydediliyor…" : "Notu kaydet"}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {r.durum !== "onaylandi" ? (
                      <button
                        type="button"
                        onClick={() => void durumDegistir(r.id, "onaylandi")}
                        disabled={!!saving[r.id]}
                        className="rounded-lg bg-[var(--brand)] px-3 py-1.5 text-xs font-semibold text-[var(--on-brand)]"
                      >
                        Onayla
                      </button>
                    ) : null}
                    {r.durum !== "iptal" ? (
                      <button
                        type="button"
                        onClick={() => void durumDegistir(r.id, "iptal")}
                        disabled={!!saving[r.id]}
                        className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium"
                      >
                        İptal
                      </button>
                    ) : null}
                    <a
                      href={waHref(r)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-95"
                    >
                      WhatsApp
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 ? (
        <p className="text-center text-[var(--muted)]">Henüz randevu yok.</p>
      ) : null}
    </div>
  );
}
