"use client";

import { useWithBase } from "@/components/SitePrefixProvider";
import { useEffect, useState } from "react";
import type { IlanKayit, IlanTip } from "@/lib/ilan-store";

function fmtPrice(tip: IlanTip, n: number) {
  if (tip === "kiralik") return `${n.toLocaleString("tr-TR")} ₺/ay`;
  return `${n.toLocaleString("tr-TR")} ₺`;
}

export function PanelIlanlar() {
  const wb = useWithBase();
  const [list, setList] = useState<IlanKayit[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    baslik: "",
    ozet: "",
    il: "Tekirdağ",
    ilce: "",
    mahalle: "",
    tip: "satilik" as IlanTip,
    metrekare: "90",
    oda: "2+1",
    fiyat: "",
    kapakSrc: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80",
    yayinda: true,
  });

  async function load() {
    setErr("");
    try {
      const res = await fetch(wb("/api/panel/ilanlar"), { credentials: "same-origin", cache: "no-store" });
      if (res.status === 401) return;
      if (!res.ok) throw new Error("Liste alınamadı");
      const j = (await res.json()) as { ilanlar: IlanKayit[] };
      setList(j.ilanlar ?? []);
    } catch {
      setErr("Yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- panel verisi API'den yuklenir
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wb]);

  async function toggleYayin(x: IlanKayit) {
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(wb(`/api/panel/ilanlar/${encodeURIComponent(x.id)}`), {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yayinda: !x.yayinda }),
      });
      if (!res.ok) throw new Error("Güncellenemedi");
      await load();
    } catch {
      setErr("Kayıt güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("İlan silinsin mi?")) return;
    setSaving(true);
    try {
      const res = await fetch(wb(`/api/panel/ilanlar/${encodeURIComponent(id)}`), {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("Silinemedi");
      await load();
    } catch {
      setErr("Silinemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      const fiyat = Number(form.fiyat.replace(/\./g, "").replace(",", "."));
      const metrekare = Number(form.metrekare);
      const res = await fetch(wb("/api/panel/ilanlar"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baslik: form.baslik,
          ozet: form.ozet,
          il: form.il,
          ilce: form.ilce,
          mahalle: form.mahalle || undefined,
          tip: form.tip,
          metrekare,
          oda: form.oda,
          fiyat,
          kapakSrc: form.kapakSrc,
          yayinda: form.yayinda,
        }),
      });
      if (!res.ok) throw new Error("Eklenemedi");
      setForm((s) => ({
        ...s,
        baslik: "",
        ozet: "",
        ilce: "",
        mahalle: "",
        fiyat: "",
      }));
      await load();
    } catch {
      setErr("Eklenemedi — alanları kontrol edin.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-[var(--muted)]">Yükleniyor…</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">İlanlar</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Yayında olan ilanlar vitrinde /ilanlar sayfasında listelenir.
        </p>
      </div>

      {err ? (
        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-700 dark:text-red-300">{err}</p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--surface-2)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Başlık</th>
              <th className="px-4 py-3 font-semibold">Konum</th>
              <th className="px-4 py-3 font-semibold">Tip</th>
              <th className="px-4 py-3 font-semibold">Fiyat</th>
              <th className="px-4 py-3 font-semibold">Yayın</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {list.map((x) => (
              <tr key={x.id} className="border-b border-[var(--border)]">
                <td className="max-w-[14rem] px-4 py-3 font-medium text-[var(--text)]">
                  <span className="line-clamp-2">{x.baslik}</span>
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {x.ilce}, {x.il}
                </td>
                <td className="px-4 py-3">{x.tip === "kiralik" ? "Kiralık" : "Satılık"}</td>
                <td className="px-4 py-3 tabular-nums">{fmtPrice(x.tip, x.fiyat)}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void toggleYayin(x)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                      x.yayinda
                        ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                        : "bg-[var(--surface-2)] text-[var(--muted)]"
                    }`}
                  >
                    {x.yayinda ? "Yayında" : "Taslak"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void remove(x.id)}
                    className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={add} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--text)]">Yeni ilan</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-[var(--text)]">Başlık</span>
            <input
              required
              value={form.baslik}
              onChange={(e) => setForm((s) => ({ ...s, baslik: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-[var(--text)]">Özet</span>
            <textarea
              required
              rows={2}
              value={form.ozet}
              onChange={(e) => setForm((s) => ({ ...s, ozet: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[var(--text)]">İl</span>
            <input
              required
              value={form.il}
              onChange={(e) => setForm((s) => ({ ...s, il: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[var(--text)]">İlçe</span>
            <input
              required
              value={form.ilce}
              onChange={(e) => setForm((s) => ({ ...s, ilce: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[var(--text)]">Mahalle</span>
            <input
              value={form.mahalle}
              onChange={(e) => setForm((s) => ({ ...s, mahalle: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[var(--text)]">Tip</span>
            <select
              value={form.tip}
              onChange={(e) => setForm((s) => ({ ...s, tip: e.target.value as IlanTip }))}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm"
            >
              <option value="satilik">Satılık</option>
              <option value="kiralik">Kiralık</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[var(--text)]">m²</span>
            <input
              required
              value={form.metrekare}
              onChange={(e) => setForm((s) => ({ ...s, metrekare: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[var(--text)]">Oda</span>
            <input
              required
              placeholder="2+1"
              value={form.oda}
              onChange={(e) => setForm((s) => ({ ...s, oda: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[var(--text)]">
              Fiyat {form.tip === "kiralik" ? "(₺/ay)" : "(₺)"}
            </span>
            <input
              required
              value={form.fiyat}
              onChange={(e) => setForm((s) => ({ ...s, fiyat: e.target.value }))}
              placeholder="12500000"
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-[var(--text)]">Kapak görseli URL</span>
            <input
              required
              value={form.kapakSrc}
              onChange={(e) => setForm((s) => ({ ...s, kapakSrc: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.yayinda}
            onChange={(e) => setForm((s) => ({ ...s, yayinda: e.target.checked }))}
          />
          Yayında
        </label>
        <button
          type="submit"
          disabled={saving}
          className="mt-6 rounded-xl bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-[var(--on-brand)] disabled:opacity-60"
        >
          {saving ? "Kaydediliyor…" : "İlan ekle"}
        </button>
      </form>
    </div>
  );
}
