"use client";

import { withBase } from "@/lib/base-path";
import { bloklardanHtml, sayfaSlugify, type SayfaBlok } from "@/lib/cms-blok";
import type { Sayfa } from "@/lib/pages-store";
import { useRouter } from "next/navigation";
import {
  Fragment,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { PanelMedia } from "@/components/PanelMedia";
import { PanelPreviewSiteChrome } from "@/components/PanelPreviewChrome";

function normalize(s: string) {
  return s.trim().toLocaleLowerCase("tr-TR");
}

const BLOK_ETIKET: Record<string, string> = {
  heading: "Başlık (H2 / H3)",
  paragraph: "Metin paragrafı",
  list: "Madde listesi",
  button: "Buton (CTA)",
  image: "Görsel",
  quote: "Alıntı",
  video: "Video",
  divider: "Ayırıcı çizgi",
  html: "Özel HTML",
};

function hrefEslestir(a: string, b: string): boolean {
  const na = (a.trim().replace(/\/+$/, "") || "/").toLowerCase();
  const nb = (b.trim().replace(/\/+$/, "") || "/").toLowerCase();
  return na === nb;
}

/** WordPress benzeri: iki blok arasına veya sonuna yeni blok şablonu */
function yeniBlokSablon(tip: string): SayfaBlok {
  switch (tip) {
    case "heading":
      return { type: "heading", text: "Başlık", level: 2 };
    case "paragraph":
      return { type: "paragraph", text: "Paragraf metni…" };
    case "list":
      return { type: "list", items: ["Madde 1", "Madde 2"] };
    case "quote":
      return { type: "quote", text: "Alıntı metni…", kaynak: "" };
    case "button":
      return { type: "button", label: "Buton", href: "/randevu" };
    case "divider":
      return { type: "divider" };
    case "video":
      return { type: "video", url: "" };
    case "html":
      return { type: "html", html: "<p>Özel HTML…</p>" };
    default:
      return { type: "paragraph", text: "Metin…" };
  }
}

/** Bloklar arası / sonuna ekleme çizgisi + küçük palet */
function BlokEkleCizgisi(props: {
  zoneIndex: number;
  /** Önizlemeden kaydırmak için */
  rootId?: string;
  paletAcik: boolean;
  onPaletToggle: () => void;
  onInsert: (b: SayfaBlok) => void;
  onMedyaZone: (zone: number) => void;
  hedefVurgula: boolean;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
}) {
  const miniBtn =
    "rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px] font-medium hover:bg-[var(--surface-2)]";
  return (
    <div
      id={props.rootId}
      className={[
        "group relative flex min-h-[1.75rem] items-center gap-2 rounded-lg py-0.5 transition-colors",
        props.hedefVurgula ? "bg-[var(--brand)]/15 ring-2 ring-[var(--brand)]/40" : "",
      ].join(" ")}
      onDragOver={props.onDragOver}
      onDrop={props.onDrop}
    >
      <div className="h-px min-w-[1rem] flex-1 bg-[var(--border)] opacity-70 group-hover:opacity-100" />
      <button
        type="button"
        onClick={props.onPaletToggle}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-lg font-light leading-none text-[var(--brand)] shadow-sm hover:bg-[var(--surface-2)]"
        title="Bu çizgiye blok ekle"
        aria-expanded={props.paletAcik}
      >
        +
      </button>
      <div className="h-px min-w-[1rem] flex-1 bg-[var(--border)] opacity-70 group-hover:opacity-100" />
      {props.paletAcik ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 flex max-h-[min(70vh,320px)] flex-col gap-2 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xl">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Buraya ekle</p>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className={miniBtn} onClick={() => props.onInsert(yeniBlokSablon("heading"))}>
              Başlık
            </button>
            <button type="button" className={miniBtn} onClick={() => props.onInsert(yeniBlokSablon("paragraph"))}>
              Paragraf
            </button>
            <button type="button" className={miniBtn} onClick={() => props.onInsert(yeniBlokSablon("list"))}>
              Liste
            </button>
            <button type="button" className={miniBtn} onClick={() => props.onInsert(yeniBlokSablon("quote"))}>
              Alıntı
            </button>
            <button type="button" className={miniBtn} onClick={() => props.onInsert(yeniBlokSablon("button"))}>
              Buton
            </button>
            <button type="button" className={miniBtn} onClick={() => props.onInsert(yeniBlokSablon("divider"))}>
              Ayırıcı
            </button>
            <button type="button" className={miniBtn} onClick={() => props.onInsert(yeniBlokSablon("video"))}>
              Video
            </button>
            <button type="button" className={miniBtn} onClick={() => props.onInsert(yeniBlokSablon("html"))}>
              HTML
            </button>
            <button
              type="button"
              className={`${miniBtn} border-[var(--brand)]/50 text-[var(--brand)]`}
              onClick={() => props.onMedyaZone(props.zoneIndex)}
            >
              Görsel (medya)
            </button>
          </div>
          <p className="text-[10px] text-[var(--muted)]">
            WordPress’teki gibi önce konumu seçin; bloklar ⠿ ile sürüklenip bu çizgilerin üzerine bırakılabilir.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export type PanelPagesProps = {
  /** Site özeti tablosundan «Düzenle» ile açılış */
  focusSlug?: string | null;
  onFocusSlugHandled?: () => void;
  /** `editorOnly`: liste solda değil; birleşik içerik panelinde kullanılır */
  layout?: "full" | "editorOnly";
  /** Kayıt başarılı olunca (liste yenileme için) */
  onSaved?: () => void;
};

export function PanelPages(props: PanelPagesProps = {}) {
  const editorOnly = props.layout === "editorOnly";
  const router = useRouter();
  const [list, setList] = useState<Sayfa[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [pickMedia, setPickMedia] = useState(false);
  /** Medya seçildiğinde görsel bloğun ekleneceği indeks; null = listenin sonuna */
  const [mediaInsertAt, setMediaInsertAt] = useState<number | null>(null);
  /** Hangi ara çizgide blok paleti açık */
  const [openInsertGap, setOpenInsertGap] = useState<number | null>(null);
  /** Sürükle-bırak hedef bölge vurgusu */
  const [dragHedefBolge, setDragHedefBolge] = useState<number | null>(null);
  const dragKaynakRef = useRef<number | null>(null);
  /** Önizlemede tıklanan blok — formda vurgulanır */
  const [onizlemeSeciliBlok, setOnizlemeSeciliBlok] = useState<number | null>(null);
  const [editorMode, setEditorMode] = useState<"blocks" | "html">("blocks");
  const htmlRef = useRef<HTMLTextAreaElement | null>(null);
  /** false: kullanıcı slug’ı elle değiştirdi veya düzenleme modu; başlık slug’ı ezmez */
  const slugFollowsTitleRef = useRef(true);

  const [form, setForm] = useState<{
    slug: string;
    baslik: string;
    aciklama: string;
    icerikHtml: string;
    bloklar: SayfaBlok[];
    seoIndex: boolean;
    yayin: boolean;
  }>({ slug: "", baslik: "", aciklama: "", icerikHtml: "", bloklar: [], seoIndex: true, yayin: true });

  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState("");
  /** Listeden «düzenle» ile açılan sayfanın slug’ı; null = yeni taslak */
  const [editSourceSlug, setEditSourceSlug] = useState<string | null>(null);
  const onFocusDoneRef = useRef(props.onFocusSlugHandled);

  useEffect(() => {
    onFocusDoneRef.current = props.onFocusSlugHandled;
  });

  function insertSnippet(snippet: string) {
    const el = htmlRef.current;
    if (!el) {
      setForm((s) => ({ ...s, icerikHtml: (s.icerikHtml + "\n" + snippet).trim() + "\n" }));
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const before = el.value.slice(0, start);
    const after = el.value.slice(end);
    const next = before + snippet + after;
    setForm((s) => ({ ...s, icerikHtml: next }));
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + snippet.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function insertImage(url: string) {
    insertSnippet(
      `<figure class="mt-6">\n  <img src="${url}" alt="Görsel" class="w-full rounded-2xl border border-[var(--border)]" />\n</figure>\n`
    );
  }

  function wrapSelection(tag: "strong" | "em" | "u") {
    const el = htmlRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = el.value.slice(start, end) || (tag === "strong" ? "kalın" : tag === "em" ? "italik" : "altı çizili");
    const snippet = `<${tag}>${selected}</${tag}>`;
    const before = el.value.slice(0, start);
    const after = el.value.slice(end);
    const next = before + snippet + after;
    setForm((s) => ({ ...s, icerikHtml: next }));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + snippet.length, start + snippet.length);
    });
  }

  const fetchList = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch(withBase("/api/panel/pages"), {
        cache: "no-store",
        credentials: "same-origin",
        signal,
      });
      if (res.status === 401) {
        startTransition(() => setLoading(false));
        router.refresh();
        return;
      }
      if (!res.ok) {
        startTransition(() => {
          setErr("Sayfalar yüklenemedi");
        });
        return;
      }
      const j = (await res.json()) as { sayfalar: Sayfa[] };
      startTransition(() => {
        setList(j.sayfalar);
        setErr("");
      });
    } catch {
      startTransition(() => setErr("Sayfalar yüklenemedi"));
    } finally {
      startTransition(() => setLoading(false));
    }
  }, [router]);

  useEffect(() => {
    const ac = new AbortController();
    void fetchList(ac.signal);
    return () => ac.abort();
  }, [fetchList]);

  const filtered = useMemo(() => {
    const qn = normalize(q);
    if (!qn) return list;
    return list.filter((s) => normalize(`${s.baslik} ${s.slug} ${s.aciklama ?? ""}`).includes(qn));
  }, [list, q]);

  async function saveNew() {
    const slugNorm = sayfaSlugify(form.slug);
    if (!slugNorm) {
      setErr("Slug gerekli.");
      return;
    }
    if (list.some((x) => x.slug === slugNorm)) {
      setErr("Bu slug zaten kullanılıyor. Düzenlemek için listeden seçin veya başka slug girin.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        slug: form.slug,
        baslik: form.baslik,
        aciklama: form.aciklama,
        yayin: form.yayin,
        seoIndex: form.seoIndex,
        ...(editorMode === "blocks"
          ? { bloklar: form.bloklar }
          : { icerikHtml: form.icerikHtml }),
      };
      const res = await fetch(withBase("/api/panel/pages"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = (await res.json()) as { ok?: boolean; error?: string };
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok || !j.ok) {
        setErr(j.error ?? "Kaydedilemedi");
        return;
      }
      props.onSaved?.();
      slugFollowsTitleRef.current = true;
      setEditSourceSlug(null);
      setForm({ slug: "", baslik: "", aciklama: "", icerikHtml: "", bloklar: [], seoIndex: true, yayin: true });
      await fetchList();
    } finally {
      setSaving(false);
    }
  }

  const loadToEdit = useCallback(
    async (slug: string) => {
      const res = await fetch(withBase(`/api/panel/pages/${encodeURIComponent(slug)}`), { cache: "no-store" });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        setErr("Sayfa yüklenemedi");
        return;
      }
      const j = (await res.json()) as { sayfa: Sayfa };
      slugFollowsTitleRef.current = false;
      setEditSourceSlug(j.sayfa.slug);
      setForm({
        slug: j.sayfa.slug,
        baslik: j.sayfa.baslik,
        aciklama: j.sayfa.aciklama ?? "",
        icerikHtml: j.sayfa.icerikHtml,
        bloklar: j.sayfa.bloklar ?? [],
        seoIndex: j.sayfa.seoIndex !== false,
        yayin: j.sayfa.yayin,
      });
      setEditorMode((j.sayfa.bloklar && j.sayfa.bloklar.length > 0) ? "blocks" : "html");
    },
    [router]
  );

  useEffect(() => {
    const slug = props.focusSlug;
    if (!slug) return;
    void (async () => {
      await loadToEdit(slug);
      onFocusDoneRef.current?.();
    })();
  }, [props.focusSlug, loadToEdit]);

  const [siteChrome, setSiteChrome] = useState<{
    brand: string;
    header: { label: string; href: string; newTab?: boolean }[];
  } | null>(null);

  const loadSiteChrome = useCallback(async () => {
    try {
      const [mRes, sRes] = await Promise.all([
        fetch(withBase("/api/panel/menus"), { cache: "no-store", credentials: "same-origin" }),
        fetch(withBase("/api/panel/settings"), { cache: "no-store", credentials: "same-origin" }),
      ]);
      if (mRes.status === 401 || sRes.status === 401) {
        router.refresh();
        return;
      }
      if (!mRes.ok || !sRes.ok) return;
      const m = (await mRes.json()) as { header: { label: string; href: string; newTab?: boolean }[] };
      const s = (await sRes.json()) as { ayarlar: { salonAd?: string } };
      setSiteChrome({
        header: Array.isArray(m.header) ? m.header : [],
        brand: (s.ayarlar?.salonAd ?? "").trim() || "Site",
      });
    } catch {
      /* önizleme çubuğu isteğe bağlı */
    }
  }, [router]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadSiteChrome();
    });
  }, [loadSiteChrome]);

  useEffect(() => {
    const ev = "panel-menus-updated";
    const on = () => void loadSiteChrome();
    window.addEventListener(ev, on);
    return () => window.removeEventListener(ev, on);
  }, [loadSiteChrome]);

  async function saveEdit() {
    setSaving(true);
    try {
      const payload = {
        baslik: form.baslik,
        aciklama: form.aciklama,
        yayin: form.yayin,
        seoIndex: form.seoIndex,
        ...(editorMode === "blocks"
          ? { bloklar: form.bloklar }
          : { icerikHtml: form.icerikHtml }),
      };
      const res = await fetch(withBase(`/api/panel/pages/${encodeURIComponent(form.slug)}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = (await res.json()) as { ok?: boolean; error?: string };
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok || !j.ok) {
        setErr(j.error ?? "Kaydedilemedi");
        return;
      }
      props.onSaved?.();
      await fetchList();
    } finally {
      setSaving(false);
    }
  }

  async function del(slug: string) {
    if (!confirm(`Silinsin mi?\n/${slug}`)) return;
    const res = await fetch(withBase(`/api/panel/pages/${encodeURIComponent(slug)}`), { method: "DELETE" });
    if (res.status === 401) {
      router.refresh();
      return;
    }
    if (!res.ok) {
      setErr("Silinemedi");
      return;
    }
    if (form.slug === slug) {
      slugFollowsTitleRef.current = true;
      setEditSourceSlug(null);
      setForm({ slug: "", baslik: "", aciklama: "", icerikHtml: "", bloklar: [], seoIndex: true, yayin: true });
    }
    await fetchList();
  }

  if (loading) return <p className="text-center text-[var(--muted)]">Yükleniyor…</p>;

  const previewHref = form.slug ? `/p/${encodeURIComponent(form.slug)}` : "";
  const previewHtml =
    editorMode === "blocks" ? bloklardanHtml(form.bloklar) : form.icerikHtml;
  const slugNormPreview = sayfaSlugify(form.slug);
  const slugTakenAsNew =
    editSourceSlug === null && !!slugNormPreview && list.some((x) => x.slug === slugNormPreview);

  function addBlock(b: SayfaBlok) {
    setForm((s) => ({ ...s, bloklar: [...s.bloklar, b] }));
  }

  function updateBlock(i: number, patch: Record<string, unknown>) {
    setForm((s) => {
      const next = [...s.bloklar];
      const cur = next[i];
      if (!cur) return s;
      next[i] = { ...(cur as Record<string, unknown>), ...patch } as SayfaBlok;
      return { ...s, bloklar: next };
    });
  }

  function removeBlock(i: number) {
    setForm((s) => {
      const next = [...s.bloklar];
      next.splice(i, 1);
      return { ...s, bloklar: next };
    });
  }

  function moveBlock(i: number, dir: -1 | 1) {
    setForm((s) => {
      const next = [...s.bloklar];
      const j = i + dir;
      if (j < 0 || j >= next.length) return s;
      const tmp = next[i];
      next[i] = next[j];
      next[j] = tmp;
      return { ...s, bloklar: next };
    });
  }

  function insertBlockAt(index: number, b: SayfaBlok) {
    setForm((s) => {
      const next = [...s.bloklar];
      const at = Math.max(0, Math.min(index, next.length));
      next.splice(at, 0, b);
      return { ...s, bloklar: next };
    });
    setOpenInsertGap(null);
  }

  /** zoneIndex: bırakılan çizginin konumu (0 = en üst) */
  function reorderBlockToZone(from: number, zoneIndex: number) {
    if (from === zoneIndex) return;
    setForm((s) => {
      const next = [...s.bloklar];
      const [item] = next.splice(from, 1);
      let ins = zoneIndex;
      if (from < zoneIndex) ins = zoneIndex - 1;
      next.splice(ins, 0, item);
      return { ...s, bloklar: next };
    });
  }

  async function addCurrentPageToHeaderMenu() {
    setErr("");
    setInfo("");
    const slug = sayfaSlugify(form.slug);
    const title = form.baslik.trim();
    if (!slug || !title) {
      setErr("Önce başlık girin; slug otomatik veya elle dolu olsun.");
      return;
    }
    const href = `/p/${slug}`;
    try {
      const res = await fetch(withBase("/api/panel/menus"), { cache: "no-store", credentials: "same-origin" });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        setErr("Menü okunamadı.");
        return;
      }
      const db = (await res.json()) as {
        header: { label: string; href: string; newTab?: boolean }[];
        footer: { label: string; href: string; newTab?: boolean }[];
      };
      if (db.header.some((x) => hrefEslestir(x.href, href))) {
        setErr("Bu adres zaten üst menüde.");
        return;
      }
      const res2 = await fetch(withBase("/api/panel/menus"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: "header",
          items: [...(db.header ?? []), { label: title, href }],
        }),
      });
      if (res2.status === 401) {
        router.refresh();
        return;
      }
      if (!res2.ok) {
        setErr("Menü güncellenemedi.");
        return;
      }
      setInfo("Üst menüye eklendi. Sırayı «Menüler» sekmesinden ayarlayabilirsiniz.");
      window.dispatchEvent(new Event("panel-menus-updated"));
    } catch {
      setErr("Menü güncellenemedi.");
    }
  }

  return (
    <div className="space-y-6">
      {!editorOnly ? (
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">Sayfalar</h1>
            <p className="text-sm text-[var(--muted)]">
              Panelden sayfa oluşturun. Yayındaki sayfalar URL: <code>/p/slug</code>
            </p>
          </div>
          <div className="w-full md:max-w-sm">
            <label className="sr-only" htmlFor="qpages">
              Ara
            </label>
            <input
              id="qpages"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ara: başlık, slug…"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--text)] outline-none ring-[var(--brand)] focus:ring-2"
            />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--brand)]/8 px-4 py-3 text-sm text-[var(--text)]">
          <strong className="font-semibold">Ek sayfa:</strong> Blokları <span className="text-[var(--muted)]">yukarıdan alta</span> ekleyin — sıra, sitedeki sıradır. Alttaki önizleme canlı güncellenir.
        </div>
      )}

      {err ? (
        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-700 dark:text-red-300">
          {err}
        </p>
      ) : null}
      {info ? (
        <p className="rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-800 dark:text-emerald-300">{info}</p>
      ) : null}

      <div className={editorOnly ? "space-y-6" : "grid gap-6 lg:grid-cols-[1fr_1.1fr]"}>
        {!editorOnly ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold text-[var(--text)]">Mevcut sayfalar</h2>
            <button
              type="button"
              onClick={() => void fetchList()}
              className="rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
            >
              Yenile
            </button>
          </div>
          <ul className="mt-4 divide-y divide-[var(--border)]">
            {filtered.map((s) => (
              <li key={s.slug} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <div className="font-medium text-[var(--text)]">{s.baslik}</div>
                  <div className="text-xs text-[var(--muted)]">
                    /p/{s.slug} · {s.yayin ? "Yayında" : "Taslak"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void loadToEdit(s.slug)}
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]"
                  >
                    Düzenle
                  </button>
                  <a
                    href={`/p/${encodeURIComponent(s.slug)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]"
                  >
                    Gör
                  </a>
                  <button
                    type="button"
                    onClick={() => void del(s.slug)}
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-500/10 dark:text-red-300"
                  >
                    Sil
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--muted)]">Henüz sayfa yok.</p>
          ) : null}
        </div>
        ) : null}

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <h2 className="font-semibold text-[var(--text)]">
            {editorOnly
              ? editSourceSlug !== null
                ? "İçeriği düzenle"
                : "Yeni ek sayfa"
              : editSourceSlug !== null
                ? "Sayfa düzenle"
                : "Yeni sayfa"}
          </h2>
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[var(--text)]">Slug</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  <input
                    value={form.slug}
                    onChange={(e) => {
                      slugFollowsTitleRef.current = false;
                      setForm((s) => ({ ...s, slug: e.target.value }));
                    }}
                    placeholder="or: hakkimizda"
                    className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      slugFollowsTitleRef.current = true;
                      setForm((s) => ({ ...s, slug: sayfaSlugify(s.baslik) || s.slug }));
                    }}
                    className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
                    title="Başlığı slug olarak kullan; sonra başlık değişince slug yine eşitlenir"
                  >
                    Başlıktan slug
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-[var(--muted)]">
                  Yeni sayfada başlık slug ile birlikte güncellenir. Slug alanına yazarsanız veya listeden düzenlerseniz bu
                  eşleşme durur.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)]">Başlık</label>
                <input
                  value={form.baslik}
                  onChange={(e) => {
                    const baslik = e.target.value;
                    setForm((s) => {
                      const norm = sayfaSlugify(s.slug);
                      const matchesExisting = !!norm && list.some((x) => x.slug === norm);
                      const slug =
                        slugFollowsTitleRef.current && !matchesExisting
                          ? sayfaSlugify(baslik)
                          : s.slug;
                      return { ...s, baslik, slug };
                    });
                  }}
                  placeholder="Örn. Hakkımızda"
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                />
              </div>
            </div>

            {slugTakenAsNew ? (
              <p className="rounded-lg bg-amber-500/15 px-3 py-2 text-xs text-amber-950 dark:text-amber-100">
                Bu slug zaten kullanılıyor. Mevcut sayfayı güncellemek için{" "}
                {editorOnly ? "soldaki listeden o sayfayı seçin" : "soldaki «Düzenle»ye basın"}; yeni sayfa için slugı
                değiştirin.
              </p>
            ) : null}

            <div>
              <label className="block text-sm font-medium text-[var(--text)]">Açıklama (SEO)</label>
              <input
                value={form.aciklama}
                onChange={(e) => setForm((s) => ({ ...s, aciklama: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
              />
            </div>

            <label className="flex cursor-pointer items-start gap-2 text-sm text-[var(--text)]">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={form.seoIndex}
                onChange={(e) => setForm((s) => ({ ...s, seoIndex: e.target.checked }))}
              />
              <span>
                Arama motorları indekslesin
                <span className="mt-0.5 block text-xs text-[var(--muted)]">
                  Kapalıyken sayfa yayında kalır; sitemap ve robots noindex uygulanır.
                </span>
              </span>
            </label>

            <div>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <label className="block text-sm font-medium text-[var(--text)]">İçerik (HTML)</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditorMode((m) => (m === "blocks" ? "html" : "blocks"))}
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]"
                  >
                    Mod: {editorMode === "blocks" ? "Blok" : "HTML"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview((v) => !v)}
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]"
                  >
                    {showPreview ? "Önizlemeyi gizle" : "Önizlemeyi göster"}
                  </button>
                </div>
              </div>

              {editorMode === "blocks" ? (
                <>
                  {showPreview ? (
                    <div className="mb-6 overflow-hidden rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--text)]">Sayfa önizlemesi (tıklayın)</p>
                          <p className="text-xs text-[var(--muted)]">
                            Üstte salon adı ve site menüsü (salt okunur) gerçek siteye yakın görünür. Gövdede bloğa tıklayın =
                            aşağıda düzenleme; kesik çizgiye tıklayın = oraya yeni blok.
                          </p>
                        </div>
                        {previewHref ? (
                          <a
                            href={previewHref}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]"
                          >
                            Sitede aç
                          </a>
                        ) : null}
                      </div>
                      <div
                        className="flex max-h-[min(70vh,640px)] flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)]"
                        onClick={(e) => {
                          const t = e.target as HTMLElement;
                          if (t.closest("a[href]")) e.preventDefault();
                        }}
                      >
                        {siteChrome ? (
                          <PanelPreviewSiteChrome
                            brand={siteChrome.brand}
                            links={siteChrome.header}
                            activePath={previewHref || "/"}
                          />
                        ) : null}
                        <div className="min-h-0 flex-1 space-y-0 overflow-y-auto p-4 sm:p-6">
                        <div
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setOpenInsertGap(0);
                              setOnizlemeSeciliBlok(null);
                              queueMicrotask(() =>
                                document.getElementById("panel-blok-bosluk-0")?.scrollIntoView({ behavior: "smooth", block: "center" })
                              );
                            }
                          }}
                          onClick={() => {
                            setOpenInsertGap(0);
                            setOnizlemeSeciliBlok(null);
                            queueMicrotask(() =>
                              document.getElementById("panel-blok-bosluk-0")?.scrollIntoView({ behavior: "smooth", block: "center" })
                            );
                          }}
                          className="mb-3 flex min-h-[2.5rem] cursor-pointer items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] text-center text-[11px] font-medium text-[var(--muted)] transition hover:border-[var(--brand)]/50 hover:text-[var(--text)]"
                        >
                          + En üste blok ekle (tıkla) — veya aşağıdaki çizgiden
                        </div>
                        {form.bloklar.length === 0 ? (
                          <p className="mb-3 text-center text-sm text-[var(--muted)]">İçerik yok. Üstteki alana veya aşağıdan ekleyin.</p>
                        ) : null}
                        {form.bloklar.map((b, i) => (
                          <Fragment key={`oniz-${i}`}>
                            <div
                              id={`panel-onizleme-blok-${i}`}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setOnizlemeSeciliBlok(i);
                                  setOpenInsertGap(null);
                                  queueMicrotask(() =>
                                    document.getElementById(`panel-blok-editor-${i}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
                                  );
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOnizlemeSeciliBlok(i);
                                setOpenInsertGap(null);
                                queueMicrotask(() =>
                                  document.getElementById(`panel-blok-editor-${i}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
                                );
                              }}
                              className={[
                                "mb-1 cursor-pointer rounded-xl border-2 p-3 text-left transition",
                                onizlemeSeciliBlok === i
                                  ? "border-[var(--brand)] bg-[var(--brand)]/8 shadow-sm"
                                  : "border-transparent hover:border-[var(--border)] hover:bg-[var(--surface)]/80",
                              ].join(" ")}
                            >
                              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand)]">
                                {BLOK_ETIKET[b.type] ?? b.type} — düzenlemek için tıklayın
                              </p>
                              <div
                                className="prose prose-neutral max-w-none dark:prose-invert prose-p:my-2 prose-headings:my-3 pointer-events-none select-none"
                                dangerouslySetInnerHTML={{
                                  __html: bloklardanHtml([b]) || `<p class="text-sm text-[var(--muted)]">(boş blok)</p>`,
                                }}
                              />
                            </div>
                            <div
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setOpenInsertGap(i + 1);
                                  setOnizlemeSeciliBlok(null);
                                  queueMicrotask(() =>
                                    document
                                      .getElementById(`panel-blok-bosluk-${i + 1}`)
                                      ?.scrollIntoView({ behavior: "smooth", block: "center" })
                                  );
                                }
                              }}
                              onClick={() => {
                                setOpenInsertGap(i + 1);
                                setOnizlemeSeciliBlok(null);
                                queueMicrotask(() =>
                                  document
                                    .getElementById(`panel-blok-bosluk-${i + 1}`)
                                    ?.scrollIntoView({ behavior: "smooth", block: "center" })
                                );
                              }}
                              className="mb-3 flex min-h-[2rem] cursor-pointer items-center justify-center rounded-lg border border-dashed border-[var(--border)]/80 text-[11px] text-[var(--muted)] transition hover:border-[var(--brand)]/50 hover:bg-[var(--brand)]/5 hover:text-[var(--text)]"
                            >
                              + Bu satırın altına blok ekle
                            </div>
                          </Fragment>
                        ))}
                        </div>
                      </div>
                    </div>
                  ) : null}

                <div className="mt-3 space-y-4">
                  <p className="text-xs text-[var(--muted)]">
                    <strong className="text-[var(--text)]">WordPress benzeri:</strong> Araya blok için çizgi üzerindeki{" "}
                    <span className="font-mono text-[var(--brand)]">+</span> düğmesini kullanın. Sırayı değiştirmek için soldaki{" "}
                    <span className="font-mono">⠿</span> tutup çizgilere bırakın (veya ↑ ↓).
                  </p>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      Sona ekle (veya aradaki + ile istediğiniz yere)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => addBlock({ type: "heading", text: "Başlık", level: 2 })} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]">+ Başlık</button>
                      <button type="button" onClick={() => addBlock({ type: "paragraph", text: "Paragraf metni…" })} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]">+ Paragraf</button>
                      <button type="button" onClick={() => addBlock({ type: "list", items: ["Madde 1", "Madde 2"] })} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]">+ Liste</button>
                      <button type="button" onClick={() => addBlock({ type: "quote", text: "Alıntı metni…", kaynak: "" })} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]">+ Alıntı</button>
                      <button type="button" onClick={() => addBlock({ type: "button", label: "Buton", href: "/randevu" })} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]">+ Buton</button>
                      <button type="button" onClick={() => addBlock({ type: "divider" })} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]">+ Ayırıcı</button>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Görsel ve medya</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMediaInsertAt(null);
                          setPickMedia(true);
                        }}
                        className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]"
                      >
                        + Görsel (medya, sona)
                      </button>
                      <button type="button" onClick={() => addBlock({ type: "video", url: "" })} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]">+ Video</button>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">İleri</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => addBlock({ type: "html", html: "<p>Özel HTML…</p>" })} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]">+ Özel HTML</button>
                    </div>
                  </div>

                  <BlokEkleCizgisi
                    zoneIndex={0}
                    rootId="panel-blok-bosluk-0"
                    paletAcik={openInsertGap === 0}
                    onPaletToggle={() => setOpenInsertGap((v) => (v === 0 ? null : 0))}
                    onInsert={(b) => insertBlockAt(0, b)}
                    onMedyaZone={(zone) => {
                      setMediaInsertAt(zone);
                      setPickMedia(true);
                      setOpenInsertGap(null);
                    }}
                    hedefVurgula={dragHedefBolge === 0}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      setDragHedefBolge(0);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const from = dragKaynakRef.current;
                      if (from !== null) reorderBlockToZone(from, 0);
                      setDragHedefBolge(null);
                      dragKaynakRef.current = null;
                    }}
                  />

                  {form.bloklar.length === 0 ? (
                    <p className="text-center text-sm text-[var(--muted)]">Henüz blok yok — üstteki çizgideki + ile veya yukarıdan ekleyin.</p>
                  ) : null}

                  <div className="space-y-1">
                    {form.bloklar.map((b, i) => (
                      <Fragment key={`blok-${i}`}>
                      <div
                        id={`panel-blok-editor-${i}`}
                        onFocusCapture={() => setOnizlemeSeciliBlok(i)}
                        className={[
                          "rounded-xl border bg-[var(--surface-2)] p-3 transition-shadow",
                          onizlemeSeciliBlok === i
                            ? "border-[var(--brand)] ring-2 ring-[var(--brand)]/40"
                            : "border-[var(--border)]",
                        ].join(" ")}
                      >
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = "move";
                              e.dataTransfer.setData("text/plain", String(i));
                              dragKaynakRef.current = i;
                            }}
                            onDragEnd={() => {
                              dragKaynakRef.current = null;
                              setDragHedefBolge(null);
                            }}
                            className="cursor-grab select-none rounded border border-transparent px-1.5 py-1 text-lg leading-none text-[var(--muted)] hover:border-[var(--border)] hover:bg-[var(--surface)] active:cursor-grabbing"
                            title="Sürükleyip çizgilere bırakın"
                            aria-label="Bloğu sürükle"
                          >
                            ⠿
                          </button>
                          <div className="min-w-0 flex-1 text-xs font-semibold text-[var(--muted)]">
                            {BLOK_ETIKET[b.type] ?? b.type}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => moveBlock(i, -1)} className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs font-medium hover:bg-[var(--surface)]">↑</button>
                            <button type="button" onClick={() => moveBlock(i, 1)} className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs font-medium hover:bg-[var(--surface)]">↓</button>
                            <button type="button" onClick={() => removeBlock(i)} className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-500/10 dark:text-red-300">Sil</button>
                          </div>
                        </div>

                        {b.type === "heading" ? (
                          <div className="grid gap-2 md:grid-cols-[1fr_180px] md:items-center">
                            <input value={b.text} onChange={(e) => updateBlock(i, { text: e.target.value })} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2" />
                            <select value={b.level ?? 2} onChange={(e) => updateBlock(i, { level: Number(e.target.value) as 2 | 3 })} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
                              <option value={2}>H2</option>
                              <option value={3}>H3</option>
                            </select>
                          </div>
                        ) : b.type === "paragraph" ? (
                          <textarea value={b.text} onChange={(e) => updateBlock(i, { text: e.target.value })} rows={3} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2" />
                        ) : b.type === "list" ? (
                          <textarea
                            value={(b.items ?? []).join("\n")}
                            onChange={(e) =>
                              updateBlock(i, { items: e.target.value.split("\n").filter(Boolean) })
                            }
                            rows={4}
                            placeholder={"Madde 1\nMadde 2"}
                            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                          />
                        ) : b.type === "button" ? (
                          <div className="grid gap-2 md:grid-cols-2">
                            <input value={b.label} onChange={(e) => updateBlock(i, { label: e.target.value })} placeholder="Label" className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2" />
                            <input value={b.href} onChange={(e) => updateBlock(i, { href: e.target.value })} placeholder="/randevu veya https://..." className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2" />
                            <label className="flex items-center gap-2 text-xs text-[var(--text)]">
                              <input type="checkbox" checked={!!b.newTab} onChange={(e) => updateBlock(i, { newTab: e.target.checked })} />
                              Yeni sekme
                            </label>
                          </div>
                        ) : b.type === "image" ? (
                          <div className="space-y-2">
                            <input value={b.src} onChange={(e) => updateBlock(i, { src: e.target.value })} placeholder="Görsel URL" className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2" />
                            <input value={b.alt} onChange={(e) => updateBlock(i, { alt: e.target.value })} placeholder="Alt" className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2" />
                            <input value={b.caption ?? ""} onChange={(e) => updateBlock(i, { caption: e.target.value })} placeholder="Caption (opsiyonel)" className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2" />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {b.src ? <img src={b.src} alt={b.alt} className="mt-2 max-h-48 w-full rounded-xl object-cover" /> : null}
                          </div>
                        ) : b.type === "quote" ? (
                          <div className="space-y-2">
                            <textarea
                              value={b.text}
                              onChange={(e) => updateBlock(i, { text: e.target.value })}
                              rows={4}
                              placeholder="Alıntı"
                              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                            />
                            <input
                              value={b.kaynak ?? ""}
                              onChange={(e) => updateBlock(i, { kaynak: e.target.value })}
                              placeholder="Kaynak (opsiyonel)"
                              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                            />
                          </div>
                        ) : b.type === "video" ? (
                          <div className="space-y-2">
                            <input
                              value={b.url}
                              onChange={(e) => updateBlock(i, { url: e.target.value })}
                              placeholder="YouTube veya Vimeo bağlantısı"
                              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                            />
                            <p className="text-xs text-[var(--muted)]">
                              Örn. https://www.youtube.com/watch?v=… veya https://youtu.be/… veya https://vimeo.com/…
                            </p>
                          </div>
                        ) : b.type === "divider" ? (
                          <p className="text-sm text-[var(--muted)]">Ayırıcı</p>
                        ) : (
                          <textarea value={b.type === "html" ? b.html : ""} onChange={(e) => updateBlock(i, { html: e.target.value })} rows={5} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2" />
                        )}
                      </div>
                      <BlokEkleCizgisi
                        zoneIndex={i + 1}
                        rootId={`panel-blok-bosluk-${i + 1}`}
                        paletAcik={openInsertGap === i + 1}
                        onPaletToggle={() => setOpenInsertGap((v) => (v === i + 1 ? null : i + 1))}
                        onInsert={(blk) => insertBlockAt(i + 1, blk)}
                        onMedyaZone={(zone) => {
                          setMediaInsertAt(zone);
                          setPickMedia(true);
                          setOpenInsertGap(null);
                        }}
                        hedefVurgula={dragHedefBolge === i + 1}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          setDragHedefBolge(i + 1);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const from = dragKaynakRef.current;
                          if (from !== null) reorderBlockToZone(from, i + 1);
                          setDragHedefBolge(null);
                          dragKaynakRef.current = null;
                        }}
                      />
                    </Fragment>
                    ))}
                  </div>
                </div>
                </>
              ) : (
                <div className="mt-3">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <button type="button" onClick={() => insertSnippet("<h2>Başlık</h2>\n")} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]">+ Başlık</button>
                    <button type="button" onClick={() => insertSnippet("<p>Paragraf metni…</p>\n")} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]">+ Paragraf</button>
                    <button type="button" onClick={() => insertSnippet("<ul>\n  <li>Madde 1</li>\n  <li>Madde 2</li>\n</ul>\n")} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]">+ Liste</button>
                    <button type="button" onClick={() => setPickMedia(true)} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]">+ Görsel</button>
                    <span className="mx-2 hidden h-6 w-px bg-[var(--border)] sm:block" />
                    <button type="button" onClick={() => wrapSelection("strong")} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]">Kalın</button>
                    <button type="button" onClick={() => wrapSelection("em")} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]">İtalik</button>
                    <button type="button" onClick={() => wrapSelection("u")} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]">Altı çizili</button>
                  </div>
                  <textarea
                    ref={htmlRef}
                    value={form.icerikHtml}
                    onChange={(e) => setForm((s) => ({ ...s, icerikHtml: e.target.value }))}
                    rows={10}
                    placeholder="<p>Merhaba…</p>"
                    className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                  />
                </div>
              )}
              <p className="mt-1 text-xs text-[var(--muted)]">
                Not: Demo için HTML kabul ediliyor. Üretimde editör + sanitize önerilir.
              </p>
            </div>

            {showPreview && editorMode !== "blocks" ? (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-[var(--text)]">Canlı önizleme</p>
                  {previewHref ? (
                    <a
                      href={previewHref}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]"
                    >
                      /p/{form.slug} aç
                    </a>
                  ) : null}
                </div>
                <div
                  className="prose prose-neutral mt-4 max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: previewHtml || "<p class='text-sm'>Önizleme için içerik ekleyin.</p>",
                  }}
                />
              </div>
            ) : null}

            {pickMedia ? (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--text)]">Medyadan görsel seç</p>
                  <button
                    type="button"
                    onClick={() => {
                      setPickMedia(false);
                      setMediaInsertAt(null);
                    }}
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]"
                  >
                    Kapat
                  </button>
                </div>
                <PanelMedia
                  onPickUrl={(url) => {
                    setPickMedia(false);
                    setOpenInsertGap(null);
                    if (editorMode === "blocks") {
                      const idx = mediaInsertAt;
                      setMediaInsertAt(null);
                      setForm((s) => {
                        const next = [...s.bloklar];
                        const at = idx ?? next.length;
                        next.splice(Math.max(0, Math.min(at, next.length)), 0, {
                          type: "image",
                          src: url,
                          alt: "Görsel",
                        });
                        return { ...s, bloklar: next };
                      });
                    } else {
                      insertImage(url);
                    }
                  }}
                />
              </div>
            ) : null}

            <label className="flex items-center gap-2 text-sm text-[var(--text)]">
              <input
                type="checkbox"
                checked={form.yayin}
                onChange={(e) => setForm((s) => ({ ...s, yayin: e.target.checked }))}
              />
              Yayında
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saving || slugTakenAsNew}
                onClick={() => void (editSourceSlug !== null ? saveEdit() : saveNew())}
                className="rounded-xl bg-[var(--brand)] px-5 py-2 text-sm font-semibold text-[var(--on-brand)] disabled:opacity-60"
              >
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </button>
              {sayfaSlugify(form.slug) && form.baslik.trim() ? (
                <button
                  type="button"
                  onClick={() => void addCurrentPageToHeaderMenu()}
                  className="rounded-xl border border-[var(--border)] px-5 py-2 text-sm font-medium hover:bg-[var(--surface-2)]"
                  title="Bağlantıyı üst menünün sonuna ekler"
                >
                  Üst menüye ekle
                </button>
              ) : null}
              {previewHref ? (
                <a
                  href={previewHref}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-[var(--border)] px-5 py-2 text-sm font-medium hover:bg-[var(--surface-2)]"
                >
                  Önizle
                </a>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  slugFollowsTitleRef.current = true;
                  setEditSourceSlug(null);
                  setForm({
                    slug: "",
                    baslik: "",
                    aciklama: "",
                    icerikHtml: "",
                    bloklar: [],
                    seoIndex: true,
                    yayin: true,
                  });
                }}
                className="rounded-xl border border-[var(--border)] px-5 py-2 text-sm font-medium hover:bg-[var(--surface-2)]"
              >
                Temizle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

