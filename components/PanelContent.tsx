"use client";

import { withBase } from "@/lib/base-path";
import type { GaleriGorsel, HizmetSatir, SiteIcerik } from "@/lib/content-store";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PanelMedia } from "@/components/PanelMedia";

function normalize(s: string) {
  return s.trim().toLocaleLowerCase("tr-TR");
}

export type PanelContentTab = "home" | "hizmetler" | "galeri" | "iletisim" | "qr_menu";

export type PanelContentProps = {
  /** Hub veya üst bileşen sekmeyi kontrol ederken */
  activeTab?: PanelContentTab;
  onTabChange?: (t: PanelContentTab) => void;
  /** `embedded`: tek başlık; site özeti hub’ında kullanılır */
  layout?: "standalone" | "embedded";
  /** Sol kenar çubuğu sekme seçiyorsa üst sekme şeridini gizle */
  hideTabBar?: boolean;
  /** Sayfa sırasını gösteren numaralı bölgeler (birleşik içerik görünümü) */
  visualZones?: boolean;
};

export function PanelContent(props: PanelContentProps = {}) {
  const layout = props.layout ?? "standalone";
  const hideTabBar = props.hideTabBar === true;
  const visualZones = props.visualZones === true;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [tabInternal, setTabInternal] = useState<PanelContentTab>("home");
  const tab = props.activeTab ?? tabInternal;
  function setTab(t: PanelContentTab) {
    props.onTabChange?.(t);
    if (props.activeTab === undefined) setTabInternal(t);
  }
  const [q, setQ] = useState("");
  const [pickMediaFor, setPickMediaFor] = useState<null | "homeHero" | "galeri">(null);

  const [form, setForm] = useState<SiteIcerik | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(withBase("/api/panel/content"), { cache: "no-store", credentials: "same-origin" });
      if (res.status === 401) {
        setLoading(false);
        router.refresh();
        return;
      }
      if (!res.ok) {
        setErr("İçerik yüklenemedi");
        setLoading(false);
        return;
      }
      const j = (await res.json()) as { icerik: SiteIcerik };
      setForm(j.icerik);
      setLoading(false);
    })().catch(() => {
      setErr("İçerik yüklenemedi");
      setLoading(false);
    });
  }, [router]);

  const filteredServices = useMemo(() => {
    if (!form) return [];
    const qn = normalize(q);
    const rows = form.hizmetler.rows;
    if (!qn) return rows;
    return rows.filter((r) => normalize(`${r.ad} ${r.sure} ${r.fiyat}`).includes(qn));
  }, [form, q]);

  const filteredGallery = useMemo(() => {
    if (!form) return [];
    const qn = normalize(q);
    const rows = form.galeri.images;
    if (!qn) return rows;
    return rows.filter((r) => normalize(`${r.alt} ${r.src}`).includes(qn));
  }, [form, q]);

  async function save() {
    if (!form) return;
    setSaving(true);
    setErr("");
    setOkMsg("");
    try {
      const res = await fetch(withBase("/api/panel/content"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-center text-[var(--muted)]">Yükleniyor…</p>;
  if (!form) return <p className="text-center text-[var(--muted)]">İçerik bulunamadı.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {layout === "standalone" ? (
            <>
              <h1 className="text-2xl font-bold text-[var(--text)]">İçerik yönetimi</h1>
              <p className="text-sm text-[var(--muted)]">
                Anasayfa, hizmetler, galeri ve iletişim sayfalarını buradan yönet.
              </p>
            </>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              Sabit şablon sayfalar: metin ve görseller aşağıdaki sekmelere göre ayrılmıştır. Kaydet tüm bu alanları
              günceller.
            </p>
          )}
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

      {err ? (
        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-700 dark:text-red-300">{err}</p>
      ) : null}
      {okMsg ? (
        <p className="rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-800 dark:text-emerald-300">{okMsg}</p>
      ) : null}

      {!hideTabBar ? (
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "home", label: "Anasayfa" },
              { id: "hizmetler", label: "Hizmetler" },
              { id: "galeri", label: "Galeri" },
              { id: "iletisim", label: "İletişim" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={
                tab === t.id
                  ? "rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--on-brand)]"
                  : "rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      ) : null}

      {tab === "home" ? (
        visualZones ? (
          <div className="space-y-8">
            <ContentZone
              step={1}
              title="Üst vitrin (Hero)"
              hint="Ziyaretçinin ilk gördüğü alan: küçük rozet, ana başlık, kısa metin, iki buton ve büyük görsel."
              preview={
                <div className="space-y-1 text-[var(--text)]">
                  <div className="rounded-md bg-[var(--surface-2)] px-2 py-1 text-[10px] font-medium text-[var(--muted)]">
                    {form.home.badge || "Rozet"}
                  </div>
                  <div className="text-sm font-bold leading-tight line-clamp-2">{form.home.baslik || "Başlık"}</div>
                  <div className="line-clamp-2 text-[11px] text-[var(--muted)]">{form.home.aciklama || "Açıklama"}</div>
                </div>
              }
            >
              <Field label="Badge (üst etiket)" value={form.home.badge} onChange={(v) => setForm((s) => ({ ...s!, home: { ...s!.home, badge: v } }))} />
              <Field label="Ana başlık" value={form.home.baslik} onChange={(v) => setForm((s) => ({ ...s!, home: { ...s!.home, baslik: v } }))} />
              <Textarea
                label="Kısa açıklama (hero altı)"
                value={form.home.aciklama}
                onChange={(v) => setForm((s) => ({ ...s!, home: { ...s!.home, aciklama: v } }))}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Buton 1 yazısı" value={form.home.ctaPrimaryLabel} onChange={(v) => setForm((s) => ({ ...s!, home: { ...s!.home, ctaPrimaryLabel: v } }))} />
                <Field label="Buton 1 link (href)" value={form.home.ctaPrimaryHref} onChange={(v) => setForm((s) => ({ ...s!, home: { ...s!.home, ctaPrimaryHref: v } }))} />
                <Field label="Buton 2 yazısı" value={form.home.ctaSecondaryLabel} onChange={(v) => setForm((s) => ({ ...s!, home: { ...s!.home, ctaSecondaryLabel: v } }))} />
                <Field label="Buton 2 link (href)" value={form.home.ctaSecondaryHref} onChange={(v) => setForm((s) => ({ ...s!, home: { ...s!.home, ctaSecondaryHref: v } }))} />
              </div>
              <Field
                label="Hero görsel adresi (URL)"
                value={form.home.heroImageSrc}
                onChange={(v) => setForm((s) => ({ ...s!, home: { ...s!.home, heroImageSrc: v } }))}
              />
              <Field
                label="Görsel açıklaması (SEO / erişilebilirlik)"
                value={form.home.heroImageAlt}
                onChange={(v) => setForm((s) => ({ ...s!, home: { ...s!.home, heroImageAlt: v } }))}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPickMediaFor("homeHero")}
                  className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]"
                >
                  Medyadan hero seç
                </button>
              </div>
            </ContentZone>

            <ContentZone
              step={2}
              title="Öne çıkan kartlar"
              hint="Hero’nun hemen altında; başlık + giriş metni + kart satırları."
              preview={
                <div className="text-[11px] text-[var(--muted)]">
                  <span className="font-medium text-[var(--text)]">{form.home.bolumBaslik || "Bölüm başlığı"}</span>
                  <p className="mt-1 line-clamp-3">{form.home.bolumAciklama || "Bölüm metni"}</p>
                </div>
              }
            >
              <Field
                label="Bölüm başlığı"
                value={form.home.bolumBaslik}
                onChange={(v) => setForm((s) => ({ ...s!, home: { ...s!.home, bolumBaslik: v } }))}
              />
              <Textarea
                label="Bölüm açıklaması"
                value={form.home.bolumAciklama}
                onChange={(v) => setForm((s) => ({ ...s!, home: { ...s!.home, bolumAciklama: v } }))}
              />

              <div className="mt-3 space-y-3">
                {form.home.features.map((f, i) => (
                  <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                    <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto] md:items-start">
                      <input
                        value={f.baslik}
                        onChange={(e) => {
                          const next = [...form.home.features];
                          next[i] = { ...next[i], baslik: e.target.value };
                          setForm((s) => ({ ...s!, home: { ...s!.home, features: next } }));
                        }}
                        placeholder="Kart başlık"
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                      />
                      <input
                        value={f.aciklama}
                        onChange={(e) => {
                          const next = [...form.home.features];
                          next[i] = { ...next[i], aciklama: e.target.value };
                          setForm((s) => ({ ...s!, home: { ...s!.home, features: next } }));
                        }}
                        placeholder="Kart açıklama"
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...form.home.features];
                          next.splice(i, 1);
                          setForm((s) => ({ ...s!, home: { ...s!.home, features: next } }));
                        }}
                        className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-500/10 dark:text-red-300"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setForm((s) => ({
                      ...s!,
                      home: { ...s!.home, features: [...s!.home.features, { baslik: "Yeni", aciklama: "Açıklama" }] },
                    }))
                  }
                  className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface-2)]"
                >
                  + Kart ekle
                </button>
              </div>
            </ContentZone>
          </div>
        ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Hero">
            <Field label="Badge" value={form.home.badge} onChange={(v) => setForm((s) => ({ ...s!, home: { ...s!.home, badge: v } }))} />
            <Field label="Başlık" value={form.home.baslik} onChange={(v) => setForm((s) => ({ ...s!, home: { ...s!.home, baslik: v } }))} />
            <Textarea
              label="Açıklama"
              value={form.home.aciklama}
              onChange={(v) => setForm((s) => ({ ...s!, home: { ...s!.home, aciklama: v } }))}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="CTA 1 Label" value={form.home.ctaPrimaryLabel} onChange={(v) => setForm((s) => ({ ...s!, home: { ...s!.home, ctaPrimaryLabel: v } }))} />
              <Field label="CTA 1 Href" value={form.home.ctaPrimaryHref} onChange={(v) => setForm((s) => ({ ...s!, home: { ...s!.home, ctaPrimaryHref: v } }))} />
              <Field label="CTA 2 Label" value={form.home.ctaSecondaryLabel} onChange={(v) => setForm((s) => ({ ...s!, home: { ...s!.home, ctaSecondaryLabel: v } }))} />
              <Field label="CTA 2 Href" value={form.home.ctaSecondaryHref} onChange={(v) => setForm((s) => ({ ...s!, home: { ...s!.home, ctaSecondaryHref: v } }))} />
            </div>
            <Field
              label="Hero görsel URL"
              value={form.home.heroImageSrc}
              onChange={(v) => setForm((s) => ({ ...s!, home: { ...s!.home, heroImageSrc: v } }))}
            />
            <Field
              label="Hero görsel alt"
              value={form.home.heroImageAlt}
              onChange={(v) => setForm((s) => ({ ...s!, home: { ...s!.home, heroImageAlt: v } }))}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPickMediaFor("homeHero")}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--surface-2)]"
              >
                Medyadan hero seç
              </button>
            </div>
          </Card>

          <Card title="Neden bu demo? (kartlar)">
            <Field
              label="Bölüm başlık"
              value={form.home.bolumBaslik}
              onChange={(v) => setForm((s) => ({ ...s!, home: { ...s!.home, bolumBaslik: v } }))}
            />
            <Textarea
              label="Bölüm açıklama"
              value={form.home.bolumAciklama}
              onChange={(v) => setForm((s) => ({ ...s!, home: { ...s!.home, bolumAciklama: v } }))}
            />

            <div className="mt-3 space-y-3">
              {form.home.features.map((f, i) => (
                <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                  <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto] md:items-start">
                    <input
                      value={f.baslik}
                      onChange={(e) => {
                        const next = [...form.home.features];
                        next[i] = { ...next[i], baslik: e.target.value };
                        setForm((s) => ({ ...s!, home: { ...s!.home, features: next } }));
                      }}
                      placeholder="Kart başlık"
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                    />
                    <input
                      value={f.aciklama}
                      onChange={(e) => {
                        const next = [...form.home.features];
                        next[i] = { ...next[i], aciklama: e.target.value };
                        setForm((s) => ({ ...s!, home: { ...s!.home, features: next } }));
                      }}
                      placeholder="Kart açıklama"
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...form.home.features];
                        next.splice(i, 1);
                        setForm((s) => ({ ...s!, home: { ...s!.home, features: next } }));
                      }}
                      className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-500/10 dark:text-red-300"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm((s) => ({ ...s!, home: { ...s!.home, features: [...s!.home.features, { baslik: "Yeni", aciklama: "Açıklama" }] } }))}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface-2)]"
              >
                + Kart ekle
              </button>
            </div>
          </Card>
        </div>
        )
      ) : tab === "hizmetler" ? (
        visualZones ? (
          <div className="space-y-8">
            <ContentZone
              step={1}
              title="Üst giriş metni"
              hint="Sayfanın üst kısmında, liste başlamadan önce görünür."
              preview={
                <p className="line-clamp-5 whitespace-pre-wrap text-[var(--muted)]">
                  {form.hizmetler.sayfaAciklama || "…"}
                </p>
              }
            >
              <Textarea
                label="Sayfa açıklaması"
                value={form.hizmetler.sayfaAciklama}
                onChange={(v) => setForm((s) => ({ ...s!, hizmetler: { ...s!.hizmetler, sayfaAciklama: v } }))}
              />
            </ContentZone>
            <ContentZone
              step={2}
              title="Hizmet ve fiyat tablosu"
              hint="Her satır sitede bir satır: hizmet adı, süre, fiyat."
              preview={<span className="text-[var(--muted)]">{form.hizmetler.rows.length} satır</span>}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="w-full md:max-w-sm">
                  <label className="sr-only" htmlFor="qhizmet">
                    Ara
                  </label>
                  <input
                    id="qhizmet"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Listede ara…"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--text)] outline-none ring-[var(--brand)] focus:ring-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForm((s) => ({
                      ...s!,
                      hizmetler: { ...s!.hizmetler, rows: [...s!.hizmetler.rows, { ad: "", sure: "", fiyat: "" }] },
                    }))
                  }
                  className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface-2)]"
                >
                  + Hizmet ekle
                </button>
              </div>
              <div className="space-y-3">
                {filteredServices.map((r, i) => (
                  <div key={i} className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 md:grid-cols-[1.2fr_0.6fr_0.6fr_auto] md:items-center">
                    <input
                      value={r.ad}
                      onChange={(e) => updateHizmet(setForm, i, { ad: e.target.value })}
                      placeholder="Hizmet"
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                    />
                    <input
                      value={r.sure}
                      onChange={(e) => updateHizmet(setForm, i, { sure: e.target.value })}
                      placeholder="Süre"
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                    />
                    <input
                      value={r.fiyat}
                      onChange={(e) => updateHizmet(setForm, i, { fiyat: e.target.value })}
                      placeholder="Fiyat"
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeHizmet(setForm, i)}
                      className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-500/10 dark:text-red-300"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </ContentZone>
          </div>
        ) : (
        <div className="space-y-4">
          <Card title="Hizmetler sayfası">
            <Textarea
              label="Sayfa açıklama"
              value={form.hizmetler.sayfaAciklama}
              onChange={(v) => setForm((s) => ({ ...s!, hizmetler: { ...s!.hizmetler, sayfaAciklama: v } }))}
            />
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="w-full md:max-w-sm">
              <label className="sr-only" htmlFor="qhizmet">Ara</label>
              <input
                id="qhizmet"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ara: hizmet…"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--text)] outline-none ring-[var(--brand)] focus:ring-2"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                setForm((s) => ({
                  ...s!,
                  hizmetler: { ...s!.hizmetler, rows: [...s!.hizmetler.rows, { ad: "", sure: "", fiyat: "" }] },
                }))
              }
              className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface-2)]"
            >
              + Hizmet ekle
            </button>
          </div>

          <Card title="Hizmet listesi">
            <div className="space-y-3">
              {filteredServices.map((r, i) => (
                <div key={i} className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 md:grid-cols-[1.2fr_0.6fr_0.6fr_auto] md:items-center">
                  <input
                    value={r.ad}
                    onChange={(e) => updateHizmet(setForm, i, { ad: e.target.value })}
                    placeholder="Hizmet"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                  />
                  <input
                    value={r.sure}
                    onChange={(e) => updateHizmet(setForm, i, { sure: e.target.value })}
                    placeholder="Süre"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                  />
                  <input
                    value={r.fiyat}
                    onChange={(e) => updateHizmet(setForm, i, { fiyat: e.target.value })}
                    placeholder="Fiyat"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeHizmet(setForm, i)}
                    className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-500/10 dark:text-red-300"
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
        )
      ) : tab === "galeri" ? (
        visualZones ? (
          <div className="space-y-8">
            <ContentZone
              step={1}
              title="Üst açıklama"
              hint="Galeri ızgarasının üstünde görünen metin."
              preview={<p className="line-clamp-4 text-[var(--muted)]">{form.galeri.sayfaAciklama || "…"}</p>}
            >
              <Textarea
                label="Sayfa açıklaması"
                value={form.galeri.sayfaAciklama}
                onChange={(v) => setForm((s) => ({ ...s!, galeri: { ...s!.galeri, sayfaAciklama: v } }))}
              />
            </ContentZone>
            <ContentZone
              step={2}
              title="Galeri görselleri"
              hint="Her satır bir kare; üstte adres (URL), altta kısa açıklama (alt)."
              preview={<span className="text-[var(--muted)]">{form.galeri.images.length} görsel</span>}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="w-full md:max-w-sm">
                  <label className="sr-only" htmlFor="qgaleri">
                    Ara
                  </label>
                  <input
                    id="qgaleri"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Görsellerde ara…"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--text)] outline-none ring-[var(--brand)] focus:ring-2"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPickMediaFor("galeri")}
                    className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface-2)]"
                  >
                    + Medyadan görsel ekle
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((s) => ({
                        ...s!,
                        galeri: { ...s!.galeri, images: [...s!.galeri.images, { src: "", alt: "" }] },
                      }))
                    }
                    className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface-2)]"
                  >
                    + URL ile ekle
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {filteredGallery.map((im, i) => (
                  <div key={i} className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 md:grid-cols-[1fr_1fr_auto] md:items-center">
                    <input
                      value={im.src}
                      onChange={(e) => updateGaleri(setForm, i, { src: e.target.value })}
                      placeholder="Görsel URL"
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                    />
                    <input
                      value={im.alt}
                      onChange={(e) => updateGaleri(setForm, i, { alt: e.target.value })}
                      placeholder="Alt"
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeGaleri(setForm, i)}
                      className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-500/10 dark:text-red-300"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </ContentZone>
            {pickMediaFor === "galeri" ? (
              <Card title="Medyadan seç">
                <PanelMedia
                  onPickUrl={(url) => {
                    setForm((s) => ({
                      ...s!,
                      galeri: { ...s!.galeri, images: [...s!.galeri.images, { src: url, alt: "Galeri görseli" }] },
                    }));
                    setPickMediaFor(null);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setPickMediaFor(null)}
                  className="mt-3 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface-2)]"
                >
                  Kapat
                </button>
              </Card>
            ) : null}
          </div>
        ) : (
        <div className="space-y-4">
          <Card title="Galeri sayfası">
            <Textarea
              label="Sayfa açıklama"
              value={form.galeri.sayfaAciklama}
              onChange={(v) => setForm((s) => ({ ...s!, galeri: { ...s!.galeri, sayfaAciklama: v } }))}
            />
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="w-full md:max-w-sm">
              <label className="sr-only" htmlFor="qgaleri">Ara</label>
              <input
                id="qgaleri"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ara: alt, url…"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--text)] outline-none ring-[var(--brand)] focus:ring-2"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPickMediaFor("galeri")}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface-2)]"
              >
                + Medyadan görsel ekle
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm((s) => ({
                    ...s!,
                    galeri: { ...s!.galeri, images: [...s!.galeri.images, { src: "", alt: "" }] },
                  }))
                }
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface-2)]"
              >
                + URL ile ekle
              </button>
            </div>
          </div>

          <Card title="Galeri görselleri">
            <div className="space-y-3">
              {filteredGallery.map((im, i) => (
                <div key={i} className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 md:grid-cols-[1fr_1fr_auto] md:items-center">
                  <input
                    value={im.src}
                    onChange={(e) => updateGaleri(setForm, i, { src: e.target.value })}
                    placeholder="Görsel URL"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                  />
                  <input
                    value={im.alt}
                    onChange={(e) => updateGaleri(setForm, i, { alt: e.target.value })}
                    placeholder="Alt"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeGaleri(setForm, i)}
                    className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-500/10 dark:text-red-300"
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {pickMediaFor === "galeri" ? (
            <Card title="Medyadan seç">
              <PanelMedia
                onPickUrl={(url) => {
                  setForm((s) => ({
                    ...s!,
                    galeri: { ...s!.galeri, images: [...s!.galeri.images, { src: url, alt: "Galeri görseli" }] },
                  }));
                  setPickMediaFor(null);
                }}
              />
              <button
                type="button"
                onClick={() => setPickMediaFor(null)}
                className="mt-3 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface-2)]"
              >
                Kapat
              </button>
            </Card>
          ) : null}
        </div>
        )
      ) : tab === "iletisim" ? (
        visualZones ? (
          <ContentZone
            step={1}
            title="İletişim metinleri"
            hint="Sayfadaki giriş paragrafı ve WhatsApp için hazır mesaj. Adres ve saatler Ayarlar’dadır."
            preview={
              <div className="space-y-2">
                <p className="line-clamp-3 text-[var(--muted)]">{form.iletisim.sayfaAciklama || "…"}</p>
                <p className="text-[10px] text-[var(--muted)]">WA: {form.iletisim.whatsappMesaj?.slice(0, 40) || "…"}</p>
              </div>
            }
          >
            <Textarea
              label="Sayfa açıklama"
              value={form.iletisim.sayfaAciklama}
              onChange={(v) => setForm((s) => ({ ...s!, iletisim: { ...s!.iletisim, sayfaAciklama: v } }))}
            />
            <Textarea
              label="WhatsApp mesaj şablonu"
              value={form.iletisim.whatsappMesaj}
              onChange={(v) => setForm((s) => ({ ...s!, iletisim: { ...s!.iletisim, whatsappMesaj: v } }))}
            />
            <p className="text-xs text-[var(--muted)]">Adres ve saatler “Ayarlar” bölümünden gelir.</p>
          </ContentZone>
        ) : (
        <Card title="İletişim sayfası">
          <Textarea
            label="Sayfa açıklama"
            value={form.iletisim.sayfaAciklama}
            onChange={(v) => setForm((s) => ({ ...s!, iletisim: { ...s!.iletisim, sayfaAciklama: v } }))}
          />
          <Textarea
            label="WhatsApp mesaj şablonu"
            value={form.iletisim.whatsappMesaj}
            onChange={(v) => setForm((s) => ({ ...s!, iletisim: { ...s!.iletisim, whatsappMesaj: v } }))}
          />
          <p className="mt-2 text-xs text-[var(--muted)]">
            Adres ve saatler “Ayarlar” bölümünden gelir.
          </p>
        </Card>
        )
      ) : null}

      {pickMediaFor === "homeHero" ? (
        <Card title="Medyadan hero seç">
          <PanelMedia
            onPickUrl={(url) => {
              setForm((s) => ({ ...s!, home: { ...s!.home, heroImageSrc: url } }));
              setPickMediaFor(null);
            }}
          />
          <button
            type="button"
            onClick={() => setPickMediaFor(null)}
            className="mt-3 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface-2)]"
          >
            Kapat
          </button>
        </Card>
      ) : null}
    </div>
  );
}

