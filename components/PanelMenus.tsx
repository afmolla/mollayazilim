"use client";
import { useWithBase } from "@/components/SitePrefixProvider";

import type { MenuItem } from "@/lib/menu-store";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Db = { header: MenuItem[]; footer: MenuItem[] };
type Path = number[];

function normalize(s: string) {
  return s.trim().toLocaleLowerCase("tr-TR");
}

function subtreeMatch(item: MenuItem, qn: string): boolean {
  if (!qn) return true;
  if (normalize(`${item.label} ${item.href}`).includes(qn)) return true;
  return (item.children ?? []).some((c) => subtreeMatch(c, qn));
}

function updatePath(items: MenuItem[], path: Path, patch: Partial<MenuItem>): MenuItem[] {
  if (path.length === 0) return items;
  const [head, ...rest] = path;
  const copy = [...items];
  if (rest.length === 0) {
    copy[head] = { ...copy[head], ...patch };
    return copy;
  }
  const node = copy[head];
  copy[head] = { ...node, children: updatePath(node.children ?? [], rest, patch) };
  return copy;
}

function removePath(items: MenuItem[], path: Path): MenuItem[] {
  if (path.length === 0) return items;
  const [head, ...rest] = path;
  if (rest.length === 0) {
    return items.filter((_, i) => i !== head);
  }
  const copy = [...items];
  const node = copy[head];
  copy[head] = { ...node, children: removePath(node.children ?? [], rest) };
  return copy;
}

function movePath(items: MenuItem[], path: Path, dir: -1 | 1): MenuItem[] {
  if (path.length === 0) return items;
  const [head, ...rest] = path;
  if (rest.length === 0) {
    const j = head + dir;
    if (j < 0 || j >= items.length) return items;
    const copy = [...items];
    const tmp = copy[head];
    copy[head] = copy[j];
    copy[j] = tmp;
    return copy;
  }
  const copy = [...items];
  const node = copy[head];
  copy[head] = { ...node, children: movePath(node.children ?? [], rest, dir) };
  return copy;
}

function addChildPath(items: MenuItem[], parentPath: Path, child: MenuItem): MenuItem[] {
  if (parentPath.length === 0) return items;
  const [head, ...rest] = parentPath;
  if (rest.length === 0) {
    const copy = [...items];
    const p = copy[head];
    copy[head] = { ...p, children: [...(p.children ?? []), child] };
    return copy;
  }
  const copy = [...items];
  const node = copy[head];
  copy[head] = { ...node, children: addChildPath(node.children ?? [], rest, child) };
  return copy;
}

function setList(tab: "header" | "footer", db: Db, nextList: MenuItem[]): Db {
  if (tab === "header") return { ...db, header: nextList };
  return { ...db, footer: nextList };
}

