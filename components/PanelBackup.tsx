"use client";
import { usePanelFetch, useSitePrefix, useWithBase } from "@/components/SitePrefixProvider";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PanelBackup() {
  const wb = useWithBase();
  const panelFetch = usePanelFetch();
  const sitePrefix = useSitePrefix();
  const router = useRouter();
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    setErr("");
    setOkMsg("");
    try {
      const res = await panelFetch(wb("/api/panel/backup"), { cache: "no-store" });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        setErr("Yedek alınamadı");
        return;
      }
      const json = await res.text();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      a.href = url;
      const slug = sitePrefix.replace(/^\//, "") || "molla";
      a.download = `${slug}-backup-${ts}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setOkMsg("Yedek indirildi.");
    } finally {
      setBusy(false);
    }
  }

  async function restore(file: File | null) {
    if (!file) return;
    if (!confirm("Geri yükleme mevcut verilerin üzerine yazar. Devam edilsin mi?")) return;
    setBusy(true);
    setErr("");
    setOkMsg("");
    try {
      const text = await file.text();
      const res = await panelFetch(wb("/api/panel/backup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: text,
      });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        setErr(j.error ?? "Geri yükleme başarısız");
        return;
      }
      setOkMsg("Geri yükleme tamamlandı.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Yedekle / Geri yükle</h1>
        <p className="text-sm text-[var(--muted)]">
          Ayarlar, menüler, içerik ve sayfalar JSON olarak yedeklenir.{" "}
          <strong>Not:</strong> Yüklenen görsel dosyaları (<code>/public/uploads</code>) ayrıca kopyalanmalıdır.
        </p>
      </div>

      {err ? (
        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-700 dark:text-red-300">{err}</p>
      ) : null}
      {okMsg ? (
        <p className="rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-800 dark:text-emerald-300">{okMsg}</p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h2 className="font-semibold text-[var(--text)]">Yedek al</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Tek dosya JSON indirir.</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void download()}
            className="mt-4 rounded-xl bg-[var(--brand)] px-6 py-3 font-semibold text-[var(--on-brand)] disabled:opacity-60"
          >
            {busy ? "Bekleyin…" : "Yedeği indir"}
          </button>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h2 className="font-semibold text-[var(--text)]">Geri yükle</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Daha önce indirilen JSON dosyasını yükle.</p>
          <label className="mt-4 inline-flex cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-6 py-3 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface)]">
            {busy ? "Bekleyin…" : "JSON seç"}
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              disabled={busy}
              onChange={(e) => void restore(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