function ContentZone(props: {
  step: number;
  title: string;
  hint: string;
  preview?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--brand)]">Adım {props.step}</div>
          <h3 className="mt-0.5 font-semibold text-[var(--text)]">{props.title}</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">{props.hint}</p>
        </div>
        {props.preview ? (
          <div className="max-w-[220px] shrink-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 text-xs text-[var(--text)]">
            {props.preview}
          </div>
        ) : null}
      </div>
      <div className="space-y-4 p-5">{props.children}</div>
    </div>
  );
}

function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <h2 className="font-semibold text-[var(--text)]">{props.title}</h2>
      <div className="mt-4 space-y-4">{props.children}</div>
    </div>
  );
}

function Field(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text)]">{props.label}</label>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
      />
    </div>
  );
}

function Textarea(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text)]">{props.label}</label>
      <textarea
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        rows={4}
        className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm outline-none ring-[var(--brand)] focus:ring-2"
      />
    </div>
  );
}

function updateHizmet(
  setForm: React.Dispatch<React.SetStateAction<SiteIcerik | null>>,
  i: number,
  patch: Partial<HizmetSatir>
) {
  setForm((prev) => {
    if (!prev) return prev;
    const rows = [...prev.hizmetler.rows];
    rows[i] = { ...rows[i], ...patch };
    return { ...prev, hizmetler: { ...prev.hizmetler, rows } };
  });
}

function removeHizmet(
  setForm: React.Dispatch<React.SetStateAction<SiteIcerik | null>>,
  i: number
) {
  setForm((prev) => {
    if (!prev) return prev;
    const rows = [...prev.hizmetler.rows];
    rows.splice(i, 1);
    return { ...prev, hizmetler: { ...prev.hizmetler, rows } };
  });
}

function updateGaleri(
  setForm: React.Dispatch<React.SetStateAction<SiteIcerik | null>>,
  i: number,
  patch: Partial<GaleriGorsel>
) {
  setForm((prev) => {
    if (!prev) return prev;
    const images = [...prev.galeri.images];
    images[i] = { ...images[i], ...patch };
    return { ...prev, galeri: { ...prev.galeri, images } };
  });
}

function removeGaleri(
  setForm: React.Dispatch<React.SetStateAction<SiteIcerik | null>>,
  i: number
) {
  setForm((prev) => {
    if (!prev) return prev;
    const images = [...prev.galeri.images];
    images.splice(i, 1);
    return { ...prev, galeri: { ...prev.galeri, images } };
  });
}

