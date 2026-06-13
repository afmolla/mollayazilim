"use client";

import { usePanelFetch, useWithBase } from "@/components/SitePrefixProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { EsnekAmbalajAracilik } from "@/lib/esnek-ambalaj-aracilik-store";
import { VARSAYILAN_TEDARIK_KG, type AmbalajMalzeme } from "@/lib/esnek-ambalaj-pricing";

const MALZEMELER: { key: AmbalajMalzeme; label: string }[] = [
  { key: "opp", label: "OPP" },
  { key: "cpp", label: "CPP" },
  { key: "pet", label: "PET" },
  { key: "ldpe", label: "LDPE" },
  { key: "bopp", label: "BOPP" },
  { key: "opp_cpp_lamine", label: "OPP+CPP lamine" },
  { key: "pet_pe_lamine", label: "PET+PE lamine" },
];

const inputCls =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm";

export function PanelEsnekAmbalajAracilik() {
  const wb = useWithBase();
  const panelFetch = usePanelFetch();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [form, setForm] = useState<EsnekAmbalajAracilik | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await panelFetch(wb("/api/panel/aracilik"), { cache: "no-store" });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        setErr("Fiyatlandırma ayarları yüklenemedi");
        setLoading(false);
        return;
      }
      const j = (await res.json()) as { aracilik: EsnekAmbalajAracilik };
      setForm(j.aracilik);
      setLoading(false);
    })();
  }, [panelFetch, router, wb]);

  async function save() {
    if (!form) return;
    setSaving(true);
    setErr("");
    setOk("");
    try {
      const res = await panelFetch(wb("/api/panel/aracilik"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
      setOk("Kaydedildi — fiyat hesaplayıcı güncellendi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return <p className="text-sm text-[var(--muted)]">Fiyatlandırma ayarları yükleniyor…</p>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[var(--text)]">Fiyatlandırma</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Malzeme kg maliyetleri, marj ve hesaplayıcı notları — müşteriye gösterilen teklif aralığı buna göre hesaplanır.
        </p>
      </header>

      {err ? <p className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-600">{err}</p> : null}
      {ok ? <p className="rounded-xl bg-green-500/10 px-4 py-2 text-sm text-green-700">{ok}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="font-semibold text-[var(--text)]">Marj & teslim</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium">Satış marjı (%)</span>
              <input
                type="number"
                className={`mt-1 ${inputCls}`}
                value={form.aracilikMarjYuzde}
                onChange={(e) => setForm({ ...form, aracilikMarjYuzde: Number(e.target.value) || 15 })}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Min. sipariş (kg)</span>
              <input
                type="number"
                className={`mt-1 ${inputCls}`}
                value={form.minSiparisKg}
                onChange={(e) => setForm({ ...form, minSiparisKg: Number(e.target.value) || 40 })}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Küçük parti ek (%)</span>
              <input
                type="number"
                className={`mt-1 ${inputCls}`}
                value={form.kucukPartiEkYuzde}
                onChange={(e) => setForm({ ...form, kucukPartiEkYuzde: Number(e.target.value) || 12 })}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Teslim min (gün)</span>
              <input
                type="number"
                className={`mt-1 ${inputCls}`}
                value={form.teslimGunMin}
                onChange={(e) => setForm({ ...form, teslimGunMin: Number(e.target.value) || 5 })}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Teslim max (gün)</span>
              <input
                type="number"
                className={`mt-1 ${inputCls}`}
                value={form.teslimGunMax}
                onChange={(e) => setForm({ ...form, teslimGunMax: Number(e.target.value) || 12 })}
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="font-semibold text-[var(--text)]">Malzeme kg maliyeti (TL/kg)</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">Birim maliyet — marj üstüne eklenerek satış fiyatı oluşur.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {MALZEMELER.map((m) => (
              <label key={m.key} className="block text-sm">
                <span className="font-medium">{m.label}</span>
                <input
                  type="number"
                  className={`mt-1 ${inputCls}`}
                  value={form.tedarikciKgFiyat[m.key] ?? VARSAYILAN_TEDARIK_KG[m.key]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tedarikciKgFiyat: {
                        ...form.tedarikciKgFiyat,
                        [m.key]: Number(e.target.value) || VARSAYILAN_TEDARIK_KG[m.key],
                      },
                    })
                  }
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="font-semibold text-[var(--text)]">Hesaplayıcı alt notları</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">Her satır müşteriye bir not olarak gösterilir. Teslim süresi otomatik eklenir.</p>
        <textarea
          rows={4}
          className={`mt-3 ${inputCls}`}
          value={(form.musteriNotlari ?? []).join("\n")}
          onChange={(e) =>
            setForm({
              ...form,
              musteriNotlari: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean),
            })
          }
        />
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={() => void save()}
        className="rounded-xl bg-[var(--brand)] px-6 py-3 font-semibold text-[var(--on-brand)] disabled:opacity-60"
      >
        {saving ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </div>
  );
}