export function PanelMenus() {
  const wb = useWithBase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [tab, setTab] = useState<"header" | "footer">("header");
  const [q, setQ] = useState("");

  const [db, setDb] = useState<Db>({ header: [], footer: [] });
  const [cmsPages, setCmsPages] = useState<{ slug: string; baslik: string; yayin: boolean }[]>([]);
  const [pickSlug, setPickSlug] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch(wb("/api/panel/menus"), { cache: "no-store", credentials: "same-origin" });
      if (res.status === 401) {
        setLoading(false);
        router.refresh();
        return;
      }
      if (!res.ok) {
        setErr("Menüler yüklenemedi");
        setLoading(false);
        return;
      }
      const j = (await res.json()) as Db;
      setDb(j);
      setLoading(false);
    })().catch(() => {
      setErr("Menüler yüklenemedi");
      setLoading(false);
    });
  }, [router, wb]);

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

  const items = tab === "header" ? db.header : db.footer;
  const qn = useMemo(() => normalize(q), [q]);

  function patchList(updater: (list: MenuItem[]) => MenuItem[]) {
    setDb((s) => {
      const list = tab === "header" ? s.header : s.footer;
      return setList(tab, s, updater(list));
    });
  }

  function updateAtPath(path: Path, patch: Partial<MenuItem>) {
    patchList((list) => updatePath(list, path, patch));
  }

  function removeAtPath(path: Path) {
    patchList((list) => removePath(list, path));
  }

  function moveAtPath(path: Path, dir: -1 | 1) {
    patchList((list) => movePath(list, path, dir));
  }

  function addChildTo(path: Path) {
    patchList((list) =>
      addChildPath(list, path, { label: "Alt menü öğesi", href: "/anasayfa", newTab: false })
    );
  }

  function addRow() {
    patchList((list) => [...list, { label: "Yeni link", href: "/", newTab: false }]);
  }

  function addCmsPage() {
    const p = cmsPages.find((x) => x.slug === pickSlug);
    if (!p) return;
    patchList((list) => [...list, { label: p.baslik, href: `/p/${p.slug}` }]);
    setPickSlug("");
  }

  async function save() {
    setSaving(true);
    setErr("");
    setOkMsg("");
    try {
      const payload = {
        location: tab,
        items: tab === "header" ? db.header : db.footer,
      };
      const res = await fetch(wb("/api/panel/menus"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      window.dispatchEvent(new Event("panel-menus-updated"));
    } finally {
      setSaving(false);
    }
  }

  function MenuRow({ item, path, depth }: { item: MenuItem; path: Path; depth: number }) {
    const show = !qn || subtreeMatch(item, qn);
    if (!show) return null;

    const pad = 10 + depth * 14;

    return (
      <div className="space-y-2">
        <div
          className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 md:grid-cols-[1fr_1fr_auto] md:items-center"
          style={{ marginLeft: depth ? Math.min(pad, 48) : 0 }}
        >
          <input
            value={item.label}
            onChange={(e) => updateAtPath(path, { label: e.target.value })}
            placeholder="Etiket"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
          />
          <input
            value={item.href}
            onChange={(e) => updateAtPath(path, { href: e.target.value })}
            placeholder="Alt menü grubu için # veya /yol"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
          />
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-[var(--text)]">
              <input
                type="checkbox"
                checked={!!item.newTab}
                onChange={(e) => updateAtPath(path, { newTab: e.target.checked })}
              />
              Yeni sekme
            </label>
            <button
              type="button"
              onClick={() => addChildTo(path)}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface)]"
              title="Bu öğenin altına alt menü satırı ekler"
            >
              + Alt menü
            </button>
            <button
              type="button"
              onClick={() => moveAtPath(path, -1)}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface)]"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveAtPath(path, 1)}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface)]"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => removeAtPath(path)}
              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-500/10 dark:text-red-300"
            >
              Sil
            </button>
          </div>
        </div>
        {(item.children ?? []).map((ch, ci) => (
          <MenuRow key={`${path.join("-")}-${ci}`} item={ch} path={[...path, ci]} depth={depth + 1} />
        ))}
      </div>
    );
  }

  if (loading) return <p className="text-center text-[var(--muted)]">Yükleniyor…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Menüler</h1>
          <p className="text-sm text-[var(--muted)]">
            Header ve footer; <strong className="font-medium text-[var(--text)]">+ Alt menü</strong> ile iç içe linkler.
            Sadece grup için href olarak <code className="text-xs">#</code> kullanın.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab("header")}
            className={
              tab === "header"
                ? "rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--on-brand)]"
                : "rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
            }
          >
            Header
          </button>
          <button
            type="button"
            onClick={() => setTab("footer")}
            className={
              tab === "footer"
                ? "rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--on-brand)]"
                : "rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
            }
          >
            Footer
          </button>
        </div>
      </div>

      <div className="w-full md:max-w-sm">
        <label className="sr-only" htmlFor="qmenu">
          Ara
        </label>
        <input
          id="qmenu"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ara: etiket, href (alt menü dahil)…"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--text)] outline-none ring-[var(--brand)] focus:ring-2"
        />
      </div>

      {err ? (
        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-700 dark:text-red-300">{err}</p>
      ) : null}
      {okMsg ? (
        <p className="rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-800 dark:text-emerald-300">{okMsg}</p>
      ) : null}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-[var(--text)]">{tab === "header" ? "Header menüsü" : "Footer menüsü"}</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => addRow()}
              className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
            >
              + Link ekle
            </button>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
              <select
                value={pickSlug}
                onChange={(e) => setPickSlug(e.target.value)}
                className="bg-transparent text-sm text-[var(--text)] outline-none"
              >
                <option value="">CMS sayfası seç…</option>
                {cmsPages.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.baslik} (/p/{p.slug}){p.yayin ? "" : " — taslak"}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => addCmsPage()}
                disabled={!pickSlug}
                className="rounded-lg bg-[var(--brand)] px-3 py-1.5 text-xs font-semibold text-[var(--on-brand)] disabled:opacity-60"
              >
                Ekle
              </button>
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--on-brand)] disabled:opacity-60"
            >
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {items.map((item, idx) => (
            <MenuRow key={`root-${idx}`} item={item} path={[idx]} depth={0} />
          ))}
          {items.length === 0 ? <p className="py-8 text-center text-sm text-[var(--muted)]">Menü boş.</p> : null}
        </div>
      </div>
    </div>
  );
}
