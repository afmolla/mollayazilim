"use client";

import { withBase } from "@/lib/base-path";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SiteAyarlar = {
  salonAd: string;
  whatsapp: string;
  adresKisa: string;
  adresDetay: string;
  calismaSaatleri: string;
  sehir: string;
  menuDavranis?: "hover" | "sabit";
  panelSolMenuSabitle?: boolean;
  panelSolMenuBaslangic?: "acik" | "dar";
  instagram?: string;
  facebook?: string;
  googleMaps?: string;
};

export function PanelSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [form, setForm] = useState<SiteAyarlar>({
    salonAd: "",
    whatsapp: "",
    adresKisa: "",
    adresDetay: "",
    calismaSaatleri: "",
    sehir: "",
    instagram: "",
    facebook: "",
    googleMaps: "",
    panelSolMenuSabitle: true,
    panelSolMenuBaslangic: "acik",
  });

  useEffect(() => {
    (async () => {
      const res = await fetch(withBase("/api/panel/settings"), { cache: "no-store", credentials: "same-origin" });
      if (res.status === 401) {
        setLoading(false);
        router.refresh();
        return;
      }
      if (!res.ok) {
        setErr("Ayarlar yüklenemedi");
        setLoading(false);
        return;
      }
      const j = (await res.json()) as { ayarlar: SiteAyarlar };
      setForm({
        ...j.ayarlar,
        menuDavranis: j.ayarlar.menuDavranis ?? "hover",
        panelSolMenuSabitle: j.ayarlar.panelSolMenuSabitle ?? true,
        panelSolMenuBaslangic: j.ayarlar.panelSolMenuBaslangic ?? "acik",
        instagram: j.ayarlar.instagram ?? "",
        facebook: j.ayarlar.facebook ?? "",
        googleMaps: j.ayarlar.googleMaps ?? "",
      });
      setErr("");
      setLoading(false);
    })().catch(() => {
      setErr("Ayarlar yüklenemedi");
      setLoading(false);
    });
  }, [router]);

  async function save() {
    setSaving(true);
    setErr("");
    setOkMsg("");
    try {
      const res = await fetch(withBase("/api/panel/settings"), {
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
      setOkMsg("Kaydedildi.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-center text-[var(--muted)]">Yükleniyor…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Site ayarları</h1>
        <p className="text-sm text-[var(--muted)]">Header/footer, SEO ve iletişim bilgileri burada yönetilir.</p>
      </div>

      {err ? (
        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-700 dark:text-red-300">{err}</p>
      ) : null}
      {okMsg ? (
        <p className="rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-800 dark:text-emerald-300">
          {okMsg}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h2 className="font-semibold text-[var(--text)]">Genel</h2>
          <div className="mt-4 space-y-4">
            <Field label="Salon adı" value={form.salonAd} onChange={(v) => setForm((s) => ({ ...s, salonAd: v }))} />
            <Field label="Şehir" value={form.sehir} onChange={(v) => setForm((s) => ({ ...s, sehir: v }))} />
            <Field
              label="WhatsApp (9055...)"
              value={form.whatsapp}
              onChange={(v) => setForm((s) => ({ ...s, whatsapp: v }))}
            />
            <p className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--muted)]">
              Vitrinde menü bağlantıları üst çubukta <strong className="text-[var(--text)]">ortada</strong> görünür.
              Sol açılır menü yalnızca <strong className="text-[var(--text)]">yönetim panelinde</strong> (/panel).
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h2 className="font-semibold text-[var(--text)]">Adres ve saatler</h2>
          <div className="mt-4 space-y-4">
            <Field
              label="Adres kısa"
              value={form.adresKisa}
              onChange={(v) => setForm((s) => ({ ...s, adresKisa: v }))}
            />
            <Field
              label="Adres detay"
              value={form.adresDetay}
              onChange={(v) => setForm((s) => ({ ...s, adresDetay: v }))}
            />
            <Field
              label="Çalışma saatleri"
              value={form.calismaSaatleri}
              onChange={(v) => setForm((s) => ({ ...s, calismaSaatleri: v }))}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm lg:col-span-2">
          <h2 className="font-semibold text-[var(--text)]">Yönetim paneli (sol menü)</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            ‹ › ile anında daraltıp açarsınız (tarayıcıda hatırlanır). Aşağıdakiler tüm cihazlarda geçerli site ayarıdır.
          </p>
          <div className="mt-4 space-y-4">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.panelSolMenuSabitle ?? true}
                onChange={(e) => setForm((s) => ({ ...s, panelSolMenuSabitle: e.target.checked }))}
              />
              <span>
                <span className="font-medium text-[var(--text)]">Sol menüyü sabitle</span>
                <span className="mt-1 block text-sm text-[var(--muted)]">
                  Açıkken menü kaydırırken ekranda kalır; kapalıysa uzun sayfada menü sayfa ile birlikte kayar.
                </span>
              </span>
            </label>
            <div>
              <label className="block text-sm font-medium text-[var(--text)]">İlk açılış (dar / geniş)</label>
              <select
                value={form.panelSolMenuBaslangic ?? "acik"}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    panelSolMenuBaslangic: e.target.value as "acik" | "dar",
                  }))
                }
                className="mt-1 w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
              >
                <option value="acik">Geniş (etiketler görünsün)</option>
                <option value="dar">Dar (kısaltmalar — yerel tercih yoksa)</option>
              </select>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Bu bilgisayarda daha önce ‹ › ile seçim yaptıysanız tarayıcı onu önceliklendirir; tercihi sıfırlamak için site verilerini temizleyin.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm lg:col-span-2">
          <h2 className="font-semibold text-[var(--text)]">Sosyal / Harita</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Bu alanlar sitede sayfanın <strong className="font-medium text-[var(--text)]">en altında</strong>, telif satırının hemen
            üzerinde gösterilir (Instagram / Facebook düğmeleri ve harita).
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field
              label="Instagram URL"
              value={form.instagram ?? ""}
              onChange={(v) => setForm((s) => ({ ...s, instagram: v }))}
            />
            <Field
              label="Facebook URL"
              value={form.facebook ?? ""}
              onChange={(v) => setForm((s) => ({ ...s, facebook: v }))}
            />
            <Field
              label="Google Maps URL"
              value={form.googleMaps ?? ""}
              onChange={(v) => setForm((s) => ({ ...s, googleMaps: v }))}
            />
          </div>
        </div>
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

function Field(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text)]">{props.label}</label>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
      />
    </div>
  );
}

