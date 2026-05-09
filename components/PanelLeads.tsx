"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWithBase } from "@/components/SitePrefixProvider";
import { whatsappLink } from "@/lib/whatsapp";

type LeadStatus = "yeni" | "aranacak" | "kapandi";

type Lead = {
  id: string;
  ts: string;
  name: string;
  phone: string;
  company?: string;
  message?: string;
  sourcePath?: string;
  meta?: { status?: LeadStatus; note?: string; updatedTs?: string };
};

function normalize(s: string) {
  return s.trim().toLocaleLowerCase("tr-TR");
}

function tsLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" });
}

function leadWaMsg(l: Lead) {
  const parts = [
    `Merhaba ${l.name}, web sitesi / panel talebiniz için yazıyorum.`,
    l.company ? `İşletme: ${l.company}` : "",
    l.message ? `Notunuz: ${l.message}` : "",
  ].filter(Boolean);
  return parts.join("\n\n");
}

export function PanelLeads() {
  const wb = useWithBase();
  const router = useRouter();
  const [list, setList] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"hepsi" | LeadStatus>("hepsi");
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const fetchList = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const res = await fetch(wb("/api/panel/leads?limit=400"), {
          cache: "no-store",
          credentials: "same-origin",
          signal,
        });
        if (res.status === 401) {
          setErr("Oturum gerekli veya süresi doldu.");
          router.refresh();
          return;
        }
        if (!res.ok) {
          setErr("Lead listesi yüklenemedi");
          return;
        }
        const j = (await res.json()) as { leads?: unknown };
        const rows = Array.isArray(j.leads) ? (j.leads as Lead[]) : [];
        setList(rows);
        setNoteDraft((prev) => {
          const next = { ...prev };
          for (const r of rows) {
            const cur = r.meta?.note ?? "";
            if (typeof next[r.id] === "undefined") next[r.id] = cur;
          }
          return next;
        });
        setErr("");
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (e instanceof Error && e.name === "AbortError") return;
        setErr("Lead listesi yüklenemedi");
      } finally {
        setLoading(false);
      }
    },
    [router, wb]
  );

  useEffect(() => {
    const ac = new AbortController();
    const tid = window.setTimeout(() => ac.abort(), 28000);
    queueMicrotask(() => {
      void fetchList(ac.signal);
    });
    return () => {
      window.clearTimeout(tid);
      ac.abort();
    };
  }, [fetchList]);

  async function setLeadStatus(id: string, next: LeadStatus) {
    setSaving((s) => ({ ...s, [id]: true }));
    try {
      const res = await fetch(wb(`/api/panel/leads/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ status: next }),
      });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        setErr("Güncelleme başarısız");
        return;
      }
      await fetchList();
    } finally {
      setSaving((s) => ({ ...s, [id]: false }));
    }
  }

  async function saveNote(id: string) {
    setSaving((s) => ({ ...s, [id]: true }));
    try {
      const res = await fetch(wb(`/api/panel/leads/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ note: noteDraft[id] ?? "" }),
      });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        setErr("Not kaydedilemedi");
        return;
      }
      await fetchList();
    } finally {
      setSaving((s) => ({ ...s, [id]: false }));
    }
  }

  if (loading) {
    return <p className="text-center text-[var(--muted)]">Yükleniyor…</p>;
  }

  const qn = normalize(q);
  const filtered = list.filter((l) => {
    const st = l.meta?.status ?? "yeni";
    if (status !== "hepsi" && st !== status) return false;
    if (!qn) return true;
    const hay = normalize(
      `${l.name} ${l.phone} ${l.company ?? ""} ${l.message ?? ""} ${l.sourcePath ?? ""} ${st} ${l.meta?.note ?? ""}`
    );
    return hay.includes(qn);
  });

  const counts = {
    hepsi: list.length,
    yeni: list.filter((x) => (x.meta?.status ?? "yeni") === "yeni").length,
    aranacak: list.filter((x) => (x.meta?.status ?? "yeni") === "aranacak").length,
    kapandi: list.filter((x) => (x.meta?.status ?? "yeni") === "kapandi").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Lead’ler</h1>
          <p className="text-sm text-[var(--muted)]">Formdan gelen teklif talepleri.</p>
        </div>
        <button
          type="button"
          onClick={() => void fetchList()}
          className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
        >
          Yenile
        </button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "hepsi" as const, label: `Hepsi (${counts.hepsi})` },
              { id: "yeni" as const, label: `Yeni (${counts.yeni})` },
              { id: "aranacak" as const, label: `Aranacak (${counts.aranacak})` },
              { id: "kapandi" as const, label: `Kapandı (${counts.kapandi})` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setStatus(t.id)}
              className={
                status === t.id
                  ? "rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--on-brand)]"
                  : "rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
              }
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="w-full md:max-w-sm">
          <label className="sr-only" htmlFor="q">
            Ara
          </label>
          <input
            id="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ara: isim, telefon, mesaj…"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--text)] outline-none ring-[var(--brand)] focus:ring-2"
          />
        </div>
      </div>

      {err ? (
        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-700 dark:text-red-300">{err}</p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Kişi</th>
              <th className="px-4 py-3 font-medium">Mesaj</th>
              <th className="px-4 py-3 font-medium">Kaynak</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium">Not</th>
              <th className="px-4 py-3 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filtered.map((l) => {
              const st: LeadStatus = (l.meta?.status ?? "yeni") as LeadStatus;
              return (
                <tr key={l.id} className="text-[var(--text)]">
                  <td className="px-4 py-3">
                    <div className="font-medium">{l.name}</div>
                    <div className="text-xs text-[var(--muted)]">{l.phone}</div>
                    <div className="text-xs text-[var(--muted)]">{tsLabel(l.ts)}</div>
                    {l.company ? <div className="mt-1 text-xs text-[var(--muted)]">{l.company}</div> : null}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    <div className="max-w-[34rem] whitespace-pre-wrap">{l.message || "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{l.sourcePath || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        st === "kapandi"
                          ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-700 dark:text-emerald-400"
                          : st === "aranacak"
                            ? "rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-800 dark:text-amber-300"
                            : "rounded-full bg-sky-500/15 px-2 py-0.5 text-sky-700 dark:text-sky-300"
                      }
                    >
                      {st === "kapandi" ? "Kapandı" : st === "aranacak" ? "Aranacak" : "Yeni"}
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {st !== "yeni" ? (
                        <button
                          type="button"
                          disabled={!!saving[l.id]}
                          onClick={() => void setLeadStatus(l.id, "yeni")}
                          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)] disabled:opacity-60"
                        >
                          Yeni
                        </button>
                      ) : null}
                      {st !== "aranacak" ? (
                        <button
                          type="button"
                          disabled={!!saving[l.id]}
                          onClick={() => void setLeadStatus(l.id, "aranacak")}
                          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)] disabled:opacity-60"
                        >
                          Aranacak
                        </button>
                      ) : null}
                      {st !== "kapandi" ? (
                        <button
                          type="button"
                          disabled={!!saving[l.id]}
                          onClick={() => void setLeadStatus(l.id, "kapandi")}
                          className="rounded-lg bg-[var(--brand)] px-3 py-1.5 text-xs font-semibold text-[var(--on-brand)] disabled:opacity-60"
                        >
                          Kapandı
                        </button>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-[260px] flex-col gap-2">
                      <textarea
                        value={noteDraft[l.id] ?? ""}
                        onChange={(e) => setNoteDraft((s) => ({ ...s, [l.id]: e.target.value }))}
                        rows={2}
                        placeholder="İç not…"
                        className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text)] outline-none ring-[var(--brand)] focus:ring-2"
                      />
                      <button
                        type="button"
                        onClick={() => void saveNote(l.id)}
                        disabled={!!saving[l.id]}
                        className="self-start rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)] disabled:opacity-60"
                      >
                        {saving[l.id] ? "Kaydediliyor…" : "Notu kaydet"}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={whatsappLink(l.phone, leadWaMsg(l))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-95"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 ? <p className="text-center text-[var(--muted)]">Henüz lead yok.</p> : null}
    </div>
  );
}

