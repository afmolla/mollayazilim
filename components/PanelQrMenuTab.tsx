"use client";
import { useWithBase } from "@/components/SitePrefixProvider";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { QrMenuData, QrMenuKategori, QrMenuUrun } from "@/lib/qr-menu-store";

function newId() {
  return `qm_${Math.random().toString(36).slice(2, 10)}`;
}

export function PanelQrMenuTab() {
  const wb = useWithBase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [data, setData] = useState<QrMenuData | null>(null);

  const load = useCallback(async () => {
    setErr("");
    const res = await fetch(wb("/api/panel/qr-menu"), { cache: "no-store", credentials: "same-origin" });
    if (res.status === 401) {
      router.refresh();
      return;
    }
    if (!res.ok) {
      setErr("QR menü yüklenemedi.");
      return;
    }
    const j = (await res.json()) as { menu: QrMenuData };
    setData(j.menu);
  }, [router]);

  useEffect(() => {
    setLoading(true);
    void load().finally(() => setLoading(false));
  }, [load]);

  async function saveCurrent() {
    if (!data) return;
    setSaving(true);
    setErr("");
    setOk("");
    try {
      const res = await fetch(wb("/api/panel/qr-menu"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(data),
      });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        setErr(j.error ?? "Kaydedilemedi");
        return;
      }
      const j = (await res.json()) as { menu: QrMenuData };
      setData(j.menu);
      setOk("Kaydedildi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !data) {
    return <p className="text-center text-[var(--muted)]">Yükleniyor…</p>;
  }

  function addKategori() {
    setData((d) => {
      if (!d) return d;
      const k: QrMenuKategori = {
        id: newId(),
        baslik: "Yeni kategori",
        sira: d.kategoriler.length,
        ogeler: [],
      };
      return { ...d, kategoriler: [...d.kategoriler, k], guncellenme: new Date().toISOString() };
    });
  }

  function updateKat(i: number, p: Partial<QrMenuKategori>) {
    setData((d) => {
      if (!d) return d;
      const kategoriler = [...d.kategoriler];
      kategoriler[i] = { ...kategoriler[i], ...p };
      return { ...d, kategoriler, guncellenme: new Date().toISOString() };
    });
  }

  function removeKat(i: number) {
    setData((d) => {
      if (!d) return d;
      return {
        ...d,
        kategoriler: d.kategoriler.filter((_, j) => j !== i),
        guncellenme: new Date().toISOString(),
      };
    });
  }

  function addUrun(ki: number) {
    setData((d) => {
      if (!d) return d;
      const kategoriler = [...d.kategoriler];
      const k = kategoriler[ki];
      const u: QrMenuUrun = {
        id: newId(),
        ad: "Yeni ürün",
        fiyat: "",
        sira: k.ogeler.length,
      };
      kategoriler[ki] = { ...k, ogeler: [...k.ogeler, u] };
      return { ...d, kategoriler, guncellenme: new Date().toISOString() };
    });
  }

  function updateUrun(ki: number, ui: number, p: Partial<QrMenuUrun>) {
    setData((d) => {
      if (!d) return d;
      const kategoriler = [...d.kategoriler];
      const ogeler = [...kategoriler[ki].ogeler];
      ogeler[ui] = { ...ogeler[ui], ...p };
      kategoriler[ki] = { ...kategoriler[ki], ogeler };
      return { ...d, kategoriler, guncellenme: new Date().toISOString() };
    });
  }

  function removeUrun(ki: number, ui: number) {
    setData((d) => {
      if (!d) return d;
      const kategoriler = [...d.kategoriler];
      const ogeler = kategoriler[ki].ogeler.filter((_, j) => j !== ui);
      kategoriler[ki] = { ...kategoriler[ki], ogeler };
      return { ...d, kategoriler, guncellenme: new Date().toISOString() };
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text)]">QR menü</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Kategoriler ve ürünler. <strong className="text-[var(--text)]">Yayında</strong> değilse üst menüde gizlenir; doğrudan link ile
            önizleme yapabilirsiniz.
          </p>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => void saveCurrent()}
          className="rounded-xl bg-[var(--brand)] px-6 py-3 font-semibold text-[var(--on-brand)] disabled:opacity-60"
        >
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>

      {err ? <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-700 dark:text-red-300">{err}</p> : null}
      {ok ? <p className="rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-800 dark:text-emerald-300">{ok}</p> : null}

      <div className="grid gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-[var(--text)]">Sayfa başlığı</span>
          <input
            value={data.baslik}
            onChange={(e) =>
              setData((d) => (d ? { ...d, baslik: e.target.value, guncellenme: new Date().toISOString() } : d))
            }
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-[var(--text)]">Alt başlık</span>
          <input
            value={data.altBaslik}
            onChange={(e) =>
              setData((d) => (d ? { ...d, altBaslik: e.target.value, guncellenme: new Date().toISOString() } : d))
            }
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={data.yayin}
            onChange={(e) =>
              setData((d) => (d ? { ...d, yayin: e.target.checked, guncellenme: new Date().toISOString() } : d))
            }
            className="h-4 w-4 rounded border-[var(--border)]"
          />
          <span className="font-medium text-[var(--text)]">Sitede göster (üst menü + footer linkleri)</span>
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={addKategori}
          className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface-2)]"
        >
          + Kategori ekle
        </button>
      </div>

      <div className="space-y-6">
        {data.kategoriler.map((kat, ki) => (
          <div key={kat.id} className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid flex-1 gap-2 md:grid-cols-2">
                <input
                  value={kat.baslik}
                  onChange={(e) => updateKat(ki, { baslik: e.target.value })}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm font-semibold"
                  placeholder="Kategori adı"
                />
                <input
                  value={kat.aciklama ?? ""}
                  onChange={(e) => updateKat(ki, { aciklama: e.target.value })}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm"
                  placeholder="Kısa açıklama (isteğe bağlı)"
                />
              </div>
              <button
                type="button"
                onClick={() => removeKat(ki)}
                className="rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-700 hover:bg-red-500/10 dark:text-red-300"
              >
                Kategoriyi sil
              </button>
            </div>

            <div className="space-y-2">
              {kat.ogeler.map((u, ui) => (
                <div
                  key={u.id}
                  className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 md:grid-cols-[1.2fr_1fr_0.7fr_auto]"
                >
                  <input
                    value={u.ad}
                    onChange={(e) => updateUrun(ki, ui, { ad: e.target.value })}
                    placeholder="Ürün adı"
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                  />
                  <input
                    value={u.aciklama ?? ""}
                    onChange={(e) => updateUrun(ki, ui, { aciklama: e.target.value })}
                    placeholder="Açıklama"
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                  />
                  <input
                    value={u.fiyat}
                    onChange={(e) => updateUrun(ki, ui, { fiyat: e.target.value })}
                    placeholder="Fiyat"
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeUrun(ki, ui)}
                    className="rounded-lg border border-[var(--border)] px-2 py-2 text-xs text-red-700 hover:bg-red-500/10"
                  >
                    Sil
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addUrun(ki)}
                className="rounded-lg border border-dashed border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--muted)] hover:bg-[var(--surface-2)]"
              >
                + Ürün ekle
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
