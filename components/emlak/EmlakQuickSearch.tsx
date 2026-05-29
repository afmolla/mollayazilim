"use client";

import { useRouter } from "next/navigation";
import { useWithBase } from "@/components/SitePrefixProvider";
import { useCallback, useState } from "react";

export function EmlakQuickSearch({ defaultTip = "" }: { defaultTip?: "" | "satilik" | "kiralik" }) {
  const wb = useWithBase();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [tip, setTip] = useState<"" | "satilik" | "kiralik">(defaultTip);
  const [il, setIl] = useState("");

  const submit = useCallback(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (tip) p.set("tip", tip);
    if (il.trim()) p.set("il", il.trim());
    const qs = p.toString();
    router.push(qs ? `${wb("/ilanlar")}?${qs}` : wb("/ilanlar"));
  }, [wb, router, q, tip, il]);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--emlak-shadow)] md:p-6">
      <p className="font-display text-lg font-semibold tracking-tight text-[var(--text)]">Hızlı ilan arama</p>
      <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
        Kelime, konum ve ilan tipi — gelişmiş fiyat filtreleri için{" "}
        <strong className="font-medium text-[var(--text)]">İlanlar</strong> sayfasına geçin.
      </p>

      <div className="mt-5 grid gap-4">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Kelime</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Örn. Merkez, deniz manzaralı, 3+1…"
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] outline-none ring-[var(--brand)]/30 placeholder:text-[var(--muted)] focus:ring-2"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submit())}
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {(["", "satilik", "kiralik"] as const).map((v) => (
            <button
              key={v || "all"}
              type="button"
              onClick={() => setTip(v)}
              className={[
                "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition",
                tip === v
                  ? "bg-[var(--brand)] text-[var(--on-brand)] shadow-sm"
                  : "border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)] hover:border-[var(--brand)]/40 hover:text-[var(--text)]",
              ].join(" ")}
            >
              {v === "" ? "Tümü" : v === "satilik" ? "Satılık" : "Kiralık"}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">İl / ilçe</span>
          <input
            value={il}
            onChange={(e) => setIl(e.target.value)}
            placeholder="Tekirdağ, Kapaklı…"
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm outline-none ring-[var(--brand)]/30 focus:ring-2"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submit())}
          />
        </label>

        <button
          type="button"
          onClick={() => submit()}
          className="w-full rounded-xl bg-[var(--brand)] py-3.5 text-sm font-bold uppercase tracking-wide text-[var(--on-brand)] shadow-md transition hover:opacity-95 md:w-auto md:px-10"
        >
          İlan ara
        </button>
      </div>
    </div>
  );
}
