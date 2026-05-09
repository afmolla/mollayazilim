"use client";
import { useWithBase } from "@/components/SitePrefixProvider";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { MenuItem } from "@/lib/menu-store";

type Db = { header: MenuItem[]; footer: MenuItem[] };

function normalize(s: string) {
  return s.trim().toLocaleLowerCase("tr-TR");
}

/** İçerik sekmesinde: üst menüyü buradan görebilir ve kaydedersiniz (ayrı «Menüler» sekmesi gerekmez). */
export function PanelIcerikHeaderMenu() {
  const wb = useWithBase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [db, setDb] = useState<Db>({ header: [], footer: [] });
  const [q, setQ] = useState("");
  const [cmsPages, setCmsPages] = useState<{ slug: string; baslik: string; yayin: boolean }[]>([]);
  const [pickSlug, setPickSlug] = useState("");

  const reload = useCallback(async () => {
    setErr("");
    const res = await fetch(wb("/api/panel/menus"), { cache: "no-store", credentials: "same-origin" });
    if (res.status === 401) {
      router.refresh();
      return;
    }
    if (!res.ok) {
      setErr("Menü yüklenemedi.");
      return;
    }
    const j = (await res.json()) as Db;
    setDb(j);
  }, [router, wb]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await reload();
      setLoading(false);
    })().catch(() => {
      setErr("Menü yüklenemedi.");
      setLoading(false);
    });
  }, [reload]);

  useEffect(() => {
    (async () => {
      const res = await fetch(wb("/api/panel/pages"), { cache: "no-store", credentials: "same-origin" });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) return;
      const j = (await res.json()) as { sayfalar: { slug: string; baslik: string; yayin: boolean }[] };
      setCmsPages((j.sayfalar ?? []).filter((x) => x.slug && x.baslik));
    })().catch(() => {});
  }, [router, wb]);

  const items = db.header;

  const filteredRows = useMemo(() => {
    const qn = normalize(q);
    return items
      .map((item, origIndex) => ({ item, origIndex }))
      .filter(({ item }) => !qn || normalize(`${item.label} ${item.href}`).includes(qn));
  }, [items, q]);

  function updateAt(i: number, patch: Partial<MenuItem>) {
    setDb((s) => {
      const arr = [...s.header];
      arr[i] = { ...arr[i], ...patch };
      return { ...s, header: arr };
    });
  }

  function addRow() {
    setDb((s) => ({ ...s, header: [...s.header, { label: "", href: "", newTab: false }] }));
  }

  function addCmsPage() {
    const p = cmsPages.find((x) => x.slug === pickSlug);
    if (!p) return;
    setDb((s) => ({
      ...s,
      header: [...s.header, { label: p.baslik, href: `/p/${p.slug}` }],
    }));
    setPickSlug("");
  }

  function removeRow(i: number) {
    setDb((s) => {
      const arr = [...s.header];
      arr.splice(i, 1);
      return { ...s, header: arr };
    });
  }

  function move(i: number, dir: -1 | 1) {
    setDb((s) => {
      const arr = [...s.header];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return s;
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
      return { ...s, header: arr };
    });
  }

  async function save() {
    setSaving(true);
    setErr("");
    setOk("");
    try {
      const res = await fetch(wb("/api/panel/menus"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: "header", items: db.header }),
        credentials: "same-origin",
      });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setErr(j.error ?? "Kaydedilemedi.");
        return;
      }
      const next = (await res.json()) as Db;
      setDb(next);
      setOk("Üst menü kaydedildi.");
      window.dispatchEvent(new Event("panel-menus-updated"));
    } catch {
      setErr("Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-xs text-[var(--muted)]">
        Menü yükleniyor…
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
      <div className="mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Site üst menüsü</p>
        <p className="mt-0.5 text-[11px] leading-snug text-[var(--muted)]">
          Ziyaretçinin gördüğü üst çubuk linkleri buradan düzenlenir. Önizleme ve sitede aynı veriyi kullanır.
        </p>
      </div>

      <label className="sr-only" htmlFor="icerik-menu-q">
        Menüde ara
      </label>
      <input
        id="icerik-menu-q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ara…"
        className="mb-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1.5 text-xs outline-none ring-[var(--brand)] focus:ring-2"
      />

      {err ? <p className="mb-2 rounded-lg bg-red-500/10 px-2 py-1.5 text-[11px] text-red-700 dark:text-red-300">{err}</p> : null}
      {ok ? <p className="mb-2 rounded-lg bg-emerald-500/10 px-2 py-1.5 text-[11px] text-emerald-800 dark:text-emerald-300">{ok}</p> : null}

      <div className="mb-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => addRow()}
          className="rounded-lg border border-[var(--border)] px-2 py-1 text-[11px] font-medium hover:bg-[var(--surface-2)]"
        >
          + Link
        </button>
        <div className="flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1">
          <select
            value={pickSlug}
            onChange={(e) => setPickSlug(e.target.value)}
            className="max-w-[10rem] bg-transparent text-[11px] text-[var(--text)] outline-none"
          >
            <option value="">CMS sayfası…</option>
            {cmsPages.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.baslik}
                {!p.yayin ? " (taslak)" : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => addCmsPage()}
            disabled={!pickSlug}
            className="rounded bg-[var(--brand)] px-2 py-0.5 text-[10px] font-semibold text-[var(--on-brand)] disabled:opacity-50"
          >
            Ekle
          </button>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="rounded-lg bg-[var(--brand)] px-2 py-1 text-[11px] font-semibold text-[var(--on-brand)] disabled:opacity-60"
        >
          {saving ? "…" : "Kaydet"}
        </button>
      </div>

      <ul className="max-h-[min(40vh,16rem)] space-y-2 overflow-y-auto pr-0.5">
        {filteredRows.map(({ item: x, origIndex: idx }) => (
          <li
            key={`row-${idx}`}
            className="grid gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2 text-[11px]"
          >
            <input
              value={x.label}
              onChange={(e) => updateAt(idx, { label: e.target.value })}
              placeholder="Görünen ad"
              className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px] outline-none ring-[var(--brand)] focus:ring-1"
            />
            <input
              value={x.href}
              onChange={(e) => updateAt(idx, { href: e.target.value })}
              placeholder="/ veya /p/slug"
              className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-1 font-mono text-[11px] outline-none ring-[var(--brand)] focus:ring-1"
            />
            <div className="flex flex-wrap gap-1">
              <label className="flex items-center gap-1 text-[10px] text-[var(--text)]">
                <input
                  type="checkbox"
                  checked={!!x.newTab}
                  onChange={(e) => updateAt(idx, { newTab: e.target.checked })}
                />
                Yeni sekme
              </label>
              <button type="button" onClick={() => move(idx, -1)} className="rounded border border-[var(--border)] px-1.5 py-0.5">
                ↑
              </button>
              <button type="button" onClick={() => move(idx, 1)} className="rounded border border-[var(--border)] px-1.5 py-0.5">
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeRow(idx)}
                className="rounded border border-red-500/30 px-1.5 py-0.5 text-red-700 dark:text-red-300"
              >
                Sil
              </button>
            </div>
          </li>
        ))}
      </ul>
      {items.length === 0 ? <p className="py-3 text-center text-[11px] text-[var(--muted)]">Üst menü boş.</p> : null}
    </div>
  );
}
