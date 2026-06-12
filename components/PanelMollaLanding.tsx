"use client";

import { usePanelFetch, useWithBase } from "@/components/SitePrefixProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { MollaLanding } from "@/lib/molla-landing-store";

export function PanelMollaLanding() {
  const wb = useWithBase();
  const panelFetch = usePanelFetch();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [form, setForm] = useState<MollaLanding | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await panelFetch(wb("/api/panel/landing"), { cache: "no-store" });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        setErr("Kurumsal içerik yüklenemedi");
        setLoading(false);
        return;
      }
      const j = (await res.json()) as { landing: MollaLanding };
      setForm(j.landing);
      setLoading(false);
    })();
  }, [panelFetch, router, wb]);

  async function save() {
    if (!form) return;
    setSaving(true);
    setErr("");
    setOkMsg("");
    try {
      const res = await panelFetch(wb("/api/panel/landing"), {
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
      setOkMsg("Kaydedildi — anasayfayı yenileyin.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return <p className="text-sm text-[var(--muted)]">Kurumsal içerik yükleniyor…</p>;
  }

  const h = form.hero;
  const c = form.crmBolum;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-[var(--text)]">Kurumsal anasayfa içeriği</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          <strong className="font-medium text-[var(--text)]">mollayazilim.com</strong> ana vitrin metinleri.
          SEO ve iletişim için <strong className="font-medium text-[var(--text)]">SEO</strong> ve{" "}
          <strong className="font-medium text-[var(--text)]">Ayarlar</strong> sekmelerini kullanın.
        </p>
      </header>

      {err ? <p className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-600">{err}</p> : null}
      {okMsg ? <p className="rounded-xl bg-green-500/10 px-4 py-2 text-sm text-green-700">{okMsg}</p> : null}

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--text)]">Hero (üst bölüm)</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm md:col-span-2">
            <span className="font-medium text-[var(--text)]">Üst etiket</span>
            <input
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
              value={h.pill}
              onChange={(e) => setForm({ ...form, hero: { ...h, pill: e.target.value } })}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-[var(--text)]">Başlık (1. satır)</span>
            <input
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
              value={h.baslik}
              onChange={(e) => setForm({ ...form, hero: { ...h, baslik: e.target.value } })}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-[var(--text)]">Başlık vurgu (renkli)</span>
            <input
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
              value={h.baslikVurgu}
              onChange={(e) => setForm({ ...form, hero: { ...h, baslikVurgu: e.target.value } })}
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="font-medium text-[var(--text)]">Açıklama</span>
            <textarea
              rows={4}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
              value={h.aciklama}
              onChange={(e) => setForm({ ...form, hero: { ...h, aciklama: e.target.value } })}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-[var(--text)]">Birincil buton metni</span>
            <input
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
              value={h.ctaPrimaryLabel}
              onChange={(e) => setForm({ ...form, hero: { ...h, ctaPrimaryLabel: e.target.value } })}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-[var(--text)]">Birincil buton linki</span>
            <input
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
              value={h.ctaPrimaryHref}
              onChange={(e) => setForm({ ...form, hero: { ...h, ctaPrimaryHref: e.target.value } })}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-[var(--text)]">İkincil buton metni</span>
            <input
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
              value={h.ctaSecondaryLabel}
              onChange={(e) => setForm({ ...form, hero: { ...h, ctaSecondaryLabel: e.target.value } })}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-[var(--text)]">İkincil buton linki</span>
            <input
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
              value={h.ctaSecondaryHref}
              onChange={(e) => setForm({ ...form, hero: { ...h, ctaSecondaryHref: e.target.value } })}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--text)]">CRM bölümü</h2>
        <div className="mt-4 grid gap-4">
          <label className="block text-sm">
            <span className="font-medium text-[var(--text)]">Üst satır</span>
            <input
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
              value={c.overline}
              onChange={(e) => setForm({ ...form, crmBolum: { ...c, overline: e.target.value } })}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-[var(--text)]">Başlık</span>
            <input
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
              value={c.baslik}
              onChange={(e) => setForm({ ...form, crmBolum: { ...c, baslik: e.target.value } })}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-[var(--text)]">Açıklama</span>
            <textarea
              rows={3}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
              value={c.aciklama}
              onChange={(e) => setForm({ ...form, crmBolum: { ...c, aciklama: e.target.value } })}
            />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-[var(--on-brand)] disabled:opacity-60"
        >
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium hover:bg-[var(--surface-2)]"
        >
          Anasayfayı önizle
        </a>
      </div>
    </div>
  );
}
