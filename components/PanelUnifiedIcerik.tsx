"use client";
import { useWithBase } from "@/components/SitePrefixProvider";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PanelContent, type PanelContentTab } from "@/components/PanelContent";
import { PanelIcerikHeaderMenu } from "@/components/PanelIcerikHeaderMenu";
import { PanelPages } from "@/components/PanelPages";
import { PanelQrMenuTab } from "@/components/PanelQrMenuTab";
import { isPanelContentTab, type VfIcerikSnapshot } from "@/lib/panel-deeplink";

type CmsRow = { slug: string; baslik: string; yayin: boolean };

type Secim =
  | { tur: "sablon"; sekme: PanelContentTab }
  | { tur: "ek"; slug: string | "yeni" };

function secimFromVfSnapshot(s: VfIcerikSnapshot | null): Secim {
  if (!s) return { tur: "sablon", sekme: "home" };
  if (s.slug) return { tur: "ek", slug: s.slug };
  if (s.sablon) return { tur: "sablon", sekme: s.sablon };
  return { tur: "sablon", sekme: "home" };
}

const SABLONLAR: { sekme: PanelContentTab; baslik: string; yol: string; kisa: string }[] = [
  { sekme: "home", baslik: "Anasayfa", yol: "/anasayfa", kisa: "Hero + kartlar" },
  { sekme: "hizmetler", baslik: "Hizmetler", yol: "/hizmetler", kisa: "Liste + fiyat" },
  { sekme: "galeri", baslik: "Galeri", yol: "/galeri", kisa: "Görseller" },
  { sekme: "iletisim", baslik: "İletişim", yol: "/iletisim", kisa: "Metin + WhatsApp" },
  { sekme: "qr_menu", baslik: "QR menü", yol: "/qr-menu", kisa: "Kategori + ürün" },
];

export type PanelUnifiedIcerikProps = {
  /** URL’deki vf_sablon / vf_slug — sessionStorage yerine (Strict Mode uyumlu) */
  vfSnapshot?: VfIcerikSnapshot | null;
};

