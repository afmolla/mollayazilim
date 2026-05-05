"use client";

import { useWithBase } from "@/components/SitePrefixProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SiteAyarlar = {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoOgImage?: string;
  seoIndex?: boolean;
};

export function PanelSeo() {
  const wb = useWithBase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [form, setForm] = useState<SiteAyarlar>({
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    seoOgImage: "",
    seoIndex: true,
  });

  useEffect(() => {
    (async () => {
      const res = await fetch(wb("/api/panel/settings"), { cache: "no-store", credentials: "same-origin" });
      if (res.status === 401) {
        setLoading(false);
        router.refresh();
        return;
      }
      if (!res.ok) {
        setErr("SEO ayarları yüklenemedi");
        setLoading(false);
        return;
      }
      const j = (await res.json()) as { ayarlar: SiteAyarlar };
      setForm({
        seoTitle: j.ayarlar.seoTitle ?? "",
        seoDescription: j.ayarlar.seoDescription ?? "",
        seoKeywords: j.ayarlar.seoKeywords ?? "",
        seoOgImage: j.ayarlar.seoOgImage ?? "",
        seoIndex: j.ayarlar.seoIndex ?? true,
      });
      setErr("");
      setLoading(false);
    })().catch(() => {
      setErr("SEO ayarları yüklenemedi");
      setLoading(false);
    });
  }, [router]);

  async function save() {
    setSaving(true);
    setErr("");
    setOkMsg("");
    try {
      const res = await fetch(wb("/api/panel/settings"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
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
        <h1 className="text-2xl font-bold text-[var(--text)]">SEO</h1>
        <p className="text-sm text-[var(--muted)]">
          Google için başlık/açıklama/anahtar kelime ve OpenGraph ayarları.
        </p>
      </div>

      {err ? (
        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-700 dark:text-red-300">{err}</p>
      ) : null}
      {okMsg ? (
        <p className="rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-800 dark:text-emerald-300">
          {okMsg}
        </p>
      ) : null}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Site başlığı (title)"
            value={form.seoTitle ?? ""}
            onChange={(v) => setForm((s) => ({ ...s, seoTitle: v }))}
            hint="Boşsa salon adı kullanılır."
          />
          <Field
            label="OG görsel URL"
            value={form.seoOgImage ?? ""}
            onChange={(v) => setForm((s) => ({ ...s, seoOgImage: v }))}
            hint="Mutlak URL önerilir: https://..."
          />
          <Field
            label="Meta açıklama (description)"
            value={form.seoDescription ?? ""}
            onChange={(v) => setForm((s) => ({ ...s, seoDescription: v }))}
            multiline
            hint="150–160 karakter hedefle."
          />
          <Field
            label="Anahtar kelimeler (keywords)"
            value={form.seoKeywords ?? ""}
            onChange={(v) => setForm((s) => ({ ...s, seoKeywords: v }))}
            multiline
            hint="Virgülle ayır: kuaför, istanbul, randevu..."
          />
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <input
            type="checkbox"
            className="mt-1"
            checked={form.seoIndex ?? true}
            onChange={(e) => setForm((s) => ({ ...s, seoIndex: e.target.checked }))}
          />
          <span>
            <span className="font-medium text-[var(--text)]">Google index açık</span>
            <span className="mt-1 block text-sm text-[var(--muted)]">
              Kapalıysa sayfalara noindex uygulanır (demo / staging için).
            </span>
          </span>
        </label>
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

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text)]">{props.label}</label>
      {props.multiline ? (
        <textarea
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          rows={3}
          className="mt-1 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
        />
      ) : (
        <input
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
        />
      )}
      {props.hint ? <p className="mt-1 text-xs text-[var(--muted)]">{props.hint}</p> : null}
    </div>
  );
}

