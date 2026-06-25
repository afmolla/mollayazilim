"use client";

import { usePanelFetch, useWithBase } from "@/components/SitePrefixProvider";
import type { UrunKayit } from "@/lib/urun-types";
import { URUN_KATEGORILER, formatTry } from "@/lib/urun-types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function PanelUrunler() {
  const wb = useWithBase();
  const panelFetch = usePanelFetch();
  const router = useRouter();
  const [list, setList] = useState<UrunKayit[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    try {
      const res = await panelFetch(wb("/api/panel/urunler"), { cache: "no-store", credentials: "same-origin" });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        setErr("Ürünler yüklenemedi");
        return;
      }
      const j = (await res.json()) as { urunler?: UrunKayit[] };
      setList(Array.isArray(j.urunler) ? j.urunler : []);
      setErr("");
    } catch {
      setErr("Ürünler yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [panelFetch, router, wb]);

  useEffect(() => {
    queueMicrotask(() => void fetchList());
  }, [fetchList]);

  async function toggleYayin(urun: UrunKayit) {
    setSaving(urun.id);
    try {
      const res = await panelFetch(wb(`/api/panel/urunler/${urun.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ yayinda: !urun.yayinda }),
      });
      if (res.ok) await fetchList();
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <p className="text-center text-[var(--muted)]">Yükleniyor…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Ürünler (e-ticaret)</h1>
        <p className="text-sm text-[var(--muted)]">
          Mağaza kataloğu — yayın durumu, fiyat varyantları ve stok. JSON dosyası: data/ambalaj/urunler.json
        </p>
      </div>

      {err ? <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-600">{err}</p> : null}

      <div className="space-y-3">
        {list.length === 0 ? (
          <p className="rounded-2xl border border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
            Henüz ürün yok. urunler.json dosyasını kontrol edin.
          </p>
        ) : (
          list.map((u) => {
            const kat = URUN_KATEGORILER.find((k) => k.id === u.kategoriId)?.baslik ?? u.kategoriId;
            const minVaryant = u.varyantlar[0];
            return (
              <div
                key={u.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase text-[var(--muted)]">{kat}</p>
                  <p className="font-semibold text-[var(--text)]">{u.baslik}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{u.ozet}</p>
                  {minVaryant ? (
                    <p className="mt-2 text-xs text-[var(--text)]">
                      {minVaryant.etiket} · {formatTry((minVaryant.indirimliFiyat ?? minVaryant.fiyat) * minVaryant.miktar)} + KDV
                    </p>
                  ) : null}
                  <p className="mt-1 text-[10px] text-[var(--muted)]">/{u.slug}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${u.yayinda && u.stokta ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-700"}`}
                  >
                    {u.yayinda && u.stokta ? "Yayında" : "Gizli / stok yok"}
                  </span>
                  <button
                    type="button"
                    disabled={saving === u.id}
                    onClick={() => void toggleYayin(u)}
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)] disabled:opacity-50"
                  >
                    {u.yayinda ? "Yayından kaldır" : "Yayınla"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <p className="text-xs text-[var(--muted)]">
        Kategori ID: doypack, quadro, flat, torba, baski. Yeni ürün eklemek için urunler.json düzenleyin veya API POST
        /api/panel/urunler kullanın.
      </p>
    </div>
  );
}
