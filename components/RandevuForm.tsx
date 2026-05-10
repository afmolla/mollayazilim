"use client";
import { useWithBase } from "@/components/SitePrefixProvider";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type RandevuFormConfig = {
  selectLabel: string;
  options: string[];
  submitButtonLabel?: string;
  /** Gönderim sonrası mesaj (örn. restoran: rezervasyon ifadesi) */
  successMessage?: string;
};

export function RandevuForm(props: { config: RandevuFormConfig }) {
  const { config } = props;
  const wb = useWithBase();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [fieldError, setFieldError] = useState<{ key: string; text: string } | null>(null);

  const minDate = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setFieldError(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      ad: String(fd.get("ad") ?? ""),
      telefon: String(fd.get("telefon") ?? ""),
      hizmet: String(fd.get("hizmet") ?? ""),
      tarih: String(fd.get("tarih") ?? ""),
      saat: String(fd.get("saat") ?? ""),
      notlar: String(fd.get("notlar") ?? ""),
    };
    if (!body.ad.trim()) {
      setFieldError({ key: "ad", text: "Ad soyad zorunlu." });
      return;
    }
    if (body.telefon.replace(/\D/g, "").length < 10) {
      setFieldError({ key: "telefon", text: "Telefon en az 10 hane olmalı." });
      return;
    }
    if (!body.hizmet.trim()) {
      setFieldError({ key: "hizmet", text: `${config.selectLabel} seçin.` });
      return;
    }
    if (!body.tarih) {
      setFieldError({ key: "tarih", text: "Tarih seçin." });
      return;
    }
    if (!body.saat) {
      setFieldError({ key: "saat", text: "Saat seçin." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(wb("/api/randevu"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setMsg({ ok: false, text: j.error ?? "Gönderilemedi" });
        return;
      }
      setMsg({
        ok: true,
        text:
          config.successMessage ??
          "Talebiniz alındı. Panelden onaylandığında sitede görünebilir.",
      });
      e.currentTarget.reset();
      router.refresh();
    } catch {
      setMsg({ ok: false, text: "Bağlantı hatası. Tekrar deneyin." });
    } finally {
      setLoading(false);
    }
  }

  const submitLabel = config.submitButtonLabel ?? "Randevu talebi gönder";

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-lg space-y-5">
      <div>
        <label htmlFor="ad" className="block text-sm font-medium text-[var(--text)]">
          Ad Soyad
        </label>
        <input
          id="ad"
          name="ad"
          required
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 outline-none ring-[var(--brand)] focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="telefon" className="block text-sm font-medium text-[var(--text)]">
          Telefon (WhatsApp)
        </label>
        <input
          id="telefon"
          name="telefon"
          type="tel"
          inputMode="tel"
          placeholder="05xx veya 90..."
          required
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 outline-none ring-[var(--brand)] focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="hizmet" className="block text-sm font-medium text-[var(--text)]">
          {config.selectLabel}
        </label>
        <select
          id="hizmet"
          name="hizmet"
          required
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 outline-none ring-[var(--brand)] focus:ring-2"
          defaultValue=""
        >
          <option value="" disabled>
            Seçin
          </option>
          {config.options.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tarih" className="block text-sm font-medium text-[var(--text)]">
            Tarih
          </label>
          <input
            id="tarih"
            name="tarih"
            type="date"
            min={minDate}
            required
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 outline-none ring-[var(--brand)] focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="saat" className="block text-sm font-medium text-[var(--text)]">
            Saat
          </label>
          <input
            id="saat"
            name="saat"
            type="time"
            required
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 outline-none ring-[var(--brand)] focus:ring-2"
          />
        </div>
      </div>
      <div>
        <label htmlFor="notlar" className="block text-sm font-medium text-[var(--text)]">
          Notlar (isteğe bağlı)
        </label>
        <textarea
          id="notlar"
          name="notlar"
          rows={3}
          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 outline-none ring-[var(--brand)] focus:ring-2"
        />
      </div>
      {fieldError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {fieldError.text}
        </p>
      ) : null}
      {msg ? (
        <p
          className={`text-sm ${msg.ok ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
          role="status"
        >
          {msg.text}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[var(--brand)] py-3 font-semibold text-[var(--on-brand)] disabled:opacity-60"
      >
        {loading ? "Gönderiliyor…" : submitLabel}
      </button>
    </form>
  );
}
