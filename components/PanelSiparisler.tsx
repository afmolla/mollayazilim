"use client";

import { useWithBase } from "@/components/SitePrefixProvider";
import type { Siparis, SiparisDurum } from "@/lib/types";
import { whatsappLink } from "@/lib/whatsapp";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const DURUM_LABEL: Record<SiparisDurum, string> = {
  beklemede: "Beklemede",
  hazirlaniyor: "Hazırlanıyor",
  tamamlandi: "Tamamlandı",
  iptal: "İptal",
};

export function PanelSiparisler() {
  const wb = useWithBase();
  const router = useRouter();
  const [list, setList] = useState<Siparis[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [durum, setDurum] = useState<"hepsi" | SiparisDurum>("hepsi");
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const fetchList = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const res = await fetch(wb("/api/panel/siparisler"), {
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
          setErr("Siparişler yüklenemedi");
          return;
        }
        const j = (await res.json()) as { siparisler?: unknown };
        const rows = Array.isArray(j.siparisler) ? (j.siparisler as Siparis[]) : [];
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
        setErr("Siparişler yüklenemedi");
      } finally {
        setLoading(false);
      }
    },
    [router, wb],
  );

  useEffect(() => {
    const ac = new AbortController();
    const tid = window.setTimeout(() => ac.abort(), 28000);
    queueMicrotask(() => void fetchList(ac.signal));
    return () => {
      window.clearTimeout(tid);
      ac.abort();
    };
  }, [fetchList]);

  async function durumDegistir(id: string, next: SiparisDurum) {
    setSaving((s) => ({ ...s, [id]: true }));
    try {
      const res = await fetch(wb(`/api/panel/siparisler/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ durum: next }),
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

  async function notKaydet(id: string) {
    setSaving((s) => ({ ...s, [id]: true }));
    try {
      const res = await fetch(wb(`/api/panel/siparisler/${id}`), {
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

  function waHref(s: Siparis) {
    const lines = s.satirlar.map((x) => `${x.adet}× ${x.ad} (${x.fiyat})`).join("\n");
    const msg = `Merhaba, sipariş (#${s.id.slice(0, 8)}) hakkında yazıyorum.\n${lines}`;
    return whatsappLink(s.telefon, msg);
  }

  if (loading) return <p className="text-center text-[var(--muted)]">Yükleniyor…</p>;

  const qn = q.trim().toLocaleLowerCase("tr-TR");
  const filtered = list.filter((s) => {
    if (durum !== "hepsi" && s.durum !== durum) return false;
    if (!qn) return true;
    const hay = `${s.telefon} ${s.musteriAd ?? ""} ${s.notlar ?? ""} ${s.id}`.toLocaleLowerCase("tr-TR");
    return hay.includes(qn);
  });

  const counts = {
    hepsi: list.length,
    beklemede: list.filter((x) => x.durum === "beklemede").length,
    hazirlaniyor: list.filter((x) => x.durum === "hazirlaniyor").length,
    tamamlandi: list.filter((x) => x.durum === "tamamlandi").length,
    iptal: list.filter((x) => x.durum === "iptal").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Siparişler (mobil)</h1>
          <p className="text-sm text-[var(--muted)]">
            Panelde düzenlediğiniz QR menü bu siparişlerde kullanılır. Durumu güncelleyin; müşteriye WhatsApp ile yazın.
          </p>
        </div>
      </div>

      {err ? (
        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-700 dark:text-red-300">{err}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ara (telefon, not, id)…"
          className="min-w-[12rem] flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
        />
        <select
          value={durum}
          onChange={(e) => setDurum(e.target.value as typeof durum)}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm"
        >
          <option value="hepsi">Tümü ({counts.hepsi})</option>
          <option value="beklemede">Beklemede ({counts.beklemede})</option>
          <option value="hazirlaniyor">Hazırlanıyor ({counts.hazirlaniyor})</option>
          <option value="tamamlandi">Tamamlandı ({counts.tamamlandi})</option>
          <option value="iptal">İptal ({counts.iptal})</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--muted)]">
            Kayıt yok.
          </p>
        ) : (
          filtered.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    {new Date(s.olusturulma).toLocaleString("tr-TR")} · Mobil
                  </p>
                  <p className="mt-1 font-semibold text-[var(--text)]">
                    {s.musteriAd?.trim() || "İsimsiz"} · {s.telefon}
                  </p>
                  {s.adres?.trim() ? (
                    <p className="mt-1 text-sm text-[var(--muted)]">{s.adres.trim()}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-medium text-[var(--text)] ring-1 ring-[var(--border)]">
                    {DURUM_LABEL[s.durum]}
                  </span>
                  <a
                    href={waHref(s)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-xl bg-[#25D366] px-3 py-2 text-xs font-semibold text-white hover:opacity-95"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>

              <ul className="mt-4 space-y-2 text-sm text-[var(--text)]">
                {s.satirlar.map((ln, idx) => (
                  <li key={`${s.id}-${ln.urunId}-${idx}`} className="flex flex-wrap justify-between gap-2">
                    <span>
                      {ln.adet}× {ln.ad}
                    </span>
                    <span className="text-[var(--muted)]">{ln.fiyat}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!!saving[s.id] || s.durum === "beklemede"}
                  onClick={() => void durumDegistir(s.id, "beklemede")}
                  className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)] disabled:opacity-40"
                >
                  Beklemede
                </button>
                <button
                  type="button"
                  disabled={!!saving[s.id] || s.durum === "hazirlaniyor"}
                  onClick={() => void durumDegistir(s.id, "hazirlaniyor")}
                  className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)] disabled:opacity-40"
                >
                  Hazırlanıyor
                </button>
                <button
                  type="button"
                  disabled={!!saving[s.id] || s.durum === "tamamlandi"}
                  onClick={() => void durumDegistir(s.id, "tamamlandi")}
                  className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)] disabled:opacity-40"
                >
                  Tamamlandı
                </button>
                <button
                  type="button"
                  disabled={!!saving[s.id] || s.durum === "iptal"}
                  onClick={() => void durumDegistir(s.id, "iptal")}
                  className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-500/10 disabled:opacity-40 dark:text-red-300"
                >
                  İptal
                </button>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium text-[var(--muted)]">Not</label>
                <textarea
                  value={noteDraft[s.id] ?? ""}
                  onChange={(e) => setNoteDraft((p) => ({ ...p, [s.id]: e.target.value }))}
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                />
                <button
                  type="button"
                  disabled={!!saving[s.id]}
                  onClick={() => void notKaydet(s.id)}
                  className="mt-2 rounded-lg bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-[var(--on-brand)] disabled:opacity-60"
                >
                  Notu kaydet
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
