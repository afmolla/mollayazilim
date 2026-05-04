"use client";
import { useWithBase } from "@/components/SitePrefixProvider";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PanelLogin() {
  const wb = useWithBase();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(wb("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        setError(j.error ?? "Giriş başarısız");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-[420px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Yönetim</p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--text)]">Panel girişi</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Şifre sunucu ortamında <code className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-xs">PANEL_PASSWORD</code> ile
            tanımlanır.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="pwd" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
              Şifre
            </label>
            <input
              id="pwd"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] outline-none ring-[var(--brand)] transition focus:ring-2"
              placeholder="••••••••"
              required
            />
          </div>
          {error ? (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--brand)] py-3 text-sm font-semibold text-[var(--on-brand)] shadow-sm transition hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Giriş yapılıyor…" : "Giriş yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