export function PanelUnifiedIcerik(props: PanelUnifiedIcerikProps = {}) {
  const wb = useWithBase();
  const router = useRouter();
  const vfSnap = props.vfSnapshot ?? null;
  const [secim, setSecim] = useState<Secim>(() => secimFromVfSnapshot(vfSnap));
  const [cmsSatirlar, setCmsSatirlar] = useState<CmsRow[]>([]);
  const [yukleniyorListe, setYukleniyorListe] = useState(true);
  const [sidebarQ, setSidebarQ] = useState("");
  const [cmsMountKey, setCmsMountKey] = useState(0);

  const cmsYukle = useCallback(async () => {
    setYukleniyorListe(true);
    try {
      const res = await fetch(wb("/api/panel/pages"), { cache: "no-store", credentials: "same-origin" });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) return;
      const j = (await res.json()) as { sayfalar: CmsRow[] };
      setCmsSatirlar(j.sayfalar ?? []);
    } finally {
      setYukleniyorListe(false);
    }
  }, [router, wb]);

  useEffect(() => {
    queueMicrotask(() => {
      void cmsYukle();
    });
  }, [cmsYukle]);

  useEffect(() => {
    const s = props.vfSnapshot;
    if (!s) return;
    queueMicrotask(() => {
      if (s.slug) {
        setSecim({ tur: "ek", slug: s.slug });
        setCmsMountKey((k) => k + 1);
        return;
      }
      if (s.sablon && isPanelContentTab(s.sablon)) {
        setSecim({ tur: "sablon", sekme: s.sablon });
      }
    });
  }, [props.vfSnapshot]);

  const cmsFiltreli = useMemo(() => {
    const q = sidebarQ.trim().toLocaleLowerCase("tr-TR");
    if (!q) return cmsSatirlar;
    return cmsSatirlar.filter((x) =>
      `${x.baslik} ${x.slug}`.toLocaleLowerCase("tr-TR").includes(q)
    );
  }, [cmsSatirlar, sidebarQ]);

  async function cmsSil(slug: string) {
    if (!confirm(`Bu ek sayfa silinsin mi?\n/p/${slug}`)) return;
    const res = await fetch(wb(`/api/panel/pages/${encodeURIComponent(slug)}`), { method: "DELETE" });
    if (res.status === 401) {
      router.refresh();
      return;
    }
    if (!res.ok) return;
    if (secim.tur === "ek" && secim.slug === slug) {
      setSecim({ tur: "ek", slug: "yeni" });
      setCmsMountKey((k) => k + 1);
    }
    await cmsYukle();
  }

  const cmsFocus =
    secim.tur === "ek" && secim.slug !== "yeni" ? secim.slug : null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[var(--text)]">İçerik</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Soldan düzenlemek istediğiniz sayfayı seçin; <strong className="font-medium text-[var(--text)]">Site menüsü</strong> ile
          üst çubuktaki linkleri bu ekrandan yönetebilirsiniz. Ek sayfalar blok önizlemesi ve tıklayarak ekleme ile düzenlenir.
        </p>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 space-y-4 lg:sticky lg:top-4 lg:w-72 lg:max-w-[min(100%,18rem)]">
          <div>
            <label className="sr-only" htmlFor="sidebar-icerik-q">
              Sayfa ara
            </label>
            <input
              id="sidebar-icerik-q"
              value={sidebarQ}
              onChange={(e) => setSidebarQ(e.target.value)}
              placeholder="Sayfa ara…"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none ring-[var(--brand)] focus:ring-2"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Site şablonları</p>
            <nav className="flex flex-col gap-1" aria-label="Şablon sayfalar">
              {SABLONLAR.map((s) => (
                <button
                  key={s.sekme}
                  type="button"
                  onClick={() => setSecim({ tur: "sablon", sekme: s.sekme })}
                  className={[
                    "rounded-xl px-3 py-2.5 text-left text-sm transition",
                    secim.tur === "sablon" && secim.sekme === s.sekme
                      ? "bg-[var(--brand)] font-semibold text-[var(--on-brand)]"
                      : "border border-transparent text-[var(--text)] hover:bg-[var(--surface-2)]",
                  ].join(" ")}
                >
                  <span className="block font-medium">{s.baslik}</span>
                  <span className="block text-[11px] opacity-90">{s.yol} · {s.kisa}</span>
                </button>
              ))}
            </nav>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Site menüsü</p>
            <PanelIcerikHeaderMenu />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Ek sayfalar</p>
              <button
                type="button"
                onClick={() => {
                  setSecim({ tur: "ek", slug: "yeni" });
                  setCmsMountKey((k) => k + 1);
                }}
                className="rounded-lg bg-[var(--surface-2)] px-2 py-1 text-[11px] font-semibold text-[var(--text)] hover:bg-[var(--border)]"
              >
                + Yeni
              </button>
            </div>
            {yukleniyorListe ? (
              <p className="text-xs text-[var(--muted)]">Liste…</p>
            ) : cmsFiltreli.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--border)] px-3 py-4 text-xs text-[var(--muted)]">
                Ek sayfa yok. «+ Yeni» ile oluşturun.
              </p>
            ) : (
              <ul className="flex max-h-[min(50vh,28rem)] flex-col gap-1 overflow-y-auto pr-1">
                {cmsFiltreli.map((p) => (
                  <li
                    key={p.slug}
                    className={[
                      "flex flex-col gap-1 rounded-xl border px-2 py-2 text-xs",
                      secim.tur === "ek" && secim.slug === p.slug
                        ? "border-[var(--brand)] bg-[var(--brand)]/10"
                        : "border-[var(--border)] bg-[var(--surface)]",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      onClick={() => setSecim({ tur: "ek", slug: p.slug })}
                      className="text-left font-medium text-[var(--text)]"
                    >
                      {p.baslik}
                      <span className="mt-0.5 block font-normal text-[var(--muted)]">
                        /p/{p.slug} · {p.yayin ? "yayında" : "taslak"}
                      </span>
                    </button>
                    <div className="flex flex-wrap gap-1">
                      <a
                        href={wb(`/p/${encodeURIComponent(p.slug)}`)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border border-[var(--border)] px-2 py-0.5 text-[11px] hover:bg-[var(--surface-2)]"
                      >
                        Sitede aç
                      </a>
                      <button
                        type="button"
                        onClick={() => void cmsSil(p.slug)}
                        className="rounded-md border border-red-500/30 px-2 py-0.5 text-[11px] text-red-700 hover:bg-red-500/10 dark:text-red-300"
                      >
                        Sil
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <section className="min-w-0 flex-1 space-y-4">
          {secim.tur === "sablon" ? (
            secim.sekme === "qr_menu" ? (
              <PanelQrMenuTab />
            ) : (
              <PanelContent
                layout="embedded"
                hideTabBar
                visualZones
                activeTab={secim.sekme}
                onTabChange={(sekme) => setSecim({ tur: "sablon", sekme })}
              />
            )
          ) : (
            <PanelPages
              key={`ek-${secim.slug}-${cmsMountKey}`}
              layout="editorOnly"
              focusSlug={cmsFocus}
              onFocusSlugHandled={() => {}}
              onSaved={() => void cmsYukle()}
            />
          )}
        </section>
      </div>
    </div>
  );
}
